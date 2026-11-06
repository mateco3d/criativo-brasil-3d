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
   // ---------------------------------------------------------------
   // Catálogo zerado a pedido do usuário em 30/10 — tanto os produtos
   // reais cadastrados até então (Portão Cartão, Cruz Vazada, Letreiro
   // Cristo Vive, Suporte PS5/PS4) quanto o catálogo de demonstração
   // antigo (p01-p24) foram removidos daqui para começar o cadastro de
   // produtos reais do zero (ver claude/site-progresso.md). Sempre que
   // um produto novo for cadastrado no painel admin, ele precisa ser
   // adicionado aqui também (catálogo "oficial" para cobrança/frete —
   // ver comentário no topo do arquivo), senão o cliente verá "Produto
   // inválido" ao tentar pagar.
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
