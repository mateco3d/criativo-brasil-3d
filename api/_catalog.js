/* ===================================================================
   CRIATIVO BRASIL 3D — Catálogo espelhado no servidor (Vercel Function)
   -------------------------------------------------------------------
   Este arquivo existe para que o valor cobrado no Mercado Pago NUNCA
   dependa do que o navegador do cliente envia (preço, frete ou cupom
   poderiam ser adulterados no front-end). Os preços e regras aqui
   precisam ser os MESMOS de assets/js/data.js, carrinho.html e
   assets/js/main.js (calcularFrete).

   IMPORTANTE: como o catálogo "oficial" hoje é só este arquivo (não há
   banco de dados ainda), qualquer produto novo cadastrado no painel
   admin (que só grava no localStorage do navegador) não vai poder ser
   cobrado de verdade até ser adicionado aqui também. Ver docs/ARQUITETURA.md.
=================================================================== */

const PRODUCTS = [
  { id: 'p01', name: 'Suporte de Headset Dragão', price: 89.9, promo: 69.9 },
  { id: 'p02', name: 'Luminária Sabre de Luz', price: 129.9, promo: null },
  { id: 'p03', name: 'Action Figure Articulado Robô', price: 159.9, promo: 139.9 },
  { id: 'p04', name: 'Funko Personalizado com Seu Rosto', price: 149.9, promo: 119.9 },
  { id: 'p05', name: 'Funko Casal Noivos Personalizado', price: 249.9, promo: null },
  { id: 'p06', name: 'Funko Pet Personalizado', price: 119.9, promo: 99.9 },
  { id: 'p07', name: 'Organizador de Mesa Modular', price: 79.9, promo: null },
  { id: 'p08', name: 'Porta Controle de Parede', price: 49.9, promo: 39.9 },
  { id: 'p09', name: 'Organizador de Cabos USB', price: 34.9, promo: null },
  { id: 'p10', name: 'Vaso Geométrico Decorativo', price: 69.9, promo: null },
  { id: 'p11', name: 'Porta Retrato Articulado 3 Fotos', price: 59.9, promo: 44.9 },
  { id: 'p12', name: 'Luminária Lua 3D', price: 99.9, promo: null },
  { id: 'p13', name: 'Suporte de Notebook Ergonômico', price: 119.9, promo: 99.9 },
  { id: 'p14', name: 'Porta Canetas Hexagonal', price: 29.9, promo: null },
  { id: 'p15', name: 'Suporte de Monitor com Gavetas', price: 189.9, promo: null },
  { id: 'p16', name: 'Piteira de Narguile Personalizada', price: 44.9, promo: null },
  { id: 'p17', name: 'Base de Narguile com Efeito LED', price: 139.9, promo: 119.9 },
  { id: 'p18', name: 'Suporte para Mangueira de Narguile', price: 39.9, promo: null },
  { id: 'p19', name: 'Suporte de Celular Veicular', price: 54.9, promo: 44.9 },
  { id: 'p20', name: 'Emblema Personalizado para Carro', price: 64.9, promo: null },
  { id: 'p21', name: 'Organizador de Porta-Malas Modular', price: 149.9, promo: 129.9 },
  { id: 'p22', name: 'Nome de Mesa Personalizado 3D', price: 74.9, promo: null },
  { id: 'p23', name: 'Topo de Bolo Personalizado', price: 59.9, promo: 49.9 },
  { id: 'p24', name: 'Chaveiro Personalizado com Logo', price: 24.9, promo: null },
];

// Precisa ser igual ao objeto COUPONS em carrinho.html
const COUPONS = { BEMVINDO10: 0.1, CB3D15: 0.15 };

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

function unitPrice(product) {
  return product.promo != null ? product.promo : product.price;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Espelha calcularFrete() de assets/js/main.js (mesma fórmula determinística)
function calcShipping(cep, subtotal, code) {
  const cepNum = parseInt(String(cep).replace(/\D/g, '').slice(0, 3), 10) || 100;
  const distFactor = 1 + (cepNum % 9) / 10;
  const pac = Math.max(14.9, round2(18 * distFactor));
  const sedex = Math.max(24.9, round2(pac * 1.7));
  const free = subtotal >= 250;
  const options = {
    PAC: { label: 'PAC (Correios)', price: free ? 0 : pac, days: 6 + (cepNum % 5) },
    SEDEX: { label: 'SEDEX (Correios)', price: sedex, days: 2 + (cepNum % 3) },
    TRANSP: { label: 'Transportadora Expressa', price: free ? 0 : round2(pac * 0.85), days: 5 + (cepNum % 4) },
  };
  return options[code] || options.PAC;
}

module.exports = { PRODUCTS, COUPONS, getProduct, unitPrice, calcShipping, round2 };
