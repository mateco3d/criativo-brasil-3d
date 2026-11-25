/* ===========================================================================
   CRIATIVO BRASIL 3D - Helper: API de Conversoes da Meta (server-side)
   -------------------------------------------------------------------
   Envia eventos de conversao (por enquanto so "Purchase") direto pro
   Graph API da Meta, server-side, pra complementar o Pixel do navegador
   (assets/js/main.js e as paginas html) com mais confiabilidade - o
   Pixel sozinho perde eventos quando o cliente usa bloqueador de
   anuncios, Safari com ITP, etc.

   Usa o mesmo PIXEL_ID do Pixel do navegador e o event_id = codigo do
   pedido (orderId) pra deduplicar com o evento Purchase que o Pixel ja
   disparou em pedido-confirmado.html - a Meta junta os dois num so.

   Requer a variavel de ambiente META_CAPI_TOKEN configurada no painel
   do Vercel (Project Settings -> Environment Variables), com o token
   gerado em Gerenciador de Eventos -> pixel -> Configuracoes -> API de
   Conversoes -> Gerar token de acesso. Esse token deve ser gerado e
   cadastrado pelo proprio dono da loja (nunca commitar token no
   codigo/GitHub). Se a variavel nao estiver configurada, so loga um
   aviso e nao faz nada - nunca quebra o webhook da PagBank por causa
   disso.
   =========================================================================== */

const crypto = require('crypto');

const PIXEL_ID = '1446771081003069';
const GRAPH_API_VERSION = 'v21.0';

// A Meta exige que email e telefone sejam enviados com hash SHA-256,
// nunca em texto puro. Antes de gerar o hash, normaliza (minusculo, sem
// espaco) pra bater com o jeito que a Meta normaliza do lado dela.
function hashField(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// Telefone brasileiro: a Meta espera E.164 (ex: 5511999999999, sem
// simbolos). Remove tudo que nao for digito e garante o prefixo do
// pais (55) quando o numero salvo veio so com DDD+numero.
function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

/**
 * Envia um evento Purchase server-side pra API de Conversoes da Meta.
 * Nunca lanca erro pra fora (so loga) - o chamador (api/pagbank-webhook.js)
 * nao deve falhar por causa de um problema aqui.
 */
async function sendPurchaseEvent({ orderId, value, currency, email, phone, fbp, fbc }) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    console.log('META_CAPI_TOKEN nao configurado - evento Purchase (CAPI) nao enviado.');
    return;
  }

  const userData = {};
  const hashedEmail = hashField(email);
  if (hashedEmail) userData.em = [hashedEmail];
  const hashedPhone = hashField(normalizePhone(phone));
  if (hashedPhone) userData.ph = [hashedPhone];
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: String(orderId),
        action_source: 'website',
        user_data: userData,
        custom_data: {
          currency: currency || 'BRL',
          value: Number(value) || 0,
          content_ids: [String(orderId)],
          content_type: 'product',
        },
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.log('Falha ao enviar evento Purchase pra API de Conversoes da Meta:', res.status, await res.text());
    }
  } catch (err) {
    console.log('Erro ao enviar evento Purchase pra API de Conversoes da Meta:', err);
  }
}

module.exports = { sendPurchaseEvent };
