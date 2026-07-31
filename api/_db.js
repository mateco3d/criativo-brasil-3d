/* ===================================================================
   CRIATIVO BRASIL 3D — Camada de banco de dados (Postgres via Neon)
   -------------------------------------------------------------------
   Usa @vercel/postgres, que já lê a variável POSTGRES_URL injetada
   automaticamente quando o banco Neon foi conectado ao projeto na
   Vercel (Storage → Neon). Nenhuma credencial fica no código.

   ensureSchema() cria as tabelas na primeira chamada (CREATE TABLE
   IF NOT EXISTS — seguro rodar toda vez, é bem rápido depois da
   primeira). Não usamos uma ferramenta de migração separada para
   manter o projeto simples (sem build step / Prisma).
=================================================================== */

const { sql } = require('@vercel/postgres');

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      cliente TEXT,
      email TEXT,
      telefone TEXT,
      total NUMERIC(10,2) NOT NULL DEFAULT 0,
      subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
      shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
      discount NUMERIC(10,2) NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Aguardando Pagamento',
      mp_preference_id TEXT,
      mp_payment_id TEXT,
      mp_status TEXT,
      notified BOOLEAN NOT NULL DEFAULT false,
      seen BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT,
      name TEXT,
      cat TEXT,
      qty INT NOT NULL DEFAULT 1,
      price NUMERIC(10,2) NOT NULL DEFAULT 0
    )
  `;
  schemaReady = true;
}

module.exports = { sql, ensureSchema };
