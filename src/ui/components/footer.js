import { setHTML } from "../../utils/dom.js";
import { navigate } from "../../utils/navigation.js";

export function renderFooter() {
  setHTML("#footer", `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">VideoBoard Móveis</div>
            <p class="footer-tagline">Luxo silencioso para o lar moderno.</p>
          </div>
          <div class="footer-col">
            <h3>Navegar</h3>
            <ul>
              <li><a href="#/" onclick="event.preventDefault(); navigate('/')">Home</a></li>
              <li><a href="#/catalog" onclick="event.preventDefault(); navigate('/catalog')">Catálogo</a></li>
            </ul>
          </div>
          <div class="footer-newsletter">
            <h3>Newsletter</h3>
            <p>Receba novidades.</p>
            <form class="newsletter-form" onsubmit="event.preventDefault(); alert('Obrigado!');">
              <input type="email" placeholder="Seu email" required>
              <button type="submit" class="btn btn-primary">OK</button>
            </form>
          </div>
        </div>
        <div class="footer-bottom">© 2024 VideoBoard Móveis.</div>
      </div>
    </footer>
  `);
}
