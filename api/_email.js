/* ===================================================================
   CRIATIVO BRASIL 3D — Notificação por e-mail de pedido novo
   -------------------------------------------------------------------
   Usa o Gmail da própria loja (criativo3dbrasil@gmail.com) via SMTP,
   com uma "Senha de app" do Google — não a senha normal da conta.
   Configure as variáveis de ambiente na Vercel:
     GMAIL_USER          → criativo3dbrasil@gmail.com
     GMAIL_APP_PASSWORD  → senha de app gerada em myaccount.google.com/apppasswords

   Se essas variáveis não estiverem configuradas, a função apenas
   avisa no log e não quebra o resto do fluxo (o pedido continua
   sendo salvo no banco normalmente).
=================================================================== */

const nodemailer = require('nodemailer');

async function sendNewOrderEmail(order, items) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.log('E-mail de notificação não enviado: GMAIL_USER/GMAIL_APP_PASSWORD não configurados.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const itemsHtml = (items || [])
    .map((it) => `<li>${it.qty}x ${it.name || it.product_id} — R$ ${Number(it.price).toFixed(2)}</li>`)
    .join('');

  await transporter.sendMail({
    from: `Criativo Brasil 3D <${user}>`,
    to: user,
    subject: `🎉 Novo pedido pago: ${order.id} — R$ ${Number(order.total).toFixed(2)}`,
    html: `
      <h2>Novo pedido pago na loja!</h2>
      <p><strong>Pedido:</strong> ${order.id}</p>
      <p><strong>Cliente:</strong> ${order.cliente || '—'} (${order.email || '—'})</p>
      <p><strong>Telefone:</strong> ${order.telefone || '—'}</p>
      <p><strong>Total:</strong> R$ ${Number(order.total).toFixed(2)}</p>
      <p><strong>Itens:</strong></p>
      <ul>${itemsHtml}</ul>
      <p><a href="https://criativo-brasil-3d.vercel.app/admin/pedidos.html">Ver no painel admin</a></p>
    `,
  });
}

module.exports = { sendNewOrderEmail };
