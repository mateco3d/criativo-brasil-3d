/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   GET    /api/coupons  → lista os cupons (painel admin)
   POST   /api/coupons  → cria um cupom novo
   PATCH  /api/coupons  → ativa/desativa um cupom
   DELETE /api/coupons  → exclui um cupom
   -------------------------------------------------------------------
   Protegido por Basic Auth (ver api/_auth.js e middleware.js), igual a
   /api/orders. Lê e escreve na tabela `coupons` do Postgres (Neon) —
   ver api/_db.js para o schema e api/_coupons.js para a lógica de
   validação/desconto usada pelo checkout.
=================================================================== */

const { sql, ensureSchema } = require('./_db');
const { requireAdmin } = require('./_auth');

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  await ensureSchema();

  if (req.method === 'GET') {
    const { rows } = await sql`
      SELECT code, type, value, product_id, active, uses, usage_limit, expires_at, created_at
      FROM coupons
      ORDER BY created_at DESC
    `;
    res.status(200).json({ coupons: rows });
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = null; }
    }
    if (!body || !body.code) { res.status(400).json({ error: 'Código do cupom é obrigatório.' }); return; }

    const code = String(body.code).trim().toUpperCase();
    if (!code) { res.status(400).json({ error: 'Código do cupom é obrigatório.' }); return; }
    const type = ['percent', 'fixed', 'shipping'].includes(body.type) ? body.type : 'percent';
    const value = type === 'shipping' ? 0 : Math.max(0, Number(body.value) || 0);
    const productId = body.productId ? String(body.productId) : null;
    const usageLimit = body.usageLimit ? Math.max(1, parseInt(body.usageLimit, 10)) : null;
    const expiresAt = body.expiresAt || null;

    try {
      await sql`
        INSERT INTO coupons (code, type, value, product_id, active, uses, usage_limit, expires_at)
        VALUES (${code}, ${type}, ${value}, ${productId}, true, 0, ${usageLimit}, ${expiresAt})
      `;
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(400).json({ error: 'Já existe um cupom com esse código.' });
    }
    return;
  }

  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = null; }
    }
    if (!body || !body.code) { res.status(400).json({ error: 'code é obrigatório.' }); return; }
    const code = String(body.code).trim().toUpperCase();
    if (body.active !== undefined) {
      await sql`UPDATE coupons SET active = ${!!body.active} WHERE code = ${code}`;
    }
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = null; }
    }
    const code = (body && body.code) || (req.query && req.query.code);
    if (!code) { res.status(400).json({ error: 'code é obrigatório.' }); return; }
    await sql`DELETE FROM coupons WHERE code = ${String(code).trim().toUpperCase()}`;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Método não permitido.' });
};
