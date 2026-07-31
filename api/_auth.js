/* ===================================================================
   CRIATIVO BRASIL 3D — Autenticação simples do painel admin
   -------------------------------------------------------------------
   HTTP Basic Auth (usuário/senha via variáveis de ambiente ADMIN_USER
   e ADMIN_PASSWORD). As páginas /admin/*.html são protegidas pelo
   middleware.js (na raiz do projeto); esta função protege as rotas de
   API que o painel chama (ex: /api/orders), usando o MESMO usuário e
   senha — o navegador reaproveita a credencial já digitada ao entrar
   no painel, sem pedir de novo.

   Isto é uma proteção simples (adequada para uma loja pequena/solo).
   Não é um sistema de contas com papéis/permissões — ver
   docs/ARQUITETURA.md para o caminho de autenticação "de verdade"
   (NextAuth) caso a loja cresça.
=================================================================== */

function checkAdminAuth(req) {
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass) return false; // sem senha configurada, nega por segurança

  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || !header.startsWith('Basic ')) return false;
  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);
    return user === expectedUser && pass === expectedPass;
  } catch (e) {
    return false;
  }
}

function requireAdmin(req, res) {
  if (checkAdminAuth(req)) return true;
  res.setHeader('WWW-Authenticate', 'Basic realm="Painel Admin Criativo Brasil 3D"');
  res.status(401).json({ error: 'Autenticação necessária.' });
  return false;
}

module.exports = { checkAdminAuth, requireAdmin };
