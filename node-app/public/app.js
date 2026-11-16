// Shared frontend helpers: product API, cart in localStorage, image fallback.
// The cart is browser-only (localStorage) because Vercel serverless functions
// are stateless — there is no server session to keep it in.
const API = "/api";
const PLACEHOLDER = "/assets/placeholder.svg";

function money(n) { return "$" + Number(n).toFixed(2); }

function imgFor(p) {
  // Only product 1's SQL image file actually exists in the repo.
  // Everything else falls back to the placeholder (see data/products.json).
  return p.image_file_in_repo ? "/assets/imgs/" + p.image : PLACEHOLDER;
}

function productCard(p) {
  const offer = p.special_offer
    ? `<span class="was">${money(p.price)}</span><span class="offer">-${p.special_offer}%</span>`
    : "";
  return `<article class="card">
    <a href="/product.html?id=${p.id}"><img src="${imgFor(p)}" alt="${escapeHtml(p.name)}" loading="lazy"></a>
    <div class="cat">${escapeHtml(p.category)} · ${escapeHtml(p.color)}</div>
    <h3><a href="/product.html?id=${p.id}">${escapeHtml(p.name)}</a></h3>
    <div class="price">${offer} ${money(p.sale_price ?? p.price)}</div>
    <button class="btn" onclick="addToCart(${p.id}, 1)">Add to Cart</button>
  </article>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// ---- cart (localStorage) ----
function getCart() {
  try { return JSON.parse(localStorage.getItem("eshop_cart") || "[]"); }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem("eshop_cart", JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(id, qty) {
  const cart = getCart();
  const line = cart.find((l) => l.id === id);
  if (line) line.qty += qty; else cart.push({ id, qty });
  saveCart(cart);
}
function updateCartBadge() {
  const el = document.getElementById("cart-count");
  if (el) el.textContent = getCart().reduce((n, l) => n + l.qty, 0);
}
document.addEventListener("DOMContentLoaded", updateCartBadge);
