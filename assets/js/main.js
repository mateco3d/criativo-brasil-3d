/* ===================================================================
   CRIATIVO BRASIL 3D — Core JS (header/footer, carrinho, busca, UI)
=================================================================== */

/* ---------------- Contato / WhatsApp da loja ----------------
   Único lugar para configurar o número de WhatsApp da loja. Troque os
   dois valores abaixo pelos reais e todo o site atualiza sozinho: botão
   flutuante do WhatsApp, ícone do rodapé, botão e telefone exibidos na
   página Contato.
   - STORE_WHATSAPP: só dígitos, com código do país (55) + DDD + número.
   - STORE_PHONE_DISPLAY: o mesmo número, formatado para exibição.
*/
const STORE_WHATSAPP = '5511912345678'; // TODO: troque pelo número real da loja
const STORE_PHONE_DISPLAY = '(11) 91234-5678'; // TODO: troque pelo telefone formatado
function waLink(text){
  return `https://wa.me/${STORE_WHATSAPP}${text ? '?text=' + encodeURIComponent(text) : ''}`;
}

/* ---------------- Ícones utilitários ---------------- */
const ICO = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4A5.6 5.6 0 0 1 12 7.5 5.6 5.6 0 0 1 18.4 4C22 4.5 23.6 8 22 11.7 19.5 16.4 12 21 12 21z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.943c0 2.105.549 4.16 1.595 5.973L0 24l6.335-1.652a11.882 11.882 0 0 0 5.71 1.447h.005c6.585 0 11.946-5.363 11.949-11.946 0-3.19-1.24-6.187-3.479-8.4"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 8h13v8H1zM14 11h4l4 3v2h-8z"/><circle cx="6" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/></svg>',
  factory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21V10l5 3V10l5 3V7l6 4v10z"/><path d="M3 21h18"/></svg>',
  medal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="9" r="6"/><path d="M8.5 14.5L6 22l6-3 6 3-2.5-7.5"/></svg>',
  headset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2" y="13" width="5" height="7" rx="2"/><rect x="17" y="13" width="5" height="7" rx="2"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
  fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h2.7l.4-3.3H13V8.6c0-1 .3-1.6 1.7-1.6H16V4.1C15.6 4 14.5 4 13.3 4c-2.5 0-4.3 1.5-4.3 4.3v2.4H6.5v3.3H9V22z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>',
  top: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
};

