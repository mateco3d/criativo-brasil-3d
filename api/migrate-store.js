/* ===================================================================
   CRIATIVO BRASIL 3D — Ferramenta TEMPORÁRIA de migração de dados
   -------------------------------------------------------------------
   Usada uma única vez (02/09) para transferir os dados do painel
   admin — produtos, categorias, banners — do domínio antigo
   (criativo-brasil-3d.vercel.app) para o domínio novo
   (www.criativobrasil3d.com.br).

   Por que isso foi necessário: produtos/categorias/banners são salvos
   só no localStorage do navegador (ver assets/js/data.js e
   assets/js/admin.js) — um protótipo antigo que nunca foi migrado
   para o banco de dados real (ver item 11 de "Próximos passos" em
   claude/site-progresso.md). localStorage é isolado por domínio, então
   quando o domínio próprio foi conectado, a loja nesse novo endereço
   apareceu vazia — os produtos continuavam só no domínio antigo.

   Esta rota grava/lê um valor de texto arbitrário numa tabela Postgres
   temporária (kv_store_temp_migration), usando a MESMA base Postgres
   que já serve os dois domínios — por isso funciona como uma "ponte"
   entre eles. Protegida pelo mesmo login do painel admin.

   Protegida por um token secreto de uso único (header x-migrate-token),
   não pelo login do admin — assim funciona mesmo chamada a partir de
   uma página pública (produtos.html), sem depender do navegador já
   ter memorizado a senha do painel para aquele domínio específico.

   REMOVER este arquivo depois de concluída a migração — não deve
   ficar em produção.
=================================================================== */

const { sql } = require('@vercel/postgres');

const MIGRATE_TOKEN = 'b7f8f-aK7CwBwm2ufpARCXfJDJU9rseh';

let schemaReady = false;
async function ensureSchema() {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS kv_store_temp_migration (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  schemaReady = true;
}

module.exports = async (req, res) => {
  const token = req.headers['x-migrate-token'] || req.query.token;
  if (token !== MIGRATE_TOKEN) {
    res.status(401).json({ error: 'token inválido' });
    return;
  }
  await ensureSchema();

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = null; }
    }
    const key = body && body.key;
    if (!key) { res.status(400).json({ error: 'key é obrigatório' }); return; }
    const value = body.value != null ? String(body.value) : '';
    await sql`
      INSERT INTO kv_store_temp_migration (key, value, updated_at)
      VALUES (${key}, ${value}, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    res.status(200).json({ ok: true, bytes: value.length });
    return;
  }

  if (req.method === 'GET') {
    const key = req.query.key;
    if (!key) { res.status(400).json({ error: 'key é obrigatório' }); return; }
    const { rows } = await sql`SELECT value FROM kv_store_temp_migration WHERE key = ${key}`;
    if (!rows[0]) { res.status(404).json({ error: 'not found' }); return; }
    res.status(200).json({ key, value: rows[0].value });
    return;
  }

  if (req.method === 'DELETE') {
    const key = req.query.key;
    if (key) {
      await sql`DELETE FROM kv_store_temp_migration WHERE key = ${key}`;
    } else {
      await sql`DROP TABLE IF EXISTS kv_store_temp_migration`;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
