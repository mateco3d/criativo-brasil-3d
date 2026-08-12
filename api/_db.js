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
  // Colunas de endereço/CPF/serviço de envio — adicionadas depois da tabela
  // já existir em produção, por isso via ALTER TABLE (não dá pra colocar
  // só no CREATE TABLE acima, que só roda na primeira vez). Servem para
  // pré-preencher os dados de postagem no painel (ver admin/pedidos.html),
  // já que antes esses dados eram só coletados no checkout e descartados.
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cpf TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cep TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS rua TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS numero TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS complemento TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS bairro TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cidade TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS uf TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label TEXT`;
  // Código de rastreio dos Correios — preenchido pelo admin ao marcar o
  // pedido como "Enviado" (ver admin/pedidos.html). Quando esse valor muda,
  // api/orders.js dispara um e-mail automático para o cliente (ver
  // api/_email.js → sendShippedEmail).
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code TEXT`;
  // Colunas da PagBank — adicionadas na migração de saída do Mercado Pago
  // (ver api/create-checkout-pagbank.js e api/pagbank-webhook.js). As
  // colunas mp_* antigas continuam na tabela só para não perder o
  // histórico dos pedidos já pagos pelo Mercado Pago antes da troca.
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS pagbank_checkout_id TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS pagbank_order_id TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS pagbank_status TEXT`;
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
  await sql`
    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'percent',
      value NUMERIC(10,2) NOT NULL DEFAULT 0,
      product_id TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      uses INT NOT NULL DEFAULT 0,
      usage_limit INT,
      expires_at DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  schemaReady = true;
}

module.exports = { sql, ensureSchema };
