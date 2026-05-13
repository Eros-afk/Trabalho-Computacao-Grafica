import { setHTML } from "../../utils/dom.js";
import { navigate, getCurrentPath } from "../../utils/navigation.js";

export function renderNavbar() {
  const path = getCurrentPath();
  
  setHTML("#navbar", `
    <nav class="navbar">
      <div class="container navbar-inner">
        <a href="#" class="brand" onclick="event.preventDefault(); navigate('/')">VideoBoard Móveis</a>
        <ul class="nav-links">
          <li><a href="#" class="${path === "/" || path === "" ? "active" : ""}" onclick="event.preventDefault(); navigate('/')">Home</a></li>
          <li><a href="#/catalog" class="${path.startsWith("/catalog") ? "active" : ""}" onclick="event.preventDefault(); navigate('/catalog')">Catálogo</a></li>
        </ul>
        <div class="nav-actions">
          <button class="icon-btn" aria-label="Buscar">🔍</button>
          <button class="icon-btn" aria-label="Carrinho">🛒</button>
        </div>
      </div>
    </nav>
  `);
}
