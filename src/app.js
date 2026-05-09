import { renderNavbar } from "./components/navbar.js";
import { renderFooter } from "./components/footer.js";
import { renderHome } from "./pages/home.js";
import { renderCatalog } from "./pages/catalog.js";
import { renderProduct } from "./pages/product.js";
import { renderNotFound } from "./pages/notFound.js";
import { navigate, setRouteCallback, initNavigation, getCurrentPath, resetNavigationFlag } from "./utils/navigation.js";
import { init3DViewer, close3DViewer } from "./3d/viewer.js";

let lastPath = "";

function route(isPopState = false) {
  const path = getCurrentPath();
  const isBack = isPopState && lastPath && lastPath.startsWith("/product/") && (path === "/" || path === "");
  lastPath = path;
  
  resetNavigationFlag();
  
  if (path === "/" || path === "") {
    renderHome();
    if (isBack) {
      setTimeout(() => {
        const carousel = document.querySelector(".carousel-section");
        if (carousel) {
          carousel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  } else if (path === "/catalog") {
    renderCatalog();
    window.scrollTo(0, 0);
  } else if (path.startsWith("/product/")) {
    const productId = path.split("/product/")[1];
    const found = renderProduct(productId);
    if (!found) renderNotFound();
    window.scrollTo(0, 0);
  } else {
    renderNotFound();
    window.scrollTo(0, 0);
  }
}

window.navigate = navigate;
window.init3D = init3DViewer;
window.closeViewer = close3DViewer;

setRouteCallback(route);
initNavigation();

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderFooter();
  route();
  
  console.log("LUXURA ready!");
});