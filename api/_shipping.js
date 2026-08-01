/* ===================================================================
   CRIATIVO BRASIL 3D — Cálculo de frete real via Melhor Envio
   -------------------------------------------------------------------
   Substitui a fórmula fake que existia antes (baseada só nos 3 primeiros
   dígitos do CEP). Agora consultamos a API do Melhor Envio, que calcula o
   frete real dos Correios (PAC/SEDEX) e de outras transportadoras
   conectadas à conta da loja — sem precisar de contrato direto com os
   Correios.

   Requer duas variáveis de ambiente no Vercel:
     MELHORENVIO_TOKEN        → token de acesso gerado no painel do
                                 Melhor Envio (Gerenciar Tokens de Acesso)
     MELHORENVIO_CEP_ORIGEM   → CEP de onde os pacotes são postados
                                 (endereço da loja/oficina)

   Usado tanto por api/calcular-frete.js (frete mostrado no checkout,
   ainda sem cobrança) quanto por api/create-preference.js (frete
   realmente cobrado — sempre recalculado no servidor, nunca confiamos no
   valor que o navegador manda).
=================================================================== */

const { unitPrice } = require('./_catalog');

// Dimensões/peso mínimos aceitos pelos Correios/transportadoras — evita
// erro na API para itens muito pequenos (ex: chaveiro, emblema).
const MIN_LENGTH_CM = 16;
const MIN_WIDTH_CM = 11;
const MIN_HEIGHT_CM = 2;
const MIN_WEIGHT_KG = 0.1;

function clamp(product) {
  return {
    length: Math.max(MIN_LENGTH_CM, product.length_cm || 0),
    width: Math.max(MIN_WIDTH_CM, product.width_cm || 0),
    height: Math.max(MIN_HEIGHT_CM, product.height_cm || 0),
    weight: Math.max(MIN_WEIGHT_KG, product.weight_kg || 0),
  };
}

async function calcularFreteMelhorEnvio({ cepDestino, lines }) {
  const token = process.env.MELHORENVIO_TOKEN;
  if (!token) {
    const err = new Error('MELHORENVIO_TOKEN não configurado no servidor.');
    err.code = 'NO_TOKEN';
    throw err;
  }
  const cepOrigem = process.env.MELHORENVIO_CEP_ORIGEM;
  if (!cepOrigem) {
    const err = new Error('MELHORENVIO_CEP_ORIGEM não configurado no servidor.');
    err.code = 'NO_ORIGIN';
    throw err;
  }
  const destino = String(cepDestino || '').replace(/\D/g, '');
  if (destino.length !== 8) {
    const err = new Error('CEP de destino inválido.');
    err.code = 'INVALID_DESTINATION';
    throw err;
  }

  const products = lines.map((l) => {
    const dims = clamp(l.product);
    return {
      id: l.product.id,
      width: dims.width,
      height: dims.height,
      length: dims.length,
      weight: dims.weight,
      insurance_value: unitPrice(l.product),
      quantity: l.qty,
    };
  });

  const res = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'Criativo Brasil 3D (criativo3dbrasil@gmail.com)',
    },
    body: JSON.stringify({
      from: { postal_code: cepOrigem.replace(/\D/g, '') },
      to: { postal_code: destino },
      products,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Melhor Envio respondeu ${res.status}: ${text}`);
    err.code = 'ME_HTTP_ERROR';
    throw err;
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    const err = new Error('Resposta inesperada da API do Melhor Envio.');
    err.code = 'ME_BAD_RESPONSE';
    throw err;
  }

  return data
    .filter((s) => !s.error && (s.price != null || s.custom_price != null))
    // A loja só sabe despachar pelos Correios — outras transportadoras
    // (Jadlog, Loggi, Azul Cargo, Total Express etc.) ficam de fora das
    // opções mostradas ao cliente, mesmo que sejam mais baratas.
    .filter((s) => s.company && String(s.company.name).trim().toLowerCase() === 'correios')
    .map((s) => ({
      code: String(s.id),
      label: s.company && s.company.name ? `${s.name} — ${s.company.name}` : String(s.name),
      price: Number(s.custom_price != null ? s.custom_price : s.price),
      days: Number(s.custom_delivery_time != null ? s.custom_delivery_time : s.delivery_time) || 7,
    }))
    .filter((o) => Number.isFinite(o.price))
    .sort((a, b) => a.price - b.price);
}

module.exports = { calcularFreteMelhorEnvio };
