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
  res.status(200).json({
    present: true,
    length: raw.length,
    hasLeadingWhitespace: raw !== raw.trimStart(),
    hasTrailingWhitespace: raw !== raw.trimEnd(),
    hasNewline: /[\r\n]/.test(raw),
    startsWithBearer: /^bearer\s/i.test(raw.trim()),
    prefix: raw.trim().slice(0, 8),
    suffix: raw.trim().slice(-4),
  });
};
