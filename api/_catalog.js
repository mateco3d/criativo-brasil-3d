/* ===================================================================
   CRIATIVO BRASIL 3D — Catálogo no servidor (Vercel Function)
   -------------------------------------------------------------------
   Este arquivo existe para que o valor cobrado no PagBank NUNCA dependa
   do que o navegador do cliente envia (preço, frete ou cupom poderiam
   ser adulterados no front-end) — getProduct/unitPrice aqui são a fonte
   da verdade usada por api/calcular-frete.js, api/create-checkout-pagbank.js,
   api/create-preference.js e api/aplicar-cupom.js para recalcular tudo
   no servidor.

   Até 13/11 este arquivo guardava uma lista de produtos escrita à mão,
   separada do cadastro do painel admin — por isso todo produto novo
   precisava ser adicionado aqui manualmente, e esquecer esse passo
   quebrava o cálculo de frete/pagamento no checkout (ver histórico em
   claude/site-progresso.md, atualizações de 11/11 e 13/11).

   A partir de 13/11, getProduct() busca direto na mesma tabela do banco
   de dados real que o painel admin usa (store_data, chave 'products' —
   ver api/store.js e assets/js/admin.js). Não existe mais lista
   separada: qualquer produto cadastrado ou editado no painel já pode
   ser comprado imediatamente, sem precisar sincronizar nada aqui.
=================================================================== */

const { sql, ensureSchema } = require('./_db');

async function getProduct(id) {
  if (!id) return null;
  await ensureSchema();
  const { rows } = await sql`SELECT value FROM store_data WHERE key = 'products'`;
  const products = (rows.length && Array.isArray(rows[0].value)) ? rows[0].value : [];
  return products.find((p) => p.id === id) || null;
}

function unitPrice(product) {
  return product.promo !== null && product.promo !== undefined ? product.promo : product.price;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = { getProduct, unitPrice, round2 };
