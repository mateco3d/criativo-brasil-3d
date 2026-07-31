/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   POST /api/create-preference
   -------------------------------------------------------------------
   Cria uma "preference" (Checkout Pro) no Mercado Pago e devolve o
   link de pagamento (init_point) para o front-end redirecionar o
   cliente. Todo o valor cobrado é recalculado aqui no servidor a
   partir de api/_catalog.js — nunca confiamos em preço, frete ou
   desconto vindos do navegador.

   Requer a variável de ambiente MP_ACCESS_TOKEN configurada no painel
   do Vercel (Project Settings → Environment Variables), com o Access
   Token da conta Mercado Pago da loja. Nunca commitar esse token no
   código/GitHub.
=================================================================== */

const { getProduct, unitPrice, calcShipping, COUPONS, round2 } = require('./_catalog');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido. Use POST.' });
    return;
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({
      error: 'MP_ACCESS_TOKEN não configurado no servidor. Adicione essa variável de ambiente nas configurações do projeto no Vercel e faça um novo deploy.',
    });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    res.status(400).json({ error: 'Carrinho vazio ou inválido.' });
    return;
  }

  // 1) Valida e recalcula os itens com base no catálogo do servidor
  const lines = [];
  for (const raw of body.items) {
    const product = getProduct(raw && raw.id);
    const qty = Math.max(1, parseInt(raw && raw.qty, 10) || 1);
    if (!product) {
      res.status(400).json({ error: `Produto inválido: ${raw && raw.id}` });
      return;
    }
    lines.push({ product, qty, unit: unitPrice(product) });
  }
  const subtotal = round2(lines.reduce((sum, l) => sum + l.unit * l.qty, 0));

  // 2) Cupom (validado no servidor, nunca no valor enviado pelo cliente)
  let discountRatio = 0;
  let couponApplied = null;
  if (body.couponCode) {
    const code = String(body.couponCode).trim().toUpperCase();
    if (COUPONS[code]) { discountRatio = COUPONS[code]; couponApplied = code; }
  }

  // 3) Frete (mesma fórmula determinística do front-end, recalculada aqui)
  const shippingCode = ['PAC', 'SEDEX', 'TRANSP'].includes(body.shippingCode) ? body.shippingCode : 'PAC';
  const shipping = body.cep ? calcShipping(body.cep, subtotal, shippingCode) : { label: 'A combinar', price: 0 };

  // 4) Monta os itens do Mercado Pago (desconto aplicado proporcionalmente
  //    no preço unitário, para evitar itens com valor negativo)
  const mpItems = lines.map((l) => ({
    id: l.product.id,
    title: l.product.name,
    quantity: l.qty,
    currency_id: 'BRL',
    unit_price: round2(l.unit * (1 - discountRatio)),
  }));
  if (shipping.price > 0) {
    mpItems.push({ title: `Frete — ${shipping.label}`, quantity: 1, currency_id: 'BRL', unit_price: shipping.price });
  }

  const total = round2(mpItems.reduce((s, i) => s + i.unit_price * i.quantity, 0));
  const orderCode = 'CB3D-' + Math.floor(100000 + Math.random() * 900000);
  const origin = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;

  const payer = body.buyer && typeof body.buyer === 'object' ? body.buyer : {};
  const preferenceBody = {
    items: mpItems,
    payer: {
      name: payer.name || undefined,
      email: payer.email || undefined,
      phone: payer.phone ? { number: String(payer.phone).replace(/\D/g, '') } : undefined,
    },
    back_urls: {
      success: `${origin}/pedido-confirmado.html?order=${orderCode}`,
      failure: `${origin}/pedido-confirmado.html?order=${orderCode}&status=failure`,
      pending: `${origin}/pedido-confirmado.html?order=${orderCode}&status=pending`,
    },
    auto_return: 'approved',
    external_reference: orderCode,
    statement_descriptor: 'CRIATIVOBRASIL3D',
    notification_url: `${origin}/api/mp-webhook`,
  };

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(preferenceBody),
    });
    const data = await mpRes.json();
    if (!mpRes.ok) {
      res.status(mpRes.status).json({ error: data.message || 'Erro ao criar preferência no Mercado Pago.', details: data });
      return;
    }
    res.status(200).json({
      orderCode,
      total,
      subtotal,
      shipping: shipping.price,
      discount: round2(subtotal * discountRatio),
      couponApplied,
      preferenceId: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao comunicar com o Mercado Pago.', details: String(err) });
  }
};
