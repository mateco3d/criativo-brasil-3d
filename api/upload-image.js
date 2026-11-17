/*
   CRIATIVO BRASIL 3D — Upload de imagem de produto (Vercel Blob)
   -------------------------------------------------------------------
   POST /api/upload-image  { image: 'data:image/jpeg;base64,...' }  → protegido
     por Basic Auth (so o painel admin pode enviar fotos).

   Antes, cada foto de produto era guardada como texto (base64) direto dentro
   do cadastro do produto (campo 'images' em store_data/products). Isso fazia
   o PUT /api/store (que reenvia o catalogo inteiro a cada salvamento) crescer
   rapido e bater no limite de 4.5MB por requisicao que a Vercel impoe em toda
   funcao serverless — gerando a mensagem de 'sucesso' no admin sem o produto
   realmente salvar.

   Agora o admin (admin/produto-form.html) manda cada foto pra esta rota
   primeiro. Aqui ela e enviada pra Vercel Blob (armazenamento de arquivos,
   separado do banco) e devolvemos so a URL publica — um texto pequeno — que
   e o que realmente fica salvo no cadastro do produto. Isso tira as fotos do
   caminho do limite de 4.5MB de vez, nao importa quantos produtos/fotos
   existam.
   -------------------------------------------------------------------
*/

const { put } = require('@vercel/blob');
const { requireAdmin } = require('./_auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  if (!requireAdmin(req, res)) return;

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }

  const image = body && body.image;
  if (!image || typeof image !== 'string') {
    res.status(400).json({ error: 'Envie { image: "data:image/...;base64,..." }.' });
    return;
  }

  const match = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    res.status(400).json({ error: 'Formato de imagem invalido (precisa ser um data URL base64).' });
    return;
  }

  try {
    const contentType = match[1];
    const ext = contentType.split('/')[1] || 'jpg';
    const buffer = Buffer.from(match[2], 'base64');
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
    });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Erro ao enviar imagem para a Vercel Blob:', err);
    res.status(500).json({ error: 'Nao foi possivel enviar a imagem. Tente novamente.' });
  }
};
