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

const { getProduct, unitPrice, round2 } = require('./_catalog');
const { calcularFreteMelhorEnvio } = require('./_shipping');
const { buscarCupom, statusCupom, computeDiscount, registrarUso } = require('./_coupons');
const { sql, ensureSchema } = require('./_db');

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

  // 2) Cupom (validado no servidor contra o banco de dados, nunca no
  //    valor/desconto enviado pelo cliente). Cupons podem valer para o
  //    pedido inteiro ou só para um produto específico (product_id) —
  //    ver api/_coupons.js.
  let couponApplied = null;
  let discountPerLine = lines.map(() => 0);
  let freeShippingFromCoupon = false;
  if (body.couponCode) {
    let cp;
    try {
      cp = await buscarCupom(body.couponCode);
    } catch (err) {
      console.log('Erro ao buscar cupom:', err);
    }
    const status = statusCupom(cp);
    if (cp && status.ok) {
      const result = computeDiscount(cp, lines);
      if (result.applicable) {
        couponApplied = cp.code;
        discountPerLine = result.perLine;
        freeShippingFromCoupon = result.freeShipping;
      }
    }
  }
  const discountTotal = round2(discountPerLine.reduce((s, d) => s + d, 0));

  // 3) Frete real (Melhor Envio), recalculado aqui — nunca confiamos no
  //    valor/opção que o navegador manda, só usamos o "código" da opção
  //    escolhida para saber qual transportadora o cliente selecionou.
  let shipping = { label: 'A combinar', price: 0 };
  if (body.cep) {
    let shippingOptions;
    try {
      shippingOptions = await calcularFreteMelhorEnvio({ cepDestino: body.cep, lines });
    } catch (err) {
      console.log('Erro ao calcular frete (Melhor Envio) na criação do pedido:', err);
      res.status(502).json({ error: 'Não foi possível confirmar o valor do frete agora. Tente novamente em instantes.' });
      return;
    }
    const chosen = shippingOptions.find((o) => o.code === String(body.shippingCode)) || shippingOptions[0];
    if (!chosen) {
      res.status(400).json({ error: 'Nenhuma opção de frete disponível para o CEP informado.' });
      return;
    }
    shipping = { label: chosen.label, price: chosen.price };
  }
  if (freeShippingFromCoupon) {
    shipping = { label: `${shipping.label} (frete grátis — cupom)`.trim(), price: 0 };
  }

  // 4) Monta os itens do Mercado Pago (desconto de cada linha aplicado no
  //    próprio preço unitário, para evitar itens com valor negativo)
  const mpItems = lines.map((l, idx) => {
    const lineTotal = round2(l.unit * l.qty - (discountPerLine[idx] || 0));
    return {
      id: l.product.id,
      title: l.product.name,
      quantity: l.qty,
      currency_id: 'BRL',
      unit_price: round2(lineTotal / l.qty),
    };
  });
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

    // 5) Salva o pedido no banco de dados (status inicial: aguardando
    //    pagamento). O webhook (api/mp-webhook.js) atualiza o status
    //    quando o Mercado Pago confirmar o pagamento. Se o banco falhar
    //    por algum motivo, não bloqueia a compra — só loga o erro.
    try {
      await ensureSchema();
      await sql`
        INSERT INTO orders (id, cliente, email, telefone, total, subtotal, shipping, discount, status, mp_preference_id)
        VALUES (${orderCode}, ${payer.name || null}, ${payer.email || null}, ${payer.phone || null},
                ${total}, ${subtotal}, ${shipping.price}, ${discountTotal},
                'Aguardando Pagamento', ${data.id})
        ON CONFLICT (id) DO NOTHING
      `;
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        const lineTotal = round2(l.unit * l.qty - (discountPerLine[i] || 0));
        await sql`
          INSERT INTO order_items (order_id, product_id, name, cat, qty, price)
          VALUES (${orderCode}, ${l.product.id}, ${l.product.name}, ${l.product.cat || null}, ${l.qty}, ${lineTotal})
        `;
      }
      if (couponApplied) {
        await registrarUso(couponApplied);
      }
    } catch (dbErr) {
      console.log('Falha ao salvar pedido no banco de dados:', dbErr);
    }

    res.status(200).json({
      orderCode,
      total,
      subtotal,
      shipping: shipping.price,
      discount: discountTotal,
      couponApplied,
      preferenceId: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao comunicar com o Mercado Pago.', details: String(err) });
  }
};
