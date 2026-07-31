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
const CATEGORIES = [
  { slug: 'geek', name: 'Geek', desc: 'Nerd, games e cultura pop' },
  { slug: 'funko', name: 'Funko', desc: 'Personalizados e colecionáveis' },
  { slug: 'organizacao', name: 'Organização', desc: 'Praticidade pro dia a dia' },
  { slug: 'casa', name: 'Casa', desc: 'Decoração e utilidades' },
  { slug: 'escritorio', name: 'Escritório', desc: 'Home office com estilo' },
  { slug: 'narguile', name: 'Narguile', desc: 'Acessórios exclusivos' },
  { slug: 'automotivo', name: 'Automotivo', desc: 'Peças e acessórios' },
  { slug: 'personalizados', name: 'Personalizados', desc: 'Feito sob medida' },
];

// ---------- Produtos ----------
// preco em BRL; tags: novo | promocao | mais-vendido
const PRODUCTS = [
  { id:'p01', slug:'suporte-headset-dragao', name:'Suporte de Headset Dragão', cat:'geek', price:89.9, promo:69.9, stock:24, tags:['mais-vendido'], rating:4.8, reviews:132, sku:'CB3D-GK-001', material:'PLA Premium', peso:'320g', dim:'18x12x22cm', producao:'2 a 4 dias úteis', cor:'Preto e Dourado', short:'Suporte de headset gamer em formato de dragão, acabamento premium.', desc:'Suporte de headset com design de dragão, impresso em PLA de alta resistência com acabamento liso. Perfeito para setups gamers e geek. Base emborrachada antirrisco.' },
  { id:'p02', slug:'luminaria-lightsaber', name:'Luminária Sabre de Luz', cat:'geek', price:129.9, promo:null, stock:18, tags:['novo'], rating:4.9, reviews:58, sku:'CB3D-GK-002', material:'PETG Translúcido', peso:'210g', dim:'6x6x38cm', producao:'3 a 5 dias úteis', cor:'Azul / Vermelho / Verde', short:'Luminária de LED inspirada em sabre de luz, ótima para decoração geek.', desc:'Luminária com efeito de sabre de luz feita em PETG translúcido com LED embutido. Controle touch com 3 níveis de intensidade. Alimentação USB inclusa.' },
  { id:'p03', slug:'action-figure-articulado-robo', name:'Action Figure Articulado Robô', cat:'geek', price:159.9, promo:139.9, stock:9, tags:['promocao'], rating:4.7, reviews:44, sku:'CB3D-GK-003', material:'PLA + Juntas em Nylon', peso:'180g', dim:'8x6x16cm', producao:'5 a 7 dias úteis', cor:'Cinza Metálico', short:'Boneco robô com articulações móveis, pintado à mão.', desc:'Figure totalmente articulado com mais de 12 pontos de movimento. Impresso em peças separadas e montado manualmente com pintura acrílica de alta durabilidade.' },
  { id:'p04', slug:'funko-personalizado-rosto', name:'Funko Personalizado com Seu Rosto', cat:'funko', price:149.9, promo:119.9, stock:40, tags:['mais-vendido','promocao'], rating:5.0, reviews:301, sku:'CB3D-FK-001', material:'Resina PLA', peso:'140g', dim:'7x7x12cm', producao:'4 a 6 dias úteis', cor:'Full Color', short:'Boneco estilo Funko Pop com o seu rosto, feito sob encomenda.', desc:'Envie uma foto e criamos um Funko exclusivo com suas características. Ideal para presentes e decoração. Pintura em UV resistente a desbotamento.' },
  { id:'p05', slug:'funko-casal-noivos', name:'Funko Casal Noivos Personalizado', cat:'funko', price:249.9, promo:null, stock:15, tags:['novo'], rating:4.9, reviews:76, sku:'CB3D-FK-002', material:'Resina PLA', peso:'260g', dim:'14x8x12cm', producao:'6 a 9 dias úteis', cor:'Full Color', short:'Dupla personalizada para casamentos e noivados.', desc:'Par de bonecos personalizados para o topo do bolo ou lembrancinha. Roupas, cabelo e acessórios replicados com fidelidade a partir de fotos enviadas.' },
  { id:'p06', slug:'funko-pet-personalizado', name:'Funko Pet Personalizado', cat:'funko', price:119.9, promo:99.9, stock:28, tags:['promocao'], rating:4.8, reviews:112, sku:'CB3D-FK-003', material:'Resina PLA', peso:'110g', dim:'6x6x10cm', producao:'4 a 6 dias úteis', cor:'Full Color', short:'Réplica do seu pet em estilo colecionável.', desc:'Transforme seu melhor amigo em um colecionável exclusivo. Perfeito para amantes de pets. Base com nome personalizado incluída.' },
  { id:'p07', slug:'organizador-mesa-modular', name:'Organizador de Mesa Modular', cat:'organizacao', price:79.9, promo:null, stock:52, tags:[], rating:4.6, reviews:88, sku:'CB3D-OR-001', material:'PLA', peso:'260g', dim:'20x10x8cm', producao:'2 a 3 dias úteis', cor:'Preto', short:'Sistema modular para organizar canetas, clipes e cartões.', desc:'Módulos encaixáveis que se adaptam ao seu espaço. Compartimentos para canetas, post-its, clipes e cartões de visita.' },
  { id:'p08', slug:'porta-controle-parede', name:'Porta Controle de Parede', cat:'organizacao', price:49.9, promo:39.9, stock:65, tags:['mais-vendido'], rating:4.7, reviews:210, sku:'CB3D-OR-002', material:'PLA', peso:'90g', dim:'22x8x6cm', producao:'1 a 2 dias úteis', cor:'Branco / Preto', short:'Suporte de parede para até 3 controles remotos.', desc:'Praticidade para a sala de estar: organize os controles remotos com este suporte de fixação simples, sem furar a parede (fita 3M inclusa).' },
  { id:'p09', slug:'organizador-cabos-usb', name:'Organizador de Cabos USB', cat:'organizacao', price:34.9, promo:null, stock:120, tags:['novo'], rating:4.5, reviews:39, sku:'CB3D-OR-003', material:'PLA', peso:'40g', dim:'8x4x3cm', producao:'1 a 2 dias úteis', cor:'Diversas cores', short:'Kit com 4 clips para organizar cabos na mesa.', desc:'Fim da bagunça de fios! Kit com 4 unidades de clips que prendem na borda da mesa e organizam seus cabos USB.' },
  { id:'p10', slug:'vaso-geometrico-decorativo', name:'Vaso Geométrico Decorativo', cat:'casa', price:69.9, promo:null, stock:33, tags:[], rating:4.8, reviews:95, sku:'CB3D-CS-001', material:'PLA', peso:'180g', dim:'12x12x16cm', producao:'2 a 4 dias úteis', cor:'Dourado / Preto Fosco', short:'Vaso com padrão geométrico facetado para plantas pequenas.', desc:'Vaso autoral com padrão low-poly, acabamento fosco premium. Ideal para suculentas e cactos. Furo de drenagem incluso.' },
  { id:'p11', slug:'porta-retrato-articulado', name:'Porta Retrato Articulado 3 Fotos', cat:'casa', price:59.9, promo:44.9, stock:41, tags:['promocao'], rating:4.6, reviews:52, sku:'CB3D-CS-002', material:'PLA', peso:'150g', dim:'24x10x2cm', producao:'2 a 3 dias úteis', cor:'Preto / Branco', short:'Porta retrato dobrável para 3 fotos 10x15.', desc:'Peça articulada que dobra e fecha como um livro, protegendo suas fotos impressas. Acabamento elegante para mesa de centro.' },
  { id:'p12', slug:'luminaria-lua-3d', name:'Luminária Lua 3D', cat:'casa', price:99.9, promo:null, stock:22, tags:['mais-vendido'], rating:4.9, reviews:187, sku:'CB3D-CS-003', material:'PLA Textura Especial', peso:'240g', dim:'15x15x15cm', producao:'3 a 5 dias úteis', cor:'Branco Texturizado', short:'Luminária esférica com textura realista da superfície lunar.', desc:'Impressão em camadas que reproduz o relevo lunar. Base de madeira e LED com fio USB. Um clássico atemporal para decoração.' },
  { id:'p13', slug:'suporte-notebook-ergonomico', name:'Suporte de Notebook Ergonômico', cat:'escritorio', price:119.9, promo:99.9, stock:30, tags:['promocao'], rating:4.7, reviews:64, sku:'CB3D-ES-001', material:'PETG', peso:'420g', dim:'26x22x14cm', producao:'3 a 4 dias úteis', cor:'Preto', short:'Eleva o notebook para melhorar postura e ventilação.', desc:'Design vazado para dissipação de calor, ângulo otimizado para ergonomia. Suporta notebooks de 13" a 17".' },
  { id:'p14', slug:'porta-canetas-hexagonal', name:'Porta Canetas Hexagonal', cat:'escritorio', price:29.9, promo:null, stock:80, tags:[], rating:4.5, reviews:41, sku:'CB3D-ES-002', material:'PLA', peso:'70g', dim:'8x8x10cm', producao:'1 a 2 dias úteis', cor:'Amarelo Ouro', short:'Porta canetas com design hexagonal minimalista.', desc:'Peça simples e elegante para deixar sua mesa organizada com estilo. Disponível em várias cores.' },
  { id:'p15', slug:'suporte-monitor-gavetas', name:'Suporte de Monitor com Gavetas', cat:'escritorio', price:189.9, promo:null, stock:12, tags:['novo'], rating:4.8, reviews:23, sku:'CB3D-ES-003', material:'PETG', peso:'980g', dim:'40x24x12cm', producao:'5 a 7 dias úteis', cor:'Preto', short:'Eleva o monitor e ainda ganha 2 gavetas de organização.', desc:'Suporte robusto para monitores de até 27". Duas gavetas integradas para guardar acessórios de escritório.' },
  { id:'p16', slug:'piteira-narguile-personalizada', name:'Piteira de Narguile Personalizada', cat:'narguile', price:44.9, promo:null, stock:70, tags:['mais-vendido'], rating:4.7, reviews:158, sku:'CB3D-NG-001', material:'PLA Food Safe', peso:'30g', dim:'3x3x8cm', producao:'1 a 2 dias úteis', cor:'Diversas cores', short:'Piteira pessoal com acabamento liso e nome personalizado.', desc:'Piteira individual impressa com filamento atóxico. Personalize com seu nome ou apelido gravado no corpo.' },
  { id:'p17', slug:'base-narguile-led', name:'Base de Narguile com Efeito LED', cat:'narguile', price:139.9, promo:119.9, stock:16, tags:['promocao'], rating:4.8, reviews:47, sku:'CB3D-NG-002', material:'PETG', peso:'380g', dim:'18x18x10cm', producao:'3 a 5 dias úteis', cor:'Transparente / Preto', short:'Base decorativa com iluminação LED embutida.', desc:'Base robusta e estável, com compartimento para fita de LED (inclusa) e efeito de luz difusa ao redor do vaso.' },
  { id:'p18', slug:'suporte-mangueira-narguile', name:'Suporte para Mangueira de Narguile', cat:'narguile', price:39.9, promo:null, stock:55, tags:[], rating:4.5, reviews:29, sku:'CB3D-NG-003', material:'PLA', peso:'55g', dim:'10x6x8cm', producao:'1 a 2 dias úteis', cor:'Preto / Dourado', short:'Suporte que evita que a mangueira fique no chão.', desc:'Peça prática que se encaixa na base do narguile, mantendo a mangueira sempre limpa e organizada.' },
  { id:'p19', slug:'suporte-celular-carro', name:'Suporte de Celular Veicular', cat:'automotivo', price:54.9, promo:44.9, stock:60, tags:['mais-vendido','promocao'], rating:4.6, reviews:203, sku:'CB3D-AU-001', material:'PETG', peso:'110g', dim:'9x6x14cm', producao:'2 a 3 dias úteis', cor:'Preto', short:'Suporte veicular para saída de ar, encaixe universal.', desc:'Fixação firme na saída de ar do painel, compatível com a maioria dos smartphones. Ajuste articulado 360°.' },
  { id:'p20', slug:'emblema-personalizado-carro', name:'Emblema Personalizado para Carro', cat:'automotivo', price:64.9, promo:null, stock:38, tags:['novo'], rating:4.7, reviews:35, sku:'CB3D-AU-002', material:'PLA + Verniz UV', peso:'45g', dim:'8x8x1cm', producao:'2 a 4 dias úteis', cor:'Diversas cores', short:'Emblema exclusivo com seu nome, apelido ou brasão.', desc:'Emblema resistente a intempéries com adesivo automotivo 3M. Ótimo para personalizar o painel ou porta-malas.' },
  { id:'p21', slug:'organizador-porta-malas', name:'Organizador de Porta-Malas Modular', cat:'automotivo', price:149.9, promo:129.9, stock:14, tags:['promocao'], rating:4.8, reviews:51, sku:'CB3D-AU-003', material:'PETG', peso:'720g', dim:'40x30x20cm', producao:'4 a 6 dias úteis', cor:'Preto', short:'Sistema modular para organizar itens no porta-malas.', desc:'Compartimentos ajustáveis que se encaixam entre si, mantendo ferramentas e itens de emergência sempre no lugar.' },
  { id:'p22', slug:'nome-mesa-personalizado', name:'Nome de Mesa Personalizado 3D', cat:'personalizados', price:74.9, promo:null, stock:45, tags:['mais-vendido'], rating:4.9, reviews:264, sku:'CB3D-PS-001', material:'PLA', peso:'160g', dim:'variável', producao:'2 a 4 dias úteis', cor:'Diversas cores', short:'Seu nome impresso em 3D para decorar mesas e estantes.', desc:'Escolha o nome, fonte e cor. Peça em uma única impressão sólida, ótimo acabamento e acabamento fosco ou brilhante.' },
  { id:'p23', slug:'topo-bolo-personalizado', name:'Topo de Bolo Personalizado', cat:'personalizados', price:59.9, promo:49.9, stock:50, tags:['promocao'], rating:4.9, reviews:178, sku:'CB3D-PS-002', material:'PLA', peso:'80g', dim:'15x10x1cm', producao:'2 a 3 dias úteis', cor:'Dourado / Preto / Branco', short:'Topo de bolo sob medida para qualquer tema de festa.', desc:'Criamos o design conforme a sua ideia: aniversário, casamento, chá revelação. Envie referências e personalizamos.' },
  { id:'p24', slug:'chaveiro-personalizado-logo', name:'Chaveiro Personalizado com Logo', cat:'personalizados', price:24.9, promo:null, stock:150, tags:['novo'], rating:4.6, reviews:67, sku:'CB3D-PS-003', material:'PLA', peso:'20g', dim:'5x5x0.5cm', producao:'1 a 2 dias úteis', cor:'Diversas cores', short:'Chaveiro com sua logo ou desenho personalizado.', desc:'Ótimo para brindes corporativos e presentes em grupo. Peça orçamento especial para quantidades acima de 20 unidades.' },
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
