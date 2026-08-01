/* ===================================================================
   CRIATIVO BRASIL 3D — Catálogo espelhado no servidor (Vercel Function)
   -------------------------------------------------------------------
   Este arquivo existe para que o valor cobrado no Mercado Pago NUNCA
   dependa do que o navegador do cliente envia (preço, frete ou cupom
   poderiam ser adulterados no front-end). Os preços e regras aqui
   precisam ser os MESMOS de assets/js/data.js, carrinho.html e
   assets/js/main.js (calcularFrete).

   IMPORTANTE: como o catálogo "oficial" hoje é só este arquivo (não há
   banco de dados de produtos ainda), qualquer produto novo cadastrado no
   painel admin (que só grava no localStorage do navegador) não vai poder
   ser cobrado nem ter frete calculado de verdade até ser adicionado aqui
   também. Ver docs/ARQUITETURA.md.

   weight_kg / length_cm / width_cm / height_cm: peso e dimensões da
   embalagem de UMA unidade do produto, usados para calcular o frete real
   via Melhor Envio (ver api/_shipping.js). Espelham os campos peso/dim de
   assets/js/data.js. Produtos com tamanho variável (ex: personalizados)
   usam uma caixa padrão razoável.
=================================================================== */

const PRODUCTS = [
  { id: 'p01', name: 'Suporte de Headset Dragão', price: 89.9, promo: 69.9, weight_kg: 0.32, length_cm: 18, width_cm: 12, height_cm: 22 },
  { id: 'p02', name: 'Luminária Sabre de Luz', price: 129.9, promo: null, weight_kg: 0.21, length_cm: 6, width_cm: 6, height_cm: 38 },
  { id: 'p03', name: 'Action Figure Articulado Robô', price: 159.9, promo: 139.9, weight_kg: 0.18, length_cm: 8, width_cm: 6, height_cm: 16 },
  { id: 'p04', name: 'Funko Personalizado com Seu Rosto', price: 149.9, promo: 119.9, weight_kg: 0.14, length_cm: 7, width_cm: 7, height_cm: 12 },
  { id: 'p05', name: 'Funko Casal Noivos Personalizado', price: 249.9, promo: null, weight_kg: 0.26, length_cm: 14, width_cm: 8, height_cm: 12 },
  { id: 'p06', name: 'Funko Pet Personalizado', price: 119.9, promo: 99.9, weight_kg: 0.11, length_cm: 6, width_cm: 6, height_cm: 10 },
  { id: 'p07', name: 'Organizador de Mesa Modular', price: 79.9, promo: null, weight_kg: 0.26, length_cm: 20, width_cm: 10, height_cm: 8 },
  { id: 'p08', name: 'Porta Controle de Parede', price: 49.9, promo: 39.9, weight_kg: 0.09, length_cm: 22, width_cm: 8, height_cm: 6 },
  { id: 'p09', name: 'Organizador de Cabos USB', price: 34.9, promo: null, weight_kg: 0.04, length_cm: 8, width_cm: 4, height_cm: 3 },
  { id: 'p10', name: 'Vaso Geométrico Decorativo', price: 69.9, promo: null, weight_kg: 0.18, length_cm: 12, width_cm: 12, height_cm: 16 },
  { id: 'p11', name: 'Porta Retrato Articulado 3 Fotos', price: 59.9, promo: 44.9, weight_kg: 0.15, length_cm: 24, width_cm: 10, height_cm: 2 },
  { id: 'p12', name: 'Luminária Lua 3D', price: 99.9, promo: null, weight_kg: 0.24, length_cm: 15, width_cm: 15, height_cm: 15 },
  { id: 'p13', name: 'Suporte de Notebook Ergonômico', price: 119.9, promo: 99.9, weight_kg: 0.42, length_cm: 26, width_cm: 22, height_cm: 14 },
  { id: 'p14', name: 'Porta Canetas Hexagonal', price: 29.9, promo: null, weight_kg: 0.07, length_cm: 8, width_cm: 8, height_cm: 10 },
  { id: 'p15', name: 'Suporte de Monitor com Gavetas', price: 189.9, promo: null, weight_kg: 0.98, length_cm: 40, width_cm: 24, height_cm: 12 },
  { id: 'p16', name: 'Piteira de Narguile Personalizada', price: 44.9, promo: null, weight_kg: 0.03, length_cm: 3, width_cm: 3, height_cm: 8 },
  { id: 'p17', name: 'Base de Narguile com Efeito LED', price: 139.9, promo: 119.9, weight_kg: 0.38, length_cm: 18, width_cm: 18, height_cm: 10 },
  { id: 'p18', name: 'Suporte para Mangueira de Narguile', price: 39.9, promo: null, weight_kg: 0.055, length_cm: 10, width_cm: 6, height_cm: 8 },
  { id: 'p19', name: 'Suporte de Celular Veicular', price: 54.9, promo: 44.9, weight_kg: 0.11, length_cm: 9, width_cm: 6, height_cm: 14 },
  { id: 'p20', name: 'Emblema Personalizado para Carro', price: 64.9, promo: null, weight_kg: 0.045, length_cm: 8, width_cm: 8, height_cm: 1 },
  { id: 'p21', name: 'Organizador de Porta-Malas Modular', price: 149.9, promo: 129.9, weight_kg: 0.72, length_cm: 40, width_cm: 30, height_cm: 20 },
  { id: 'p22', name: 'Nome de Mesa Personalizado 3D', price: 74.9, promo: null, weight_kg: 0.16, length_cm: 20, width_cm: 15, height_cm: 2 },
  { id: 'p23', name: 'Topo de Bolo Personalizado', price: 59.9, promo: 49.9, weight_kg: 0.08, length_cm: 15, width_cm: 10, height_cm: 1 },
  { id: 'p24', name: 'Chaveiro Personalizado com Logo', price: 24.9, promo: null, weight_kg: 0.02, length_cm: 5, width_cm: 5, height_cm: 0.5 },
  { id: 'p1785468431596', name: 'produto teste', price: 5, promo: null, weight_kg: 0.3, length_cm: 16, width_cm: 11, height_cm: 5 },
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

module.exports = { PRODUCTS, COUPONS, getProduct, unitPrice, round2 };
