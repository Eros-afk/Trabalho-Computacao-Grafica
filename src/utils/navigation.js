import { $ } from "./dom.js";

let routeCallback = null;

export function navigate(path) {
  window.history.pushState({}, "", path);
  if (routeCallback) routeCallback();
  window.scrollTo(0, 0);
}

export function setRouteCallback(callback) {
  routeCallback = callback;
}

export function initNavigation() {
  window.addEventListener("popstate", () => {
    if (routeCallback) routeCallback();
    window.scrollTo(0, 0);
  });
}