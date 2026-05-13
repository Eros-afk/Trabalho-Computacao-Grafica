import { setHTML } from "../../utils/dom.js";
import { navigate } from "../../utils/navigation.js";

export function renderNotFound() {
  setHTML("#main", `
    <div class="not-found">
      <h1>404</h1>
      <h2>Página Não Encontrada</h2>
      <p>A página não existe.</p>
      <div class="not-found-actions">
        <a href="/" class="btn btn-primary" onclick="event.preventDefault(); navigate('/')">Voltar</a>
        <a href="/catalog" class="btn btn-secondary" onclick="event.preventDefault(); navigate('/catalog')">Catálogo</a>
      </div>
    </div>
  `);
}
