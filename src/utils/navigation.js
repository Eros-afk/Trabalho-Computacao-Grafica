import { $ } from "./dom.js";

let routeCallback = null;
let isProgrammaticNav = false;

export function navigate(path) {
  isProgrammaticNav = true;
  window.location.hash = path;
  if (routeCallback) routeCallback();
  window.scrollTo(0, 0);
}

export function isPopStateNavigation() {
  return !isProgrammaticNav;
}

export function resetNavigationFlag() {
  isProgrammaticNav = false;
}

export function setRouteCallback(callback) {
  routeCallback = callback;
}

function getPath() {
  const hash = window.location.hash;
  if (!hash || hash === "#") return "/";
  return hash.substring(1);
}

export function initNavigation() {
  window.addEventListener("hashchange", () => {
    setTimeout(() => {
      if (routeCallback) routeCallback(isPopStateNavigation());
    }, 0);
  });
  
  if (routeCallback) {
    const path = getPath();
    window.location.hash = path === "/" ? "" : path;
    routeCallback(false);
  }
}

export function getCurrentPath() {
  return getPath();
}