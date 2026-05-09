import { products, getProductsByCategory } from "../data/products.js";
import { setHTML } from "../utils/dom.js";
import { navigate } from "../utils/navigation.js";
import { renderProductCard } from "../components/card.js";

export function renderCatalog() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const category = params.get("cat");
  const list = category ? getProductsByCategory(category) : products;
  
  setHTML("#main", `
    <div class="catalog container">
      <div class="catalog-header">
        <h1 class="catalog-title">Catálogo</h1>
        <p class="catalog-count">${list.length} produto${list.length !== 1 ? "s" : ""}</p>
      </div>
      <div class="catalog-filters">
        <button class="filter-btn ${!category ? "active" : ""}" data-filter="">Todos</button>
        <button class="filter-btn ${category === "living" ? "active" : ""}" data-filter="living">Sala</button>
      </div>
      <div class="products-grid">${list.map(p => renderProductCard(p, navigate)).join("")}</div>
    </div>
  `);
  
  attachCatalogEvents();
}

function attachCatalogEvents() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      navigate(filter ? `/catalog?cat=${filter}` : "/catalog");
    });
  });
}