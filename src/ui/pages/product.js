import { getProductById } from "../../data/products.js";
import { setHTML, fmt } from "../../utils/dom.js";
import { navigate } from "../../utils/navigation.js";

export function renderProduct(productId) {
  const product = getProductById(productId);
  if (!product) return false;
  
  setHTML("#main", `
    <div class="product-detail container">
      <nav class="breadcrumb">
        <a href="/" onclick="event.preventDefault(); navigate('/')">Home</a> / 
        <a href="/catalog" onclick="event.preventDefault(); navigate('/catalog')">Catálogo</a> / 
        <span>${product.name}</span>
      </nav>
      <div class="product-hero">
        <div class="product-gallery">
          <div class="product-main-img">
            <img src="${product.images[0]}" alt="${product.name}">
          </div>
          <div class="product-thumbs">${product.images.map((img, i) => `
            <div class="product-thumb ${i === 0 ? "active" : ""}" data-img="${img}">
              <img src="${img}" alt="">
            </div>
          `).join("")}</div>
        </div>
        <div class="product-info">
          <h1 class="product-title">${product.name}</h1>
          <p class="product-price">${fmt(product.price)}</p>
          <div class="product-divider"></div>
          <p class="product-desc">${product.description}</p>
          <div class="materials-title">Material / Cor</div>
          <div class="materials-options">${product.materials.map((m, i) => `
            <button class="material-btn ${i === 0 ? "active" : ""}" data-color="${m.color}">
              <span class="material-swatch" style="background:${m.color}"></span>
              ${m.name}
            </button>
          `).join("")}</div>
          <div class="product-actions">
            <button class="btn btn-primary" onclick="alert('Adicionado ao carrinho!')">Adicionar ao Carrinho</button>
            <button class="btn btn-secondary">Wishlist</button>
          </div>
          <button class="btn btn-3d-viewer" onclick="init3D('${product.modelPath}')">Ver em 3D</button>
          <div class="accordion">
            <details open>
              <summary class="accordion-header">Dimensões <span class="accordion-icon">▼</span></summary>
              <div class="accordion-content">
                <div class="dimensions-list">${Object.entries(product.dimensions).map(([k, v]) => `
                  <div>${k.replace("_", " ")}: ${v}</div>
                `).join("")}</div>
              </div>
            </details>
            <details>
              <summary class="accordion-header">Cuidados <span class="accordion-icon">▼</span></summary>
              <div class="accordion-content">${product.care}</div>
            </details>
            <details>
              <summary class="accordion-header">Envio <span class="accordion-icon">▼</span></summary>
              <div class="accordion-content">${product.shipping}</div>
            </details>
          </div>
        </div>
      </div>
    </div>
  `);
  
  attachProductEvents();
  return true;
}

function attachProductEvents() {
  const thumbs = document.querySelectorAll(".product-thumb");
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      const src = thumb.dataset.img;
      document.querySelector(".product-main-img img").src = src;
      thumbs.forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });
  
  const materials = document.querySelectorAll(".material-btn");
  materials.forEach(mat => {
    mat.addEventListener("click", () => {
      materials.forEach(m => m.classList.remove("active"));
      mat.classList.add("active");
    });
  });
}
