/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   GET   /api/orders        → lista os pedidos reais (painel admin)
   PATCH /api/orders        → atualiza status / marca como visto
   -------------------------------------------------------------------
   Protegido por Basic Auth (ver api/_auth.js e middleware.js). Lê e
   escreve na tabela `orders`/`order_items` do Postgres (Neon) — ver
   api/_db.js para o schema.
=================================================================== */

const { sql, ensureSchema } = require('./_db');
const { requireAdmin } = require('./_auth');
const { sendShippedEmail } = require('./_email');

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  await ensureSchema();

  if (req.method === 'GET') {
    const { rows: orders } = await sql`
      SELECT id, cliente, email, telefone, total, subtotal, shipping, discount,
             status, mp_payment_id, mp_status, seen, created_at, updated_at,
             cpf, cep, rua, numero, complemento, bairro, cidade, uf, shipping_label,
             tracking_code
      FROM orders
      ORDER BY created_at DESC
      LIMIT 300
    `;
    const ids = orders.map((o) => o.id);
    let itemsByOrder = {};
    if (ids.length) {
      const { rows: items } = await sql`
        SELECT order_id, product_id, name, cat, qty, price
        FROM order_items
        WHERE order_id = ANY(${ids})
      `;
      items.forEach((it) => {
        (itemsByOrder[it.order_id] ||= []).push(it);
      });
    }
    const result = orders.map((o) => ({ ...o, itemsDetail: itemsByOrder[o.id] || [] }));
    res.status(200).json({ orders: result });
    return;
  }

  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = null; }
    }
    if (!body) { res.status(400).json({ error: 'Corpo inválido.' }); return; }

    if (body.markAllSeen) {
      await sql`UPDATE orders SET seen = true WHERE seen = false`;
      res.status(200).json({ ok: true });
      return;
    }

    if (!body.id) { res.status(400).json({ error: 'id é obrigatório.' }); return; }

    if (body.status) {
      await sql`UPDATE orders SET status = ${body.status}, updated_at = now() WHERE id = ${body.id}`;
    }
    if (body.seen !== undefined) {
      await sql`UPDATE orders SET seen = ${body.seen} WHERE id = ${body.id}`;
    }
    // Código de rastreio: só grava (e só notifica o cliente por e-mail) se o
    // valor for realmente novo/diferente do que já estava salvo — evita
    // reenviar o e-mail toda vez que o admin salvar o mesmo pedido de novo.
    if (body.trackingCode !== undefined && String(body.trackingCode).trim() !== '') {
      const code = String(body.trackingCode).trim();
      const { rows } = await sql`
        UPDATE orders SET tracking_code = ${code}, updated_at = now()
        WHERE id = ${body.id} AND tracking_code IS DISTINCT FROM ${code}
        RETURNING id, cliente, email, tracking_code
      `;
      if (rows[0] && rows[0].email) {
        try {
          await sendShippedEmail(rows[0]);
        } catch (mailErr) {
          console.log('Falha ao enviar e-mail de rastreio:', mailErr);
        }
      }
    }
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = null; }
    }
    // Apaga TODOS os pedidos (e itens, via ON DELETE CASCADE). Ação
    // irreversível — por isso exige essa frase exata no corpo da
    // requisição, digitada pelo admin (ver admin/pedidos.html), além do
    // Basic Auth do painel. Sem isso, o endpoint não apaga nada.
    if (!body || body.confirm !== 'APAGAR TODOS OS PEDIDOS') {
      res.status(400).json({ error: 'Confirmação inválida. Envie { confirm: "APAGAR TODOS OS PEDIDOS" }.' });
      return;
    }
    const { rowCount } = await sql`DELETE FROM orders`;
    res.status(200).json({ ok: true, deleted: rowCount });
    return;
  }

  res.status(405).json({ error: 'Método não permitido.' });
};
