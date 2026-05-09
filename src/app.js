import { renderNavbar } from "./components/navbar.js";
import { renderFooter } from "./components/footer.js";
import { renderHome } from "./pages/home.js";
import { renderCatalog } from "./pages/catalog.js";
import { renderProduct } from "./pages/product.js";
import { renderNotFound } from "./pages/notFound.js";
import { navigate, setRouteCallback, initNavigation } from "./utils/navigation.js";
import { init3DViewer, close3DViewer } from "./3d/viewer.js";

function route() {
  const path = window.location.pathname;
  
  if (path === "/" || path === "") {
    renderHome();
  } else if (path === "/catalog") {
    renderCatalog();
  } else if (path.startsWith("/product/")) {
    const productId = path.split("/product/")[1];
    const found = renderProduct(productId);
    if (!found) renderNotFound();
  } else {
    renderNotFound();
  }
  
  window.scrollTo(0, 0);
}

window.navigate = navigate;
window.init3D = init3DViewer;
window.closeViewer = close3DViewer;

initNavigation();
setRouteCallback(route);

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderFooter();
  route();
  
  console.log("LUXURA ready!");
});