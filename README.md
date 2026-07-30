# Criativo Brasil 3D — Loja Virtual

Site completo da loja **Criativo Brasil 3D** (impressão 3D), construído como
protótipo estático de alta fidelidade — HTML5, CSS3 e JavaScript puro, sem
necessidade de build ou instalação de dependências.

## Como abrir

Não precisa instalar nada. Duas formas:

1. **Direto no navegador:** abra o arquivo `index.html` com duplo clique.
2. **Servidor local (recomendado, evita bloqueios de CORS/localStorage do
   navegador):**
   ```bash
   npx http-server . -p 8080
   # ou
   python3 -m http.server 8080
   ```
   Depois acesse `http://localhost:8080`.

## Estrutura do projeto

```
/index.html              → Página inicial (banner, categorias, destaques...)
/produtos.html            → Listagem/catálogo com filtros e busca
/produto.html?slug=...    → Página de produto (galeria, specs, Q&A, avaliações)
/carrinho.html            → Carrinho de compras
/checkout.html            → Checkout de página única (CEP, frete, pagamento)
/pedido-confirmado.html   → Confirmação de pedido
/login.html /cadastro.html /esqueci-senha.html → Autenticação
/minha-conta.html         → Pedidos, favoritos, endereços, dados pessoais
/sobre.html /contato.html /faq.html
/trocas.html /privacidade.html /termos.html
/404.html                 → Página de erro personalizada
/admin/                   → Painel administrativo completo
  index.html               → Dashboard com gráficos
  produtos.html            → Lista de produtos (CRUD)
  produto-form.html        → Cadastro/edição de produto (todos os campos)
  categorias.html          → CRUD de categorias
  banners.html             → Gestão dos banners do carrossel
  pedidos.html             → Gestão de pedidos e status
  cupons.html              → Cupons e promoções
  clientes.html            → Base de clientes
/assets/css/style.css     → Design system (cores, componentes, responsivo)
/assets/css/admin.css     → Estilos do painel admin
/assets/js/data.js        → Catálogo mock (produtos, categorias, avaliações)
/assets/js/main.js        → Carrinho, busca, CEP/frete mock, UI
/assets/js/admin.js       → Layout e CRUD mock do painel admin
/prisma/schema.prisma     → Modelo de banco de dados para a versão full-stack
/sitemap.xml /robots.txt  → SEO técnico
```

## O que já funciona neste protótipo

- Carrinho de compras persistente (localStorage), com mini-carrinho lateral
- Busca com autocomplete
- Favoritos
- Simulação de consulta de CEP e cálculo de frete (PAC/SEDEX/Transportadora)
- Checkout completo com seleção de frete e forma de pagamento
- Painel administrativo com dashboard, CRUD de produtos/categorias/banners/
  cupons, gestão de pedidos com mudança de status e "emissão de etiqueta"
- Todas as páginas 100% responsivas (mobile, tablet, desktop)

## Importante: este é um protótipo front-end

Os dados (produtos, pedidos, clientes) são simulados em `assets/js/data.js`
e no `localStorage` do navegador — não há banco de dados real, nem
processamento real de pagamento/frete. Isso foi necessário porque o ambiente
usado para gerar este projeto não tinha acesso à internet para instalar
Next.js/Prisma/PostgreSQL.

Veja **`docs/ARQUITETURA.md`** para o roteiro completo de como migrar este
front-end para a versão full-stack real (Next.js + PostgreSQL + Stripe/
Mercado Pago + Correios + Cloudinary), incluindo o schema de banco já pronto
em `prisma/schema.prisma`.
