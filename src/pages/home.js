import { products } from "../data/products.js";
import { setHTML } from "../utils/dom.js";
import { navigate } from "../utils/navigation.js";
import { renderProductCard } from "../components/card.js";

export function renderHome() {
  const hero = products[0];
  
  setHTML("#main", `
    <section class="hero">
      <div class="hero-content container">
        <span class="hero-overline">Nova Coleção</span>
        <h1 class="hero-title">Modern Organic Living</h1>
        <p class="hero-subtitle">Móveis sustentáveis que equilibram luxo silencioso com design intencional.</p>
        <div class="hero-actions">
          <a href="/catalog" class="btn btn-primary" onclick="event.preventDefault(); navigate('/catalog')">Explorar Catálogo</a>
          <a href="/product/${hero.id}" class="btn btn-secondary" onclick="event.preventDefault(); navigate('/product/${hero.id}')">Ver Detalhes</a>
        </div>
      </div>
      <div class="hero-image"><img src="${hero.thumbnail}" alt=""></div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Destaques</h2>
          <a href="/catalog" class="section-link" onclick="event.preventDefault(); navigate('/catalog')">Ver todos →</a>
        </div>
        <div class="products-grid">${products.map(renderProductCard).join("")}</div>
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
        <a href="/catalog" class="btn btn-primary" style="background:white;color:var(--primary)" onclick="event.preventDefault(); navigate('/catalog')">Ver Catálogo</a>
      </div>
    </section>
  `);
}