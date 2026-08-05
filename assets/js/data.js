/* ===================================================================
   CRIATIVO BRASIL 3D — Mock Data Layer
   Em produção, isto seria substituído por chamadas à API (Next.js API
   Routes + Prisma + PostgreSQL). Ver /prisma/schema.prisma
=================================================================== */

// ---------- Ícones SVG por categoria (usados como "foto" de produto) ----------
const ICONS = {
  geek: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/></svg>',
  funko: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="7" r="4"/><path d="M8 21v-6a4 4 0 0 1 8 0v6"/><circle cx="9.5" cy="6.5" r=".6" fill="currentColor"/><circle cx="14.5" cy="6.5" r=".6" fill="currentColor"/></svg>',
  organizacao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="15" width="7" height="5" rx="1"/><rect x="14" y="15" width="7" height="5" rx="1"/></svg>',
  casa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
  escritorio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M8 21h8M12 17v4"/></svg>',
  narguile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><ellipse cx="12" cy="19" rx="7" ry="2.2"/><path d="M12 17V8"/><circle cx="12" cy="5" r="3"/><path d="M17 10c2 1 3 2 3 4"/></svg>',
  automotivo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 13l1.6-4.8A2 2 0 0 1 6.5 7h11a2 2 0 0 1 1.9 1.2L21 13"/><rect x="2.5" y="13" width="19" height="5" rx="1.5"/><circle cx="7" cy="18.5" r="1.6"/><circle cx="17" cy="18.5" r="1.6"/></svg>',
  personalizados: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>',
};
function iconFor(cat){ return ICONS[cat] || ICONS.personalizados; }

// ---------- Categorias ----------
// Cada categoria pode ter subcategorias (ex.: categoria "Casa" > subcategoria
// "Banheiro"). Cadastradas pelo admin em admin/categorias.html. O campo
// `subcategories` é sempre um array (pode ser vazio) de { slug, name }.
const CATEGORIES = [
  { slug: 'geek', name: 'Geek', desc: 'Nerd, games e cultura pop', subcategories: [] },
  { slug: 'funko', name: 'Funko', desc: 'Personalizados e colecionáveis', subcategories: [] },
  { slug: 'organizacao', name: 'Organização', desc: 'Praticidade pro dia a dia', subcategories: [] },
  { slug: 'casa', name: 'Casa', desc: 'Decoração e utilidades', subcategories: [] },
  { slug: 'escritorio', name: 'Escritório', desc: 'Home office com estilo', subcategories: [] },
  { slug: 'narguile', name: 'Narguile', desc: 'Acessórios exclusivos', subcategories: [] },
  { slug: 'automotivo', name: 'Automotivo', desc: 'Peças e acessórios', subcategories: [] },
  { slug: 'personalizados', name: 'Personalizados', desc: 'Feito sob medida', subcategories: [] },
];

// ---------- Produtos ----------
// preco em BRL; tags: novo | promocao | mais-vendido
const PRODUCTS = [
  // Catálogo zerado — cadastre os produtos reais pelo painel admin (admin/produtos.html).
];

function productImgSvg(p, size=400){
  return `<div class="icon-wrap" style="width:100%;height:100%;background:linear-gradient(145deg,#f4f4f4,#e9e9e9)">${iconFor(p.cat)}</div>`;
}

function getProduct(slugOrId){
  return PRODUCTS.find(p => p.slug === slugOrId || p.id === slugOrId);
}
function relatedProducts(p, n=4){
  return PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0,n);
}
function formatBRL(v){
  return v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
}
function installmentText(price){
  const n = 3;
  return `em até ${n}x de ${formatBRL(price/n)} sem juros`;
}

