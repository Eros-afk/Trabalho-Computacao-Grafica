import { products } from "../data/products.js";
import { setHTML, $$, $ } from "../utils/dom.js";
import { navigate } from "../utils/navigation.js";
import { renderProductCard } from "../components/card.js";

function createCarouselCards(allProducts) {
  return allProducts.map((p, i) => {
    const card = renderProductCard(p, navigate);
    return card.replace("product-card", `product-card animate-in" style="animation-delay: ${i * 0.1}s`);
  }).join("");
}

export function renderHome() {
  const hero = products[0];
  
  const carouselProducts = [...products, ...products, ...products, ...products].slice(0, 10);
  
  setHTML("#main", `
    <section class="hero">
      <div class="hero-content container">
        <span class="hero-overline">Nova Coleção</span>
        <h1 class="hero-title">Modern Organic Living</h1>
        <p class="hero-subtitle">Móveis sustentáveis que equilibram luxo silencioso com design intencional.</p>
        <div class="hero-actions">
          <a href="#/catalog" class="btn btn-primary" onclick="event.preventDefault(); navigate('/catalog')">Explorar Catálogo</a>
          <a href="#/product/${hero.id}" class="btn btn-secondary" onclick="event.preventDefault(); navigate('/product/${hero.id}')">Ver Detalhes</a>
        </div>
      </div>
      <div class="hero-image"><img src="${hero.thumbnail}" alt=""></div>
    </section>
    <section class="section carousel-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Destaques</h2>
          <a href="#/catalog" class="section-link" onclick="event.preventDefault(); navigate('/catalog')">Ver todos →</a>
        </div>
        <div class="carousel-wrapper">
          <button class="carousel-btn carousel-btn-left" aria-label="Anterior">‹</button>
          <div class="carousel-container">
            <div class="carousel-track">${createCarouselCards(carouselProducts)}</div>
          </div>
          <button class="carousel-btn carousel-btn-right" aria-label="Próximo">›</button>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container about-grid">
        <div>
          <span class="about-overline">Sustentabilidade</span>
          <h2 class="about-title">Design Consciente</h2>
          <p class="about-text">Cada peça construída com materiais sustentáveis.</p>
        </div>
        <div class="about-image"><img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop" alt=""></div>
      </div>
    </section>
    <section class="cta">
      <div class="container">
        <h2 class="cta-title">Complete o Ambiente</h2>
        <p class="cta-text">Descubra nossa coleção completa.</p>
        <a href="#/catalog" class="btn btn-primary" style="background:white;color:var(--primary)" onclick="event.preventDefault(); navigate('/catalog')">Ver Catálogo</a>
      </div>
    </section>
  `);
  
  initCarousel();
}

function initCarousel() {
  const container = $(".carousel-container");
  const btnLeft = $(".carousel-btn-left");
  const btnRight = $(".carousel-btn-right");
  
  if (!container || !btnLeft || !btnRight) return;
  
  const cardWidth = 280 + 24;
  const scrollAmount = cardWidth * 2;
  
  btnLeft.addEventListener("click", () => {
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
  
  btnRight.addEventListener("click", () => {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });
  
  container.addEventListener("scroll", () => {
    const isAtStart = container.scrollLeft <= 0;
    const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 10;
    
    btnLeft.style.opacity = isAtStart ? "0.3" : "1";
    btnLeft.style.pointerEvents = isAtStart ? "none" : "auto";
    
    btnRight.style.opacity = isAtEnd ? "0.3" : "1";
    btnRight.style.pointerEvents = isAtEnd ? "none" : "auto";
  });
}