/* ---------------- Carrinho (localStorage) ---------------- */
// Itens do carrinho são identificados por produto + cor escolhida (quando o
// produto tem opções de cor cadastradas no admin — ver admin/produto-form.html
// e produto.html). Duas cores do mesmo produto viram linhas separadas no
// carrinho; `color` fica `null` para produtos sem seleção de cor.
function escJs(str){ return String(str==null?'':str).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
const Cart = {
  key: 'cb3d_cart',
  get(){ try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch(e){ return []; } },
  save(items){ localStorage.setItem(this.key, JSON.stringify(items)); document.dispatchEvent(new CustomEvent('cart:update')); },
  add(productId, qty=1, color=null){
    const items = this.get();
    const found = items.find(i => i.id === productId && (i.color||null) === (color||null));
    if (found) found.qty += qty; else items.push({ id: productId, qty, color: color||null });
    this.save(items);
  },
  setQty(productId, qty, color=null){
    let items = this.get();
    if (qty <= 0) items = items.filter(i => !(i.id === productId && (i.color||null) === (color||null)));
    else { const f = items.find(i=>i.id===productId && (i.color||null) === (color||null)); if (f) f.qty = qty; }
    this.save(items);
  },
  remove(productId, color=null){ this.save(this.get().filter(i => !(i.id === productId && (i.color||null) === (color||null)))); },
  clear(){ this.save([]); },
  count(){ return this.get().reduce((a,i)=>a+i.qty,0); },
  lines(){
    return this.get().map(i => {
      const p = typeof getProduct === 'function' ? getProduct(i.id) : null;
      if (!p) return null;
      const price = p.promo || p.price;
      return { ...i, product: p, unit: price, subtotal: price * i.qty };
    }).filter(Boolean);
  },
  subtotal(){ return this.lines().reduce((a,l)=>a+l.subtotal,0); },
};

const Favorites = {
  key: 'cb3d_favs',
  get(){ try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch(e){ return []; } },
  toggle(id){
    let f = this.get();
    if (f.includes(id)) f = f.filter(x=>x!==id); else f.push(id);
    localStorage.setItem(this.key, JSON.stringify(f));
    document.dispatchEvent(new CustomEvent('fav:update'));
    return f.includes(id);
  },
  has(id){ return this.get().includes(id); },
};

/* ---------------- Header / Footer injeção ---------------- */
function headerHTML(){
  return `
  <header class="site-header" id="siteHeader">
    <div class="header-inner">
      <button class="burger btn-icon" id="burgerBtn" aria-label="Menu">${ICO.menu}</button>
      <a href="index.html" class="logo">
        <img class="mark" src="assets/img/logo.png" alt="Criativo Brasil 3D">
        <span>Criativo Brasil<span class="brand-sub">Impressão 3D</span></span>
      </a>
      <nav class="main-nav" id="mainNav">
        <a href="index.html">Início</a>
        <a href="produtos.html">Produtos</a>
        <a href="produtos.html?filter=mais-vendido">Mais Vendidos</a>
        <a href="produtos.html?filter=novo">Lançamentos</a>
        <a href="sobre.html">Sobre</a>
        <a href="contato.html">Contato</a>
      </nav>
      <div class="header-actions">
        <div class="header-search">
          <input type="text" id="searchInput" placeholder="Buscar produtos..." autocomplete="off">
          ${ICO.search}
          <div class="autocomplete-box" id="autocompleteBox"></div>
        </div>
        <a href="minha-conta.html" class="btn-icon" aria-label="Minha conta">${ICO.user}</a>
        <a href="minha-conta.html?tab=favoritos" class="btn-icon" aria-label="Favoritos">${ICO.heart}</a>
        <button class="btn-icon icon-badge" id="cartBtn" aria-label="Carrinho">${ICO.bag}<span class="count" id="cartCount">0</span></button>
      </div>
    </div>
  </header>`;
}

function footerHTML(){
  return `
  <footer class="site-footer">
    <div class="container footer-top">
      <div class="footer-brand">
        <a href="index.html" class="logo" style="color:#fff">
          <img class="mark" src="assets/img/logo.png" alt="Criativo Brasil 3D">
          <span>Criativo Brasil<span class="brand-sub" style="color:#FFC107">Impressão 3D</span></span>
        </a>
        <p>Produção própria de peças em impressão 3D com qualidade premium. Do geek ao automotivo, transformamos ideias em objetos reais.</p>
        <div class="footer-social">
          <a href="#" aria-label="Instagram">${ICO.insta}</a>
          <a href="#" aria-label="Facebook">${ICO.fb}</a>
          <a href="${waLink()}" target="_blank" aria-label="WhatsApp">${ICO.whatsapp}</a>
        </div>
      </div>
      <div class="footer-col">
        <h5>Menu</h5>
        <ul>
          <li><a href="index.html">Início</a></li>
          <li><a href="produtos.html">Produtos</a></li>
          <li><a href="sobre.html">Sobre Nós</a></li>
          <li><a href="contato.html">Contato</a></li>
          <li><a href="faq.html">Perguntas Frequentes</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Categorias</h5>
        <ul id="footerCats"></ul>
      </div>
      <div class="footer-col">
        <h5>Políticas</h5>
        <ul>
          <li><a href="trocas.html">Política de Trocas</a></li>
          <li><a href="privacidade.html">Privacidade</a></li>
          <li><a href="termos.html">Termos de Uso</a></li>
          <li><a href="carrinho.html">Meu Carrinho</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Contato</h5>
        <ul class="footer-contact">
          <li>${ICO.pin}<span>São Paulo, SP — Envios para todo o Brasil</span></li>
          <li>${ICO.phone}<span>${STORE_PHONE_DISPLAY}</span></li>
          <li>${ICO.mail}<span><a href="mailto:criativo3dbrasil@gmail.com" style="color:inherit">criativo3dbrasil@gmail.com</a></span></li>
        </ul>
      </div>
    </div>
    <div class="container">
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Criativo Brasil 3D. Todos os direitos reservados. CNPJ 00.000.000/0001-00</span>
        <div class="payment-icons">
          <span>PIX</span><span>Visa</span><span>Master</span><span>Boleto</span>
        </div>
      </div>
    </div>
  </footer>`;
}

function floatButtonsHTML(){
  return `
  <a href="${waLink()}" target="_blank" class="whatsapp-float" aria-label="WhatsApp">${ICO.whatsapp}</a>
  <button class="back-top" id="backTopBtn" aria-label="Voltar ao topo">${ICO.top}</button>
  <div class="minicart-overlay" id="minicartOverlay"></div>
  <aside class="minicart" id="minicart">
    <div class="minicart-head">
      <strong>Seu Carrinho</strong>
      <button class="btn-icon" id="closeMinicart">${ICO.close}</button>
    </div>
    <div class="minicart-body" id="minicartBody"></div>
    <div class="minicart-foot">
      <div class="mc-row"><span>Subtotal</span><span id="minicartSubtotal">R$ 0,00</span></div>
      <a href="carrinho.html" class="btn btn-outline btn-block" style="margin-bottom:10px">Ver Carrinho</a>
      <a href="checkout.html" class="btn btn-gold btn-block">Finalizar Compra</a>
    </div>
  </aside>
  <div class="toast" id="toast">
    <div class="ic">${ICO.check}</div>
    <div><strong id="toastTitle">Adicionado!</strong><p id="toastMsg">Produto no carrinho</p></div>
  </div>`;
}

function mountLayout(activeLink){
  const hMount = document.getElementById('site-header');
  const fMount = document.getElementById('site-footer');
  if (hMount) hMount.innerHTML = headerHTML();
  if (fMount) fMount.innerHTML = footerHTML();
  document.body.insertAdjacentHTML('beforeend', floatButtonsHTML());

  // active nav link
  if (activeLink) {
    document.querySelectorAll('.main-nav a').forEach(a=>{
      if (a.getAttribute('href').split('?')[0] === activeLink) a.classList.add('active');
    });
  }
  // footer categories
  const fc = document.getElementById('footerCats');
  if (fc && typeof CATEGORIES !== 'undefined') {
    fc.innerHTML = CATEGORIES.slice(0,6).map(c=>`<li><a href="produtos.html?cat=${c.slug}">${c.name}</a></li>`).join('');
  }

  initHeaderScroll();
  initBurger();
  initSearch();
  initCart();
  initBackTop();
  initReveal();
}

/* ---------------- Header scroll shadow ---------------- */
function initHeaderScroll(){
  const h = document.getElementById('siteHeader');
  if (!h) return;
  window.addEventListener('scroll', ()=>{
    h.classList.toggle('scrolled', window.scrollY > 10);
  });
}

/* ---------------- Mobile menu ---------------- */
function initBurger(){
  const btn = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', ()=>{
    const open = nav.style.display === 'flex';
    nav.style.display = open ? 'none' : 'flex';
    nav.style.cssText += open ? '' : 'position:fixed;top:70px;left:0;right:0;background:#fff;flex-direction:column;padding:20px 24px;gap:18px;box-shadow:0 12px 24px rgba(0,0,0,.08);z-index:150;';
  });
}

