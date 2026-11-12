/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   GET /api/store?key=products|categories|banners  → público (a loja e o
     admin leem o catálogo sem precisar de login)
   PUT /api/store  { key, value }                   → protegido por
     Basic Auth (só o painel admin pode gravar)
   -------------------------------------------------------------------
   Substitui o antigo "catálogo salvo só no localStorage do navegador"
   (ver assets/js/data.js e assets/js/admin.js). Produtos, categorias e
   banners cadastrados no painel agora ficam guardados aqui, numa tabela
   bem simples (key/value em JSONB) no mesmo banco Postgres que já serve
   pedidos e cupons — por isso qualquer navegador ou aparelho (celular,
   computador, qualquer um) passa a enxergar sempre o mesmo catálogo,
   sem precisar sincronizar nada manualmente entre dispositivos.

   Esta tabela guarda o array inteiro sob uma chave (ex.: "products"),
   o mesmo jeito que o protótipo já salvava tudo de uma vez no
   localStorage — a diferença é que agora fica no servidor, compartilhado
   por todo mundo, em vez de preso num navegador só. Ver api/_db.js para
   o schema (tabela store_data).
=================================================================== */

const { sql, ensureSchema } = require('./_db');
const { requireAdmin } = require('./_auth');

const ALLOWED_KEYS = ['products', 'categories', 'banners'];

module.exports = async function handler(req, res) {
  await ensureSchema();

  if (req.method === 'GET') {
    const key = req.query && req.query.key;
    if (!ALLOWED_KEYS.includes(key)) {
      res.status(400).json({ error: 'key inválida. Use products, categories ou banners.' });
      return;
    }
    const { rows } = await sql`SELECT value FROM store_data WHERE key = ${key}`;
    res.status(200).json({ value: rows.length ? rows[0].value : null });
    return;
  }

  if (req.method === 'PUT') {
    // Só o painel admin pode gravar — a leitura (GET) acima continua
    // pública, pois a loja precisa mostrar o catálogo sem login.
    if (!requireAdmin(req, res)) return;

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = null; }
    }
    const key = body && body.key;
    if (!ALLOWED_KEYS.includes(key)) {
      res.status(400).json({ error: 'key inválida. Use products, categories ou banners.' });
      return;
    }
    if (!Array.isArray(body.value)) {
      res.status(400).json({ error: 'value precisa ser uma lista (array).' });
      return;
    }

    await sql`
      INSERT INTO store_data (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(body.value)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Método não permitido.' });
};
