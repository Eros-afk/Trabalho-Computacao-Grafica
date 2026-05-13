export const $ = s => document.querySelector(s);
export const $$ = s => document.querySelectorAll(s);

export function fmt(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0
  }).format(price);
}

export function getElement(id) {
  return $(`#${id}`);
}

export function setHTML(selector, html) {
  $(selector).innerHTML = html;
}