/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   POST /api/create-checkout-pagbank
   -------------------------------------------------------------------
   Substitui o api/create-preference.js (Mercado Pago) na migração pra
   PagBank. Cria um "Checkout" hospedado da PagBank (o cliente é
   redirecionado pra uma página segura da PagBank pra pagar com Pix,
   boleto ou cartão parcelado, igual funcionava o Checkout Pro do
   Mercado Pago) e devolve o link de pagamento (checkout_url) pro
   front-end redirecionar o cliente.

   Todo o valor cobrado é recalculado aqui no servidor a partir de
   api/_catalog.js — nunca confiamos em preço, frete ou desconto vindos
   do navegador. Essa parte é idêntica ao create-preference.js antigo.

   Requer a variável de ambiente PAGBANK_TOKEN configurada no painel do
   Vercel (Project Settings → Environment Variables), com o token de
   API (Bearer) gerado no painel de desenvolvedores da PagBank. Nunca
   commitar esse token no código/GitHub.

   IMPORTANTE — ainda não está ativo: o checkout.html do site continua
   chamando /api/create-preference (Mercado Pago) até o usuário
   confirmar que o PAGBANK_TOKEN está configurado e a gente testar o
   fluxo completo (Pix/boleto/cartão + webhook) em produção. Ver
   claude/site-progresso.md para o estado atual da migração.
=================================================================== */

const { getProduct, unitPrice, round2 } = require('./_catalog');
const { calcularFreteMelhorEnvio } = require('./_shipping');
const { buscarCupom, statusCupom, computeDiscount, registrarUso } = require('./_coupons');
const { sql, ensureSchema } = require('./_db');

// A PagBank trabalha em CENTAVOS (inteiro), diferente do Mercado Pago que
// usa valor decimal (ex.: 49.90). Essa função converte um valor em reais
// (número, pode ter centavos) pro formato que a API espera.
function toCents(reais) {
  return Math.round(round2(reais) * 100);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido. Use POST.' });
    return;
  }

  // Modo sandbox só é ativado explicitamente via ?sandbox=1 na URL — nunca
  // por uma variável de ambiente global. Isso evita que o checkout real da
  // loja vá parar no sandbox por engano; é só pra eu (ou o usuário) testar
  // a integração manualmente antes da homologação da PagBank liberar a
  // conta em produção. Usa um token separado (PAGBANK_SANDBOX_TOKEN) pra
  // nunca precisar trocar o PAGBANK_TOKEN de produção durante o teste.
  const isSandbox = req.query && req.query.sandbox === '1';
  const token = isSandbox ? process.env.PAGBANK_SANDBOX_TOKEN : process.env.PAGBANK_TOKEN;
  const apiBase = isSandbox ? 'https://sandbox.api.pagseguro.com' : 'https://api.pagseguro.com';

  if (!token) {
    const varName = isSandbox ? 'PAGBANK_SANDBOX_TOKEN' : 'PAGBANK_TOKEN';
    res.status(500).json({
      error: `${varName} não configurado no servidor. Adicione essa variável de ambiente nas configurações do projeto no Vercel e faça um novo deploy.`,
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
  //    (idêntico ao create-preference.js)
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

  // 2) Cupom (validado no servidor contra o banco de dados)
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

  // 3) Frete real (Melhor Envio), recalculado aqui
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

  // 4) Monta os itens da PagBank (unit_amount em centavos)
  const pbItems = lines.map((l, idx) => {
    const lineTotal = round2(l.unit * l.qty - (discountPerLine[idx] || 0));
    return {
      reference_id: l.product.id,
      name: l.product.name,
      quantity: l.qty,
      unit_amount: toCents(lineTotal / l.qty),
    };
  });
  if (shipping.price > 0) {
    pbItems.push({ reference_id: 'frete', name: `Frete — ${shipping.label}`, quantity: 1, unit_amount: toCents(shipping.price) });
  }

  const total = round2(pbItems.reduce((s, i) => s + (i.unit_amount / 100) * i.quantity, 0));
  const orderCode = 'CB3D-' + Math.floor(100000 + Math.random() * 900000);
  const origin = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;

  const payer = body.buyer && typeof body.buyer === 'object' ? body.buyer : {};
  const address = body.address && typeof body.address === 'object' ? body.address : {};
  const phoneDigits = payer.phone ? String(payer.phone).replace(/\D/g, '') : '';

  const checkoutBody = {
    reference_id: orderCode,
    customer: {
      name: payer.name || undefined,
      email: payer.email || undefined,
      tax_id: payer.cpf ? String(payer.cpf).replace(/\D/g, '') : undefined,
      phone: phoneDigits
        ? { country: '55', area: phoneDigits.slice(0, 2), number: phoneDigits.slice(2) }
        : undefined,
    },
    customer_modifiable: false,
    items: pbItems,
    redirect_url: `${origin}/pedido-confirmado.html?order=${orderCode}`,
    notification_urls: [`${origin}/api/pagbank-webhook`],
    payment_notification_urls: [`${origin}/api/pagbank-webhook`],
  };

  try {
    // Loga a requisição e a resposta completas (sem o token) — útil pra
    // pegar do painel de Logs do Vercel e anexar no formulário de
    // homologação da PagBank (pedem request/response de sandbox/produção).
    console.log(`[PagBank ${isSandbox ? 'SANDBOX' : 'PRODUÇÃO'}] Request POST ${apiBase}/checkouts:`, JSON.stringify(checkoutBody));

    const pbRes = await fetch(`${apiBase}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(checkoutBody),
    });
    const data = await pbRes.json();
    console.log(`[PagBank ${isSandbox ? 'SANDBOX' : 'PRODUÇÃO'}] Response ${pbRes.status}:`, JSON.stringify(data));

    if (!pbRes.ok) {
      res.status(pbRes.status).json({ error: (data && (data.error_messages || data.message)) || 'Erro ao criar checkout na PagBank.', details: data });
      return;
    }

    const checkoutUrl = (data.links || []).find((l) => l.rel === 'PAY' || l.rel === 'SELF')?.href || data.checkout_url;

    // 5) Salva o pedido no banco de dados (status inicial: aguardando
    //    pagamento). O webhook (api/pagbank-webhook.js) atualiza o status
    //    quando a PagBank confirmar o pagamento.
    try {
      await ensureSchema();
      await sql`
        INSERT INTO orders (
          id, cliente, email, telefone, total, subtotal, shipping, discount, status, pagbank_checkout_id,
          cpf, cep, rua, numero, complemento, bairro, cidade, uf, shipping_label
        )
        VALUES (
          ${orderCode}, ${payer.name || null}, ${payer.email || null}, ${payer.phone || null},
          ${total}, ${subtotal}, ${shipping.price}, ${discountTotal},
          'Aguardando Pagamento', ${data.id},
          ${payer.cpf || null}, ${address.cep || null}, ${address.rua || null}, ${address.numero || null},
          ${address.complemento || null}, ${address.bairro || null}, ${address.cidade || null}, ${address.uf || null},
          ${shipping.label || null}
        )
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
      checkoutId: data.id,
      checkout_url: checkoutUrl,
    });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao comunicar com a PagBank.', details: String(err) });
  }
};
