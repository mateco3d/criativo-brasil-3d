/* ===================================================================
   CRIATIVO BRASIL 3D — Admin Panel JS (layout + mock CRUD via localStorage)
=================================================================== */

const AICO = {
  dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="12" width="8" height="9" rx="1.5"/><rect x="3" y="14" width="8" height="7" rx="1.5"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.6 12.6L12 21.2 2.8 12 11.4 3.4H20.6z"/><circle cx="16.5" cy="7.5" r="1.3"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  coupon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2z"/><path d="M9 6v12" stroke-dasharray="2 2"/></svg>',
  banner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l5-5 4 4 5-6 4 5"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="18" cy="9" r="2.6"/><path d="M17 14c2.8.3 5 2 5 5.5"/></svg>',
  money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1 3 2.2-1 1.8-3 2.3-3 1.1-3 2.3 1.3 2.2 3 2.2 3-1.1 3-2.5"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 6h6v6"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="1.5"/><path d="M6 17h12v5H6z"/></svg>',
};

const NAV_ITEMS = [
  { group: 'Visão Geral', items: [
    { href:'index.html', label:'Dashboard', ic:'dash' },
  ]},
  { group: 'Catálogo', items: [
    { href:'produtos.html', label:'Produtos', ic:'box' },
    { href:'categorias.html', label:'Categorias', ic:'tag' },
    { href:'banners.html', label:'Banners', ic:'banner' },
  ]},
  { group: 'Vendas', items: [
    { href:'pedidos.html', label:'Pedidos', ic:'cart' },
    { href:'cupons.html', label:'Cupons e Promoções', ic:'coupon' },
    { href:'clientes.html', label:'Clientes', ic:'users' },
  ]},
];

function adminLayout(active, title, subtitle){
  document.body.classList.add('admin-body');
  const nav = NAV_ITEMS.map(g => `
    <div class="nav-label">${g.group}</div>
    ${g.items.map(i => `<a href="${i.href}" class="${active===i.href?'active':''}">${AICO[i.ic]}<span>${i.label}</span></a>`).join('')}
  `).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="admin-shell">
      <aside class="admin-sidebar" id="adminSidebar">
        <div class="admin-logo"><span class="mark">CB</span> Criativo Brasil 3D<br><small style="font-weight:400;color:#888;font-size:10px">Painel Admin</small></div>
        <nav class="admin-nav">${nav}</nav>
        <a href="../index.html" class="admin-back">← Voltar para a loja</a>
      </aside>
      <main class="admin-main">
        <div class="admin-topbar">
          <div style="display:flex;align-items:center;gap:14px">
            <button class="btn-icon admin-burger" id="adminBurger">${AICO.menu}</button>
            <div><h1>${title}</h1><p>${subtitle||''}</p></div>
          </div>
          <div class="admin-profile"><div class="av">AD</div><div><div style="font-size:12.5px;font-weight:700">Administrador</div><div style="font-size:11px;color:#999">criativo3dbrasil@gmail.com</div></div></div>
        </div>
        <div id="adminContent"></div>
      </main>
    </div>`);

  const burger = document.getElementById('adminBurger');
  if (burger) burger.addEventListener('click', ()=> document.getElementById('adminSidebar').classList.toggle('open'));
}

function barChart(data, opts={}){
  const max = Math.max(...data.map(d=>d.value)) || 1;
  return `<div class="bar-chart">
    ${data.map(d => `
      <div class="bar-col">
        <span class="bar-val">${opts.fmt ? opts.fmt(d.value) : d.value}</span>
        <div class="bar" style="height:${Math.max(6,(d.value/max)*150)}px"></div>
        <span class="bar-label">${d.label}</span>
      </div>`).join('')}
  </div>`;
}

/* ---------------- Admin Store (mock CRUD via localStorage) ----------------
   Em produção: substituído por chamadas a /api/admin/* (Next.js API Routes
   + Prisma). Ver prisma/schema.prisma e docs/ARQUITETURA.md */
const AdminStore = {
  seed(){
    if (!localStorage.getItem('cb3d_admin_products')) {
      localStorage.setItem('cb3d_admin_products', JSON.stringify(PRODUCTS));
    }
    if (!localStorage.getItem('cb3d_admin_categories')) {
      localStorage.setItem('cb3d_admin_categories', JSON.stringify(CATEGORIES));
    }
    if (!localStorage.getItem('cb3d_admin_coupons')) {
      localStorage.setItem('cb3d_admin_coupons', JSON.stringify([
        { code:'BEMVINDO10', type:'percent', value:10, active:true, uses:214, limit:1000, expires:'2026-12-31' },
        { code:'CB3D15', type:'percent', value:15, active:true, uses:87, limit:200, expires:'2026-09-30' },
        { code:'FRETEGRATIS', type:'shipping', value:100, active:false, uses:412, limit:500, expires:'2026-06-30' },
      ]));
    }
    if (!localStorage.getItem('cb3d_admin_banners')) {
      localStorage.setItem('cb3d_admin_banners', JSON.stringify(BANNERS.map((b,i)=>({...b, id:'b'+i, active:true}))));
    }
    // A lista de clientes ainda não é preenchida automaticamente a partir
    // de compras reais (exigiria um banco de dados — ver docs/ARQUITETURA.md).
    // Por isso começa vazia, em vez de mostrar clientes fictícios de demonstração.
    if (!localStorage.getItem('cb3d_admin_customers')) {
      localStorage.setItem('cb3d_admin_customers', JSON.stringify([]));
    }
  },
  get(key){ this.seed(); try { return JSON.parse(localStorage.getItem('cb3d_admin_'+key)) || []; } catch(e){ return []; } },
  set(key, val){ localStorage.setItem('cb3d_admin_'+key, JSON.stringify(val)); },
  upsertProduct(p){
    const list = this.get('products');
    const i = list.findIndex(x=>x.id===p.id);
    if (i>-1) list[i] = p; else list.unshift(p);
    this.set('products', list);
  },
  deleteProduct(id){ this.set('products', this.get('products').filter(p=>p.id!==id)); },
};

function donutChart(data){
  const total = data.reduce((a,d)=>a+d.value,0);
  let acc = 0;
  const stops = data.map(d => {
    const start = (acc/total)*360; acc += d.value; const end = (acc/total)*360;
    return `${d.color} ${start}deg ${end}deg`;
  }).join(', ');
  return `
    <div class="donut-wrap">
      <div style="width:130px;height:130px;border-radius:50%;background:conic-gradient(${stops});flex-shrink:0;display:flex;align-items:center;justify-content:center">
        <div style="width:76px;height:76px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#666">100%</div>
      </div>
      <div class="donut-legend">
        ${data.map(d => `<div class="leg-item"><span><span class="dot" style="background:${d.color}"></span>${d.label}</span><strong>${Math.round((d.value/total)*100)}%</strong></div>`).join('')}
      </div>
    </div>`;
}
