/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   POST /api/aplicar-cupom
   -------------------------------------------------------------------
   Endpoint público (sem login) usado para VALIDAR e mostrar o desconto
   de um cupom antes da compra — na página do produto, no carrinho e no
   checkout. Não cria pedido nem cobra nada; é só preview. O valor real
   cobrado é sempre recalculado de novo em api/create-preference.js.

   Body: { code: "PROMO10", items: [{ id, qty }, ...] }
=================================================================== */

const { getProduct, unitPrice } = require('./_catalog');
const { buscarCupom, statusCupom, computeDiscount, mensagemCupom } = require('./_coupons');

const MENSAGENS = {
  not_found: 'Cupom não encontrado.',
  inactive: 'Este cupom não está mais ativo.',
  expired: 'Este cupom expirou.',
  limit: 'Este cupom já atingiu o limite de usos.',
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ valid: false, message: 'Método não permitido.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || !body.code || !Array.isArray(body.items) || !body.items.length) {
    res.status(400).json({ valid: false, message: 'Informe o código do cupom e os itens.' });
    return;
  }

  const lines = [];
  for (const raw of body.items) {
    const product = getProduct(raw && raw.id);
    if (!product) continue;
    lines.push({ product, qty: Math.max(1, parseInt(raw.qty, 10) || 1), unit: unitPrice(product) });
  }
  if (!lines.length) {
    res.status(400).json({ valid: false, message: 'Nenhum item válido informado.' });
    return;
  }

  let cp;
  try {
    cp = await buscarCupom(body.code);
  } catch (err) {
    console.log('Erro ao buscar cupom:', err);
    res.status(500).json({ valid: false, message: 'Não foi possível validar o cupom agora. Tente novamente.' });
    return;
  }

  const status = statusCupom(cp);
  if (!status.ok) {
    res.status(200).json({ valid: false, message: MENSAGENS[status.reason] || 'Cupom inválido.' });
    return;
  }

  const result = computeDiscount(cp, lines);
  if (!result.applicable) {
    res.status(200).json({
      valid: false,
      message: cp.product_id ? 'Este cupom não é válido para este produto.' : 'Este cupom não pôde ser aplicado.',
    });
    return;
  }

  res.status(200).json({
    valid: true,
    code: cp.code,
    type: cp.type,
    value: Number(cp.value),
    productId: cp.product_id,
    discount: result.discount,
    freeShipping: result.freeShipping,
    message: mensagemCupom(cp),
  });
};