/* ---------------- Busca com autocomplete ---------------- */
function initSearch(){
  const input = document.getElementById('searchInput');
  const box = document.getElementById('autocompleteBox');
  if (!input || !box || typeof PRODUCTS === 'undefined') return;
  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { box.classList.remove('show'); return; }
    const results = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.cat.toLowerCase().includes(q) ||
      (p.tags||[]).some(t=>t.includes(q)) ||
      p.short.toLowerCase().includes(q)
    ).slice(0,6);
    if (!results.length){ box.innerHTML = '<div class="autocomplete-item">Nenhum resultado encontrado</div>'; box.classList.add('show'); return; }
    box.innerHTML = results.map(p => `
      <a class="autocomplete-item" href="produto.html?slug=${p.slug}">
        <div style="width:38px;height:38px;border-radius:8px;background:#f2f2f2;display:flex;align-items:center;justify-content:center;color:#121212">${iconFor(p.cat)}</div>
        <div><div class="ac-name">${p.name}</div><div class="ac-price">${formatBRL(p.promo||p.price)}</div></div>
      </a>`).join('');
    box.classList.add('show');
  });
  input.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter') window.location.href = `produtos.html?q=${encodeURIComponent(input.value)}`;
  });
  document.addEventListener('click', (e)=>{
    if (!box.contains(e.target) && e.target !== input) box.classList.remove('show');
  });
}

