# Roteiro: migrando para a versão Full-Stack (Next.js + PostgreSQL)

Este documento descreve como transformar o protótipo HTML/CSS/JS entregue
nesta pasta na loja full-stack real, com banco de dados, autenticação e
pagamentos/frete integrados de verdade — usando exatamente a stack pedida:
Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Node.js, PostgreSQL,
Prisma, NextAuth e Cloudinary.

## Por que o protótipo não é Next.js

O ambiente onde este projeto foi gerado não tinha acesso à internet
(`npm`/`npx` bloqueados por política de rede), então não foi possível rodar
`create-next-app` nem instalar nenhuma dependência. Para não travar a
entrega, o site foi construído em HTML/CSS/JS puro — sem build step — mas
já estruturado (nomes de página, campos de formulário, fluxo de dados) para
ser portado 1:1 para Next.js.

## Passo a passo da migração

### 1. Criar o projeto Next.js
```bash
npx create-next-app@latest criativo-brasil-3d-app --typescript --tailwind --eslint --app --src-dir
cd criativo-brasil-3d-app
npm install prisma @prisma/client next-auth @auth/prisma-adapter cloudinary framer-motion zod react-hook-form
npx prisma init
```

### 2. Banco de dados
- Suba um PostgreSQL (Neon, Supabase, Railway ou RDS).
- Copie `prisma/schema.prisma` (já pronto nesta pasta) para o novo projeto.
- Configure `DATABASE_URL` no `.env`.
- Rode `npx prisma migrate dev --name init`.
- Escreva um `seed.ts` migrando os dados de `assets/js/data.js` (produtos,
  categorias, avaliações) para o banco via Prisma.

### 3. Páginas → Rotas do App Router
| Página estática              | Rota Next.js                          |
|-------------------------------|----------------------------------------|
| `index.html`                  | `app/page.tsx`                        |
| `produtos.html`                | `app/produtos/page.tsx`               |
| `produto.html?slug=`           | `app/produto/[slug]/page.tsx`         |
| `carrinho.html`                | `app/carrinho/page.tsx`               |
| `checkout.html`                | `app/checkout/page.tsx`               |
| `minha-conta.html`             | `app/conta/page.tsx` (+ layout com tabs) |
| `admin/*.html`                 | `app/admin/*` (protegido por middleware) |

Cada componente visual (`ProductCard`, `Header`, `Footer`, `MiniCart`, etc.)
pode ser extraído quase diretamente do HTML/CSS já pronto em
`assets/css/style.css` — as classes CSS podem virar componentes Tailwind ou
o próprio CSS pode ser importado globalmente em `app/globals.css`.

### 4. Autenticação — NextAuth
Configure `app/api/auth/[...nextauth]/route.ts` com o `PrismaAdapter`,
provider de credenciais (e-mail/senha) e, opcionalmente, Google OAuth.
As páginas `login.html`, `cadastro.html` e `esqueci-senha.html` viram
formulários que chamam `signIn()` do NextAuth.

### 5. Imagens e vídeos — Cloudinary
No painel admin (`produto-form.html`), o "upload box" deve ser substituído
por um widget de upload do Cloudinary (`next-cloudinary` ou upload direto
via API assinada). Salve `secure_url` e `public_id` em `ProductImage`.

### 6. Frete — Correios
A função mock `calcularFrete()` em `assets/js/main.js` deve virar uma API
Route (`app/api/frete/route.ts`) que:
1. Consulta o CEP (ViaCEP ou API dos Correios) para preencher o endereço.
2. Calcula PAC/SEDEX via [API de cálculo de frete dos Correios](https://www.correios.com.br)
   ou um agregador (Melhor Envio / Frenet), que também emite etiquetas.
3. Retorna preço e prazo por modalidade — mesmo formato já usado no mock,
   então o front-end quase não muda.

### 7. Pagamentos — Stripe / Mercado Pago / Pix
- **Stripe:** `app/api/checkout/stripe/route.ts` cria um `PaymentIntent`;
  webhook em `app/api/webhooks/stripe/route.ts` confirma o pagamento e
  atualiza `Order.status`.
- **Mercado Pago:** SDK `mercadopago` para gerar cobrança Pix/cartão/boleto;
  webhook próprio para confirmação automática.
- O checkout de página única (`checkout.html`) já está estruturado com as
  3 abas (Pix / Cartão / Boleto) prontas para receber esses SDKs.

### 8. Painel Admin
Os CRUDs mock (`AdminStore` em `assets/js/admin.js`, hoje em localStorage)
viram Server Actions ou API Routes autenticadas (`middleware.ts` checando
`role === 'ADMIN'`), usando Prisma diretamente:
- `POST /api/admin/produtos`, `PUT/DELETE /api/admin/produtos/[id]`
- Idem para categorias, banners, cupons e pedidos.
- Os gráficos (`barChart`/`donutChart`, hoje CSS puro) podem continuar como
  estão ou migrar para uma lib como Recharts — os dados viriam de queries
  agregadas do Prisma (`groupBy`, `sum`).

### 9. SEO e Performance
- Meta tags e JSON-LD já estão no HTML — em Next.js usar a API `generateMetadata`.
- `sitemap.xml`/`robots.txt` viram `app/sitemap.ts` e `app/robots.ts` dinâmicos.
- Usar `next/image` para lazy loading e otimização automática das imagens do Cloudinary.
- Rodar `npm run build && npx serve` e auditar com Lighthouse antes do deploy.

### 10. Deploy
Recomendado: **Vercel** (ideal para Next.js) + banco no **Neon/Supabase** +
domínio próprio. Configure as variáveis de ambiente (`DATABASE_URL`,
`NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`, `MERCADOPAGO_ACCESS_TOKEN`,
`CLOUDINARY_URL`, etc.) no painel do Vercel.

---

**Resumindo:** o visual, o fluxo de telas e os dados que cada página precisa
já estão 100% definidos neste protótipo. O trabalho de migração é
"encanamento" — plugar banco, autenticação e pagamento real por trás de uma
interface que já foi validada com você.
