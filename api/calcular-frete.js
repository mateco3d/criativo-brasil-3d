/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function
   POST /api/calcular-frete
   -------------------------------------------------------------------
   Calcula as opções de frete real (PAC/SEDEX/etc via Melhor Envio) para
   o CEP e os itens do carrinho informados. Usado pelo checkout para
   mostrar as opções antes do pagamento — o valor final cobrado é sempre
   recalculado de novo em api/create-preference.js na hora de gerar o
   pagamento, nunca confiando neste valor "de exibição".
=================================================================== */

const { getProduct } = require('./_catalog');
const { calcularFreteMelhorEnvio } = require('./_shipping');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido. Use POST.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || !body.cep || !Array.isArray(body.items) || !body.items.length) {
    res.status(400).json({ error: 'Informe cep e items (produtos do carrinho).' });
    return;
  }

  const lines = [];
  for (const raw of body.items) {
    const product = getProduct(raw && raw.id);
    if (!product) continue; // ignora itens que não existem mais no catálogo
    lines.push({ product, qty: Math.max(1, parseInt(raw.qty, 10) || 1) });
  }
  if (!lines.length) {
    res.status(400).json({ error: 'Nenhum item válido no carrinho.' });
    return;
  }

  try {
    const options = await calcularFreteMelhorEnvio({ cepDestino: body.cep, lines });
    if (!options.length) {
      res.status(200).json({ options: [], error: 'Nenhuma transportadora disponível para este CEP no momento.' });
      return;
    }
    res.status(200).json({ options });
  } catch (err) {
    console.log('Erro ao calcular frete (Melhor Envio):', err);
    res.status(502).json({ options: [], error: 'Não foi possível calcular o frete agora. Tente novamente em instantes.' });
  }
};