/* ---------------- Mini carrinho / contador / toast ---------------- */
function renderMinicart(){
  const body = document.getElementById('minicartBody');
  const sub = document.getElementById('minicartSubtotal');
  const count = document.getElementById('cartCount');
  if (count) count.textContent = Cart.count();
  if (!body) return;
  const lines = Cart.lines();
  if (!lines.length){
    body.innerHTML = '<p style="color:#999;text-align:center;padding:40px 0">Seu carrinho está vazio.</p>';
  } else {
    body.innerHTML = lines.map(l => `
      <div class="minicart-item">
        <div class="icon-wrap" style="display:flex;align-items:center;justify-content:center;color:#121212">${iconFor(l.product.cat)}</div>
        <div class="mi-info">
          <div class="mi-name">${l.product.name}${l.color ? ` <span style="color:#999;font-weight:400">— ${l.color}</span>` : ''}</div>
          <div style="font-size:12px;color:#999">${formatBRL(l.unit)}</div>
          <div class="mi-qty">
            <div class="qty-box">
              <button onclick="Cart.setQty('${l.id}', ${l.qty-1}, '${escJs(l.color)}'); renderMinicart();">−</button>
              <span>${l.qty}</span>
              <button onclick="Cart.setQty('${l.id}', ${l.qty+1}, '${escJs(l.color)}'); renderMinicart();">+</button>
            </div>
            <button class="btn-icon" style="width:30px;height:30px" onclick="Cart.remove('${l.id}', '${escJs(l.color)}'); renderMinicart();">${ICO.trash}</button>
          </div>
        </div>
      </div>`).join('');
  }
  if (sub) sub.textContent = formatBRL(Cart.subtotal());
}

function initCart(){
  const btn = document.getElementById('cartBtn');
  const overlay = document.getElementById('minicartOverlay');
  const panel = document.getElementById('minicart');
  const closeBtn = document.getElementById('closeMinicart');
  const open = ()=>{ overlay.classList.add('show'); panel.classList.add('show'); renderMinicart(); };
  const close = ()=>{ overlay.classList.remove('show'); panel.classList.remove('show'); };
  if (btn) btn.addEventListener('click', open);
  if (overlay) overlay.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('cart:update', renderMinicart);
  renderMinicart();
  window.openMinicart = open;
}

function showToast(title, msg){
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove('show'), 2800);
}

function addToCartWithFeedback(productId, qty=1, openCart=false, color=null){
  const p = getProduct(productId);
  // Se o produto tem cores cadastradas e a chamada não veio de um seletor de
  // cor (ex.: botão "Comprar" direto no card da listagem), usa a primeira
  // cor cadastrada como padrão em vez de deixar a linha do carrinho sem cor.
  const finalColor = color || (p && p.colors && p.colors[0] && p.colors[0].name) || null;
  Cart.add(productId, qty, finalColor);
  showToast('Adicionado ao carrinho', p ? p.name : 'Produto adicionado');
  if (openCart && window.openMinicart) window.openMinicart();
}

/* ---------------- Back to top ---------------- */
function initBackTop(){
  const btn = document.getElementById('backTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', ()=> btn.classList.toggle('show', window.scrollY > 500));
  btn.addEventListener('click', ()=> window.scrollTo({ top:0, behavior:'smooth' }));
}

/* ---------------- Reveal on scroll ---------------- */
function initReveal(){
  const els = document.querySelectorAll('.reveal');
  if (!els.length || !('IntersectionObserver' in window)) { els.forEach(e=>e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .12 });
  els.forEach(e=>io.observe(e));
}

/* ---------------- Hero Carousel ---------------- */
function renderHero(mountId){
  const mount = document.getElementById(mountId);
  if (!mount || typeof BANNERS === 'undefined') return;
  const grad = ['#1a1a1a,#3a2f00','#141414,#2b2b2b','#1a1a1a,#3a2f00','#151515,#262626'];
  mount.innerHTML = `
    <div class="hero">
      ${BANNERS.map((b,i)=>`
        <div class="hero-slide ${i===0?'active':''}" data-i="${i}">
          <div class="bg" style="${b.img ? `background-image:url('${b.img}')` : `background:linear-gradient(120deg,${grad[i%grad.length]})`}"></div>
          <div class="overlay"></div>
          <div class="hero-content">
            <span class="tag">${b.tag}</span>
            <h1>${b.title}</h1>
            <p>${b.text}</p>
            <div class="hero-actions">
              <a href="${b.link}" class="btn btn-gold">${b.cta}</a>
              <a href="produtos.html" class="btn btn-outline-white">Ver Catálogo</a>
            </div>
          </div>
        </div>`).join('')}
      <button class="hero-arrow prev">${ICO.chevL}</button>
      <button class="hero-arrow next">${ICO.chevR}</button>
      <div class="hero-dots">${BANNERS.map((_,i)=>`<button class="${i===0?'active':''}" data-i="${i}"></button>`).join('')}</div>
    </div>`;

  let idx = 0; const slides = mount.querySelectorAll('.hero-slide'); const dots = mount.querySelectorAll('.hero-dots button');
  function go(n){
    idx = (n + slides.length) % slides.length;
    slides.forEach((s,i)=>s.classList.toggle('active', i===idx));
    dots.forEach((d,i)=>d.classList.toggle('active', i===idx));
  }
  mount.querySelector('.prev').addEventListener('click', ()=>go(idx-1));
  mount.querySelector('.next').addEventListener('click', ()=>go(idx+1));
  dots.forEach(d=>d.addEventListener('click', ()=>go(+d.dataset.i)));
  let timer = setInterval(()=>go(idx+1), 5500);
  mount.addEventListener('mouseenter', ()=>clearInterval(timer));
  mount.addEventListener('mouseleave', ()=>timer=setInterval(()=>go(idx+1), 5500));
}

