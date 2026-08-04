/* ===================================================================
   CRIATIVO BRASIL 3D — Vercel Serverless Function (TEMPORÁRIO)
   GET /api/debug-token
   -------------------------------------------------------------------
   Endpoint de diagnóstico temporário para verificar se a variável de
   ambiente MP_ACCESS_TOKEN está formatada corretamente (sem espaços,
   quebras de linha, prefixo "Bearer" duplicado, etc.). NÃO expõe o
   valor real do token — apenas metadados seguros. Deve ser removido
   assim que o diagnóstico terminar.
=================================================================== */

module.exports = async function handler(req, res) {
  const raw = process.env.MP_ACCESS_TOKEN;
  if (!raw) {
    res.status(200).json({ present: false });
    return;
  }
  const trimmed = raw.trim();
  const parts = trimmed.split('-');
  res.status(200).json({
    present: true,
    length: raw.length,
    hasLeadingWhitespace: raw !== raw.trimStart(),
    hasTrailingWhitespace: raw !== raw.trimEnd(),
    hasNewline: /[\r\n]/.test(raw),
    startsWithBearer: /^bearer\s/i.test(trimmed),
    prefix: trimmed.slice(0, 8),
    suffix: trimmed.slice(-4),
    // O Access Token do Mercado Pago tem o formato
    // APP_USR-{app_id}-{data}-{hash}-{collector_id}. O último trecho
    // (collector_id) é o ID numérico da conta Mercado Pago dona do
    // token — não é segredo (aparece até na URL do painel de
    // integrações) — comparamos ele com o ID da conta logada no painel
    // para confirmar se é a mesma conta que tem a chave Pix cadastrada.
    partsCount: parts.length,
    collectorIdGuess: parts.length ? parts[parts.length - 1] : null,
    appIdGuess: parts.length > 1 ? parts[1] : null,
  });
};
