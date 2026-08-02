/* ===================================================================
   CRIATIVO BRASIL 3D — Cupons de desconto (banco de dados real)
   -------------------------------------------------------------------
   Cupons são criados no painel admin (admin/cupons.html → /api/coupons)
   e podem valer para o pedido inteiro (product_id = null) ou para um
   produto específico (product_id = id do produto, escolhido na hora de
   criar o cupom). Este arquivo tem a lógica de validação e cálculo de
   desconto, compartilhada entre:
     - api/aplicar-cupom.js   → validação/preview (produto, carrinho, checkout)
     - api/create-preference.js → cálculo AUTORITATIVO na hora de cobrar
   Nunca confiamos em desconto calculado no navegador — o valor cobrado
   sempre vem de computeDiscount() rodando aqui no servidor.
=================================================================== */

const { sql, ensureSchema } = require('./_db');

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

async function buscarCupom(code) {
  if (!code) return null;
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM coupons WHERE code = ${String(code).trim().toUpperCase()}`;
  return rows[0] || null;
}

// Verifica se o cupom está em condições de ser usado (existe, ativo,
// dentro da validade e do limite de usos) — ainda não checa se ele se
// aplica aos itens do carrinho, isso é papel do computeDiscount().
function statusCupom(cp) {
  if (!cp) return { ok: false, reason: 'not_found' };
  if (!cp.active) return { ok: false, reason: 'inactive' };
  if (cp.expires_at) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(cp.expires_at) < today) return { ok: false, reason: 'expired' };
  }
  if (cp.usage_limit != null && cp.uses >= cp.usage_limit) return { ok: false, reason: 'limit' };
  return { ok: true };
}

// lines: [{ product: {id,...}, qty, unit }]
// Retorna { applicable, discount (total, já arredondado), freeShipping, perLine (array na mesma ordem de `lines`) }
function computeDiscount(cp, lines) {
  const applicable = lines.filter((l) => !cp.product_id || cp.product_id === l.product.id);
  if (!applicable.length) {
    return { applicable: false, discount: 0, freeShipping: false, perLine: lines.map(() => 0) };
  }

  if (cp.type === 'shipping') {
    return { applicable: true, discount: 0, freeShipping: true, perLine: lines.map(() => 0) };
  }

  const applicableSubtotal = applicable.reduce((s, l) => s + l.unit * l.qty, 0);
  let totalDiscount = 0;
  if (cp.type === 'percent') totalDiscount = applicableSubtotal * (Number(cp.value) / 100);
  else if (cp.type === 'fixed') totalDiscount = Math.min(Number(cp.value), applicableSubtotal);
  totalDiscount = round2(totalDiscount);

  const applicableIds = new Set(applicable.map((l) => l.product.id));
  const perLine = lines.map((l) => {
    if (!applicableIds.has(l.product.id) || applicableSubtotal <= 0) return 0;
    const lineSubtotal = l.unit * l.qty;
    return round2(totalDiscount * (lineSubtotal / applicableSubtotal));
  });

  return { applicable: true, discount: totalDiscount, freeShipping: false, perLine };
}

async function registrarUso(code) {
  await sql`UPDATE coupons SET uses = uses + 1 WHERE code = ${code}`;
}

function formatBRLServer(n) {
  return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
}

function mensagemCupom(cp) {
  const escopo = cp.product_id ? 'neste produto' : 'no pedido';
  if (cp.type === 'shipping') return cp.product_id ? 'Frete grátis ao comprar este produto' : 'Frete grátis neste pedido';
  if (cp.type === 'percent') return `${Number(cp.value)}% de desconto ${escopo}`;
  return `${formatBRLServer(cp.value)} de desconto ${escopo}`;
}

module.exports = { buscarCupom, statusCupom, computeDiscount, registrarUso, mensagemCupom, round2 };
