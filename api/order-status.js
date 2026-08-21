/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   GET /api/order-status?id=CB3D-XXXXXX
   -------------------------------------------------------------------
   Endpoint público (sem login) usado pela página pedido-confirmado.html
   para saber o status REAL de um pedido depois que o cliente volta da
   PagBank. Necessário porque, diferente do Mercado Pago (que acrescen-
   tava parâmetros como collection_status/status na própria URL de
   retorno), a PagBank não garante isso — o status confiável só existe
   no nosso banco de dados, atualizado pelo webhook (api/pagbank-webhook.js)
   quando a PagBank confirma o pagamento.

   Por segurança/privacidade, devolve só o mínimo necessário para a tela
   de confirmação (id, status, total) — nunca e-mail, endereço, CPF ou
   telefone do cliente, mesmo que alguém tente adivinhar/copiar um
   código de pedido.
=================================================================== */

const { sql, ensureSchema } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido. Use GET.' });
    return;
  }

  const id = req.query && req.query.id;
  if (!id) {
    res.status(400).json({ error: 'Parâmetro id é obrigatório.' });
    return;
  }

  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT id, status, total FROM orders WHERE id = ${id}
    `;
    const order = rows[0];
    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado.' });
      return;
    }
    res.status(200).json({ id: order.id, status: order.status, total: order.total });
  } catch (err) {
    console.log('Erro ao consultar status do pedido:', err);
    res.status(500).json({ error: 'Falha ao consultar o status do pedido.' });
  }
};
