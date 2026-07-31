/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   POST /api/mp-webhook
   -------------------------------------------------------------------
   Endpoint de notificação (IPN/webhook) do Mercado Pago. Hoje a loja
   ainda não tem banco de dados, então este endpoint só confirma o
   recebimento (200 OK) para o Mercado Pago não ficar reenviando o
   aviso. Quando a loja migrar para um banco real (ver
   docs/ARQUITETURA.md), este é o lugar certo para buscar o pagamento
   pela API do Mercado Pago (usando o "id" recebido aqui) e atualizar
   o status do pedido correspondente.
=================================================================== */

module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  // Loga para depuração nos Logs do projeto no Vercel.
  console.log('Notificação Mercado Pago recebida:', JSON.stringify(req.query || {}), JSON.stringify(req.body || {}));
  res.status(200).json({ received: true });
};