/* ---------------- Carousel row (scroll buttons) ---------------- */
function initCarouselNav(rowId, prevId, nextId){
  const row = document.getElementById(rowId);
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  if (!row) return;
  const scrollAmt = 300;
  if (prev) prev.addEventListener('click', ()=>row.scrollBy({ left:-scrollAmt, behavior:'smooth' }));
  if (next) next.addEventListener('click', ()=>row.scrollBy({ left:scrollAmt, behavior:'smooth' }));
}

/* ---------------- Product card renderer ---------------- */
function tagBadge(tag){
  const map = { novo:['Novo','tag-new'], promocao:['Promoção','tag-promo'], 'mais-vendido':['Mais Vendido','tag-best'] };
  const [label, cls] = map[tag] || [tag, 'tag-new'];
  return `<span class="tag ${cls}">${label}</span>`;
}
function productCardHTML(p){
  const isFav = typeof Favorites !== 'undefined' && Favorites.has(p.id);
  return `
  <div class="prod-card">
    <div class="prod-media">
      <a href="produto.html?slug=${p.slug}" class="icon-wrap" style="color:#121212">${iconFor(p.cat)}</a>
      <div class="prod-tags">${(p.tags||[]).map(tagBadge).join('')}</div>
      <button class="prod-fav ${isFav?'active':''}" onclick="toggleFav(this,'${p.id}')" aria-label="Favoritar">${ICO.heart}</button>
      <div class="prod-quick">
        <a href="produto.html?slug=${p.slug}" class="btn btn-black btn-sm" style="flex:1">Ver Produto</a>
        <button class="btn btn-gold btn-sm" style="flex:1" onclick="addToCartWithFeedback('${p.id}',1,true)">Comprar</button>
      </div>
    </div>
    <div class="prod-body">
      <span class="prod-cat">${(CATEGORIES.find(c=>c.slug===p.cat)||{}).name || p.cat}</span>
      <a href="produto.html?slug=${p.slug}" class="prod-name">${p.name}</a>
      <div class="prod-rating"><span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))}</span>(${p.reviews})</div>
      <div class="prod-price-row">
        ${p.promo ? `<span class="prod-old">${formatBRL(p.price)}</span><span class="prod-new">${formatBRL(p.promo)}</span>` : `<span class="prod-new">${formatBRL(p.price)}</span>`}
      </div>
      <span class="prod-installment">${installmentText(p.promo||p.price)}</span>
      <div class="prod-actions">
        <a href="produto.html?slug=${p.slug}" class="btn btn-outline">Ver Produto</a>
        <button class="btn btn-gold" onclick="addToCartWithFeedback('${p.id}',1,true)">Comprar</button>
      </div>
    </div>
  </div>`;
}
function toggleFav(btn, id){
  const active = Favorites.toggle(id);
  btn.classList.toggle('active', active);
  showToast(active ? 'Adicionado aos favoritos' : 'Removido dos favoritos', getProduct(id).name);
}

/* ---------------- CEP / Frete (Correios reais via ViaCEP + Melhor Envio) ---------------- */
// Busca o endereço a partir do CEP usando a ViaCEP — API pública e
// gratuita dos Correios, sem necessidade de conta nem chave de API.
async function consultarCEP(cep){
  cep = cep.replace(/\D/g,'');
  if (cep.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return { cep, logradouro: data.logradouro || '', bairro: data.bairro || '', localidade: data.localidade || '', uf: data.uf || '' };
  } catch (e) {
    return null;
  }
}
// Calcula o frete real (PAC/SEDEX e outras transportadoras) chamando o
// servidor, que consulta a API do Melhor Envio com o peso/dimensões reais
// dos produtos do carrinho. items: [{ id, qty }, ...].
async function calcularFrete(cep, items){
  try {
    const res = await fetch('/api/calcular-frete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cep, items }),
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.options) || !data.options.length) {
      throw new Error((data && data.error) || 'Sem opções de frete para este CEP.');
    }
    return data.options;
  } catch (e) {
    console.log('Falha ao calcular frete real:', e);
    return [];
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.addEventListener('fav:update', ()=>{});
});
