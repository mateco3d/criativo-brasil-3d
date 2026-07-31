/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   POST /api/mp-webhook
   -------------------------------------------------------------------
   Recebe as notificações do Mercado Pago quando o status de um
   pagamento muda (aprovado, pendente, rejeitado, etc). Para cada
   notificação, busca os dados oficiais do pagamento na API do
   Mercado Pago (nunca confiamos em dados vindos só do webhook) e
   atualiza o pedido correspondente no banco de dados.

   Quando um pedido passa a "Processando" (pagamento aprovado) pela
   primeira vez, envia um e-mail de notificação para a loja (ver
   api/_email.js) e marca o pedido como notificado para não enviar
   e-mail duplicado em reentregas do webhook.

   Sempre responde 200 rapidamente (mesmo em erros internos) para
   evitar que o Mercado Pago fique reenviando a notificação
   indefinidamente — erros são só logados.
=================================================================== */

const { sql, ensureSchema } = require('./_db');
const { sendNewOrderEmail } = require('./_email');

const STATUS_BY_MP = {
  approved: 'Processando',
  pending: 'Aguardando Pagamento',
  in_process: 'Aguardando Pagamento',
  authorized: 'Aguardando Pagamento',
  in_mediation: 'Aguardando Pagamento',
  rejected: 'Cancelado',
  cancelled: 'Cancelado',
  refunded: 'Cancelado',
  charged_back: 'Cancelado',
};

module.exports = async function handler(req, res) {
  // O Mercado Pago pode chamar com GET (verificação) ou POST (notificação real)
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  try {
    await ensureSchema();

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    // O id do pagamento pode vir em vários formatos, dependendo do tipo
    // de notificação (webhook novo "topic=payment" ou IPN legado).
    const query = req.query || {};
    const paymentId =
      (body.data && body.data.id) ||
      query.id ||
      query['data.id'] ||
      (body.resource && String(body.resource).split('/').pop());

    const topic = body.type || body.topic || query.type || query.topic;

    if (!paymentId || (topic && topic !== 'payment')) {
      // Notificação de outro tipo (ex: "merchant_order") ou sem id — ignora.
      res.status(200).json({ received: true });
      return;
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.log('Webhook recebido, mas MP_ACCESS_TOKEN não está configurado.');
      res.status(200).json({ received: true });
      return;
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!mpRes.ok) {
      console.log('Falha ao buscar pagamento no Mercado Pago:', mpRes.status, await mpRes.text());
      res.status(200).json({ received: true });
      return;
    }
    const payment = await mpRes.json();

    const orderCode = payment.external_reference;
    const mpStatus = payment.status; // approved | pending | in_process | rejected | ...
    if (!orderCode) {
      res.status(200).json({ received: true });
      return;
    }

    const internalStatus = STATUS_BY_MP[mpStatus] || 'Aguardando Pagamento';

    const { rows } = await sql`
      UPDATE orders
      SET status = ${internalStatus},
          mp_payment_id = ${String(payment.id)},
          mp_status = ${mpStatus},
          updated_at = now()
      WHERE id = ${orderCode}
      RETURNING id, cliente, email, telefone, total, notified
    `;

    const order = rows[0];
    if (order && internalStatus === 'Processando' && !order.notified) {
      try {
        const { rows: items } = await sql`
          SELECT product_id, name, cat, qty, price FROM order_items WHERE order_id = ${orderCode}
        `;
        await sendNewOrderEmail(order, items);
        await sql`UPDATE orders SET notified = true WHERE id = ${orderCode}`;
      } catch (mailErr) {
        console.log('Falha ao enviar e-mail de notificação:', mailErr);
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.log('Erro no webhook do Mercado Pago:', err);
    // Mesmo com erro, respondemos 200 para não gerar reentregas em loop
    // enquanto investigamos — o pagamento pode ser reconciliado depois.
    res.status(200).json({ received: true });
  }
};
