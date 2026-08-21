/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   POST /api/pagbank-webhook
   -------------------------------------------------------------------
   Recebe as notificações da PagBank quando o status de um checkout ou
   pagamento muda (pago, em análise, recusado, cancelado, etc). Para
   cada notificação, busca os dados oficiais do pedido na API da
   PagBank (nunca confiamos em dados vindos só do webhook) e atualiza
   o pedido correspondente no banco de dados — mesmo padrão de
   segurança que já era usado no api/mp-webhook.js.

   Quando um pedido passa a "Processando" (pagamento aprovado) pela
   primeira vez, envia um e-mail de notificação para a loja (ver
   api/_email.js) e marca o pedido como notificado para não enviar
   e-mail duplicado em reentregas do webhook.

   Sempre responde 200 rapidamente (mesmo em erros internos) para
   evitar que a PagBank fique reenviando a notificação indefinidamente
   — erros são só logados.

   ATENÇÃO — formato do payload: a documentação da PagBank não deixa
   100% claro o formato exato do corpo enviado a
   payment_notification_urls/notification_urls (varia entre "id do
   checkout", "id do pedido" e "id da cobrança" dependendo do evento).
   Por isso este handler tenta várias chaves comuns e sempre reconsulta
   a PagBank pelo id encontrado antes de confiar em qualquer status.

   Sandbox vs. produção: a URL de notificação enviada pra PagBank em
   api/create-checkout-pagbank.js já vem com ?sandbox=1 quando o
   checkout foi criado em modo sandbox — então decidimos aqui, por
   pedido (via query string), qual API reconsultar. Isso é proposital:
   nunca usamos uma variável de ambiente global pra isso, pra não haver
   nenhum risco de um interruptor esquecido ligado afetar o checkout
   real da loja.
=================================================================== */

const { sql, ensureSchema } = require('./_db');
const { sendNewOrderEmail } = require('./_email');

const STATUS_BY_PAGBANK = {
  PAID: 'Processando',
  AUTHORIZED: 'Processando',
  WAITING: 'Aguardando Pagamento',
  IN_ANALYSIS: 'Aguardando Pagamento',
  ACTIVE: 'Aguardando Pagamento',
  DECLINED: 'Cancelado',
  CANCELED: 'Cancelado',
  EXPIRED: 'Cancelado',
  REFUNDED: 'Cancelado',
};

module.exports = async function handler(req, res) {
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
    const query = req.query || {};

    // O identificador pode vir em formatos diferentes dependendo do tipo
    // de evento (checkout criado/pago, cobrança individual, etc). Tenta
    // achar um id de pedido (ORDE_...) ou de checkout (CHEC_...) em
    // qualquer um dos formatos mais comuns antes de desistir.
    const candidateId =
      body.id ||
      (body.charges && body.charges[0] && body.charges[0].id) ||
      (body.data && body.data.id) ||
      query.id ||
      query.notificationCode;

    if (!candidateId) {
      console.log('Webhook da PagBank sem id reconhecível, ignorando. Body:', JSON.stringify(body));
      res.status(200).json({ received: true });
      return;
    }

    const isSandbox = query.sandbox === '1';
    const token = isSandbox ? process.env.PAGBANK_SANDBOX_TOKEN : process.env.PAGBANK_TOKEN;
    if (!token) {
      const varName = isSandbox ? 'PAGBANK_SANDBOX_TOKEN' : 'PAGBANK_TOKEN';
      console.log(`Webhook recebido, mas ${varName} não está configurado.`);
      res.status(200).json({ received: true });
      return;
    }
    const apiBase = isSandbox ? 'https://sandbox.api.pagseguro.com' : 'https://api.pagseguro.com';

    // Reconsulta o pedido oficial na PagBank (nunca confia só no webhook).
    // Se o id recebido for de um pedido (ORDE_...), consulta direto; se for
    // de uma cobrança (CHAR_...), consulta por charge_id.
    let order;
    try {
      const isCharge = String(candidateId).startsWith('CHAR');
      const url = isCharge
        ? `${apiBase}/orders?charge_id=${encodeURIComponent(candidateId)}`
        : `${apiBase}/orders/${encodeURIComponent(candidateId)}`;
      const pbRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!pbRes.ok) {
        console.log('Falha ao buscar pedido na PagBank:', pbRes.status, await pbRes.text());
        res.status(200).json({ received: true });
        return;
      }
      const data = await pbRes.json();
      order = isCharge ? (Array.isArray(data.orders) ? data.orders[0] : data) : data;
    } catch (err) {
      console.log('Erro ao consultar pedido na PagBank:', err);
      res.status(200).json({ received: true });
      return;
    }

    if (!order) {
      res.status(200).json({ received: true });
      return;
    }

    const orderCode = order.reference_id;
    const charges = order.charges || [];
    const lastCharge = charges[charges.length - 1];
    const pbStatus = (lastCharge && lastCharge.status) || order.status;
    if (!orderCode || !pbStatus) {
      res.status(200).json({ received: true });
      return;
    }

    const internalStatus = STATUS_BY_PAGBANK[pbStatus] || 'Aguardando Pagamento';

    const { rows } = await sql`
      UPDATE orders
      SET status = ${internalStatus},
          pagbank_order_id = ${order.id || null},
          pagbank_status = ${pbStatus},
          updated_at = now()
      WHERE id = ${orderCode}
      RETURNING id, cliente, email, telefone, total, notified
    `;

    const savedOrder = rows[0];
    if (savedOrder && internalStatus === 'Processando' && !savedOrder.notified) {
      try {
        const { rows: items } = await sql`
          SELECT product_id, name, cat, qty, price FROM order_items WHERE order_id = ${orderCode}
        `;
        await sendNewOrderEmail(savedOrder, items);
        await sql`UPDATE orders SET notified = true WHERE id = ${orderCode}`;
      } catch (mailErr) {
        console.log('Falha ao enviar e-mail de notificação:', mailErr);
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.log('Erro no webhook da PagBank:', err);
    // Mesmo com erro, respondemos 200 para não gerar reentregas em loop.
    res.status(200).json({ received: true });
  }
};
