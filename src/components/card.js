import { fmt } from "../utils/dom.js";

export function renderProductCard(product, navigateFn) {
  return `
    <article class="product-card" data-product-id="${product.id}" onclick="event.preventDefault(); navigate('/product/${product.id}')">
      <div class="product-image">
        <img src="${product.thumbnail}" alt="${product.name}">
        <span class="product-badge">Em Estoque</span>
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${fmt(product.price)}</p>
      </div>
    </article>
  `;
}