// ---------- Banners do Hero ----------
const BANNERS = [
  { tag:'Impressão 3D Sob Medida', title:'Transforme sua ideia em realidade física', text:'Do projeto ao objeto, produção própria com qualidade premium.', cta:'Comprar Agora', link:'produtos.html' },
  { tag:'Decoração Geek', title:'Sua estante merece um upgrade nerd', text:'Suportes, luminárias e colecionáveis exclusivos.', cta:'Comprar Agora', link:'produtos.html?cat=geek' },
  { tag:'Funko Personalizado', title:'Você, em versão colecionável', text:'Envie sua foto e criamos seu Funko exclusivo.', cta:'Comprar Agora', link:'produtos.html?cat=funko' },
  { tag:'Acessórios para Casa', title:'Decoração com identidade própria', text:'Peças autorais para deixar sua casa com a sua cara.', cta:'Comprar Agora', link:'produtos.html?cat=casa' },
  { tag:'Organização', title:'Praticidade que cabe na sua rotina', text:'Soluções inteligentes para casa e trabalho.', cta:'Comprar Agora', link:'produtos.html?cat=organizacao' },
  { tag:'Narguile', title:'Acessórios exclusivos para seu setup', text:'Peças personalizadas com acabamento premium.', cta:'Comprar Agora', link:'produtos.html?cat=narguile' },
  { tag:'Peças Automotivas', title:'Seu carro, do seu jeito', text:'Suportes, emblemas e organizadores sob medida.', cta:'Comprar Agora', link:'produtos.html?cat=automotivo' },
  { tag:'Lançamentos', title:'Novidades toda semana', text:'Confira os últimos modelos que acabaram de chegar.', cta:'Ver Lançamentos', link:'produtos.html?filter=novo' },
];

// ---------- Avaliações (home) ----------
const REVIEWS = [
  { name:'Camila Souza', loc:'São Paulo, SP', text:'Comprei o Funko personalizado e ficou idêntico à foto que mandei! Acabamento impecável e chegou super rápido.', stars:5 },
  { name:'Rafael Lima', loc:'Belo Horizonte, MG', text:'A luminária lua ficou show na sala. Qualidade de impressão excelente, recomendo demais a loja.', stars:5 },
  { name:'Juliana Prado', loc:'Curitiba, PR', text:'Pedi peças personalizadas para o meu carro, ficaram perfeitas e o suporte deles foi muito atencioso.', stars:5 },
  { name:'Diego Martins', loc:'Porto Alegre, RS', text:'Já é a terceira compra que faço, sempre chega bem embalado e no prazo combinado.', stars:4 },
  { name:'Fernanda Alves', loc:'Salvador, BA', text:'O topo de bolo personalizado foi o toque especial da festa da minha filha. Amei o resultado!', stars:5 },
  { name:'Bruno Castro', loc:'Recife, PE', text:'Ótimo custo-benefício e atendimento rápido pelo WhatsApp. Voltarei a comprar com certeza.', stars:5 },
];

// ---------- Perguntas e respostas (produto) ----------
const QA_SAMPLE = [
  { q:'O produto vem pintado ou apenas na cor do filamento?', a:'Depende do modelo: itens com tag "Full Color" já vêm pintados à mão; os demais são entregues na cor do filamento selecionado.' },
  { q:'Qual o prazo de produção antes do envio?', a:'O prazo de produção está descrito em cada produto (normalmente de 1 a 7 dias úteis) e começa a contar após a confirmação do pagamento.' },
  { q:'Posso pedir uma cor personalizada que não está na lista?', a:'Sim! Entre em contato pelo WhatsApp antes da compra e verificamos a disponibilidade do filamento na cor desejada.' },
];

/* ---------------- Sincroniza com o Painel Admin ----------------
   O painel admin salva os dados em localStorage (este protótipo ainda não
   tem banco de dados real — ver docs/ARQUITETURA.md). Sem isto, produtos,
   categorias e banners criados/editados/excluídos no admin não apareciam
   na loja, porque as páginas da loja liam direto dos arrays estáticos
   acima. Aqui sobrescrevemos esses arrays com o que estiver salvo no
   localStorage (se houver), logo após serem declarados, para que loja e
   admin sempre mostrem os mesmos dados no mesmo navegador/dispositivo. */
(function syncFromAdminStore(){
  function applyOverride(list, storageKey){
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(saved)) { list.length = 0; list.push(...saved); }
    } catch (e) { /* localStorage indisponível ou dado inválido: mantém os dados padrão */ }
  }
  applyOverride(PRODUCTS, 'cb3d_admin_products');
  applyOverride(CATEGORIES, 'cb3d_admin_categories');
  applyOverride(BANNERS, 'cb3d_admin_banners');
})();
