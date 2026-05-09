export function attachUIClickEvents() {
  const cards = document.querySelectorAll(".product-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.productId;
      if (id) {
        window.navigate(`/product/${id}`);
      }
    });
  });
}