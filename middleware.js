/* ===================================================================
   CRIATIVO BRASIL 3D — Middleware de autenticação do painel admin
   -------------------------------------------------------------------
   Protege /admin/* (as páginas do painel) e as rotas de API que ele
   usa (/api/orders) com HTTP Basic Auth. O navegador mostra um popup
   pedindo usuário/senha na primeira visita e depois reutiliza a
   credencial automaticamente (inclusive nas chamadas de API feitas
   pelas próprias páginas do admin).

   Configure as variáveis de ambiente ADMIN_USER (opcional, padrão
   "admin") e ADMIN_PASSWORD (obrigatória) no painel da Vercel.
   Roda no Edge Runtime da Vercel — por isso usa APIs Web (Response,
   atob) em vez de módulos do Node.
=================================================================== */

export const config = {
  matcher: ['/admin/:path*', '/api/orders', '/api/orders/:path*'],
};

export default function middleware(req) {
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedPass) {
    return new Response(
      'Painel admin bloqueado: configure a variável de ambiente ADMIN_PASSWORD no projeto da Vercel.',
      { status: 500 }
    );
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const decoded = atob(authHeader.slice(6));
      const idx = decoded.indexOf(':');
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      if (user === expectedUser && pass === expectedPass) {
        return; // autenticado — segue para a página/API normalmente
      }
    } catch (e) {
      // credencial malformada — cai para o desafio de autenticação abaixo
    }
  }

  return new Response('Autenticação necessária.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Painel Admin Criativo Brasil 3D"' },
  });
}
