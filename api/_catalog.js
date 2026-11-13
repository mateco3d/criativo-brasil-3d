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
   { id: 'p1787945732698', name: 'Portão Cartão (Pode Personalizar)', cat: 'escritorio', price: 14.99, promo: null, weight_kg: 0.3, length_cm: 10, width_cm: 2.2, height_cm: 3.1 },
   { id: 'p1787943475591', name: 'Cruz Vazada', cat: 'artigo-religioso', price: 18.99, promo: null, weight_kg: 0.4, length_cm: 17, width_cm: 12.5, height_cm: 4 },
   { id: 'p1787343733424', name: 'Letreiro Cristo Vive', cat: 'artigo-religioso', price: 22, promo: null, weight_kg: 0.86, length_cm: 16, width_cm: 11, height_cm: 6 },
   { id: 'p1787287049399', name: 'Suporte para 2 Controles PS5/PS4 Branco e Preto', cat: 'games', price: 20.99, promo: null, weight_kg: 0.86, length_cm: 16, width_cm: 11, height_cm: 6 },
  { id: 'p1794588365030', name: 'Porta Talher - Bota Papai Noel', cat: 'colecao-natal-2026', price: 64.99, promo: null, weight_kg: 0.15, length_cm: 12, width_cm: 10, height_cm: 9 },
   ];

function getProduct(id) {
   return PRODUCTS.find((p) => p.id === id) || null;
}

function unitPrice(product) {
   return product.promo != null ? product.promo : product.price;
}

function round2(n) {
   return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = { PRODUCTS, getProduct, unitPrice, round2 };
