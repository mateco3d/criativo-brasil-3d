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

/* -------------------------------------------------------------------
   E-mail automático para o CLIENTE quando o pedido é despachado — envia
   o código de rastreio dos Correios. Disparado por api/orders.js sempre
   que o admin salva um código de rastreio novo/diferente para o pedido
   (ver painel → Pedidos → marcar como "Enviado").
------------------------------------------------------------------- */
async function sendShippedEmail(order) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.log('E-mail de rastreio não enviado: GMAIL_USER/GMAIL_APP_PASSWORD não configurados.');
    return;
  }
  if (!order.email || !order.tracking_code) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  // Link oficial de rastreamento dos Correios. O parâmetro ?objetos= tenta
  // pré-preencher o código automaticamente; mesmo se isso não funcionar em
  // algum momento, o código também aparece em texto no e-mail para o
  // cliente colar manualmente na página.
  const trackingUrl = `https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(order.tracking_code)}`;

  await transporter.sendMail({
    from: `Criativo Brasil 3D <${user}>`,
    to: order.email,
    subject: `📦 Seu pedido ${order.id} foi enviado!`,
    html: `
      <h2>Seu pedido foi enviado!</h2>
      <p>Olá${order.cliente ? ', ' + order.cliente : ''}! Seu pedido <strong>${order.id}</strong> já saiu para entrega pelos Correios.</p>
      <p><strong>Código de rastreio:</strong> ${order.tracking_code}</p>
      <p><a href="${trackingUrl}">Acompanhar entrega no site dos Correios</a></p>
      <p style="margin-top:8px;color:#777;font-size:12.5px">Se o link não abrir automaticamente com o código preenchido, é só colar o código acima na página de rastreamento dos Correios.</p>
      <p style="margin-top:24px;color:#777;font-size:12px">Criativo Brasil 3D</p>
    `,
  });
}

module.exports = { sendNewOrderEmail, sendShippedEmail };
