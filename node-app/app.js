// Express app shared by local dev (server.js) and Vercel (api/index.js).
// No database: products come from data/products.json (derived verbatim from
// shop_php.sql). No auth, no orders, no payment — see README.md / DEPLOY.md.
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "products.json"), "utf8")
);
const PRODUCTS = catalog.products;

function discounted(p) {
  const price = p.special_offer
    ? +(p.price * (1 - p.special_offer / 100)).toFixed(2)
    : p.price;
  return { ...p, sale_price: price };
}

function filterProducts(query) {
  let list = PRODUCTS.slice();
  if (query.category) {
    const c = String(query.category).toLowerCase();
    list = list.filter((p) => p.category.toLowerCase() === c);
  }
  if (query.max_price !== undefined && query.max_price !== "") {
    const max = Number(query.max_price);
    if (!Number.isNaN(max)) list = list.filter((p) => p.price <= max);
  }
  if (query.search) {
    const s = String(query.search).toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
    );
  }
  return list;
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, products: PRODUCTS.length, source: "data/products.json" });
});

// Mirrors shop.php: category + max-price search, 8 per page by default.
app.get("/api/products", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "8", 10) || 8));
  const filtered = filterProducts(req.query);
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const items = filtered
    .slice((page - 1) * limit, page * limit)
    .map(discounted);
  res.json({ items, page, limit, total, pages });
});

app.get("/api/products/:id", (req, res) => {
  const p = PRODUCTS.find((x) => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: "Product not found" });
  res.json(discounted(p));
});

// Placeholder: no orders are created and no payment is taken.
// Returns 501 on purpose so nobody mistakes this for a real checkout.
app.post("/api/checkout", (req, res) => {
  res.status(501).json({
    error: "Checkout is not implemented in this starter.",
    detail:
      "No order is created and no payment is taken. Wire up a hosted database and a payment provider first (see DEPLOY.md).",
  });
});

// Static frontend (public/) — used for local dev. On Vercel, public/ is
// served as static files and only /api/* reaches this app (see vercel.json).
app.use(express.static(path.join(__dirname, "public")));

// SPA-style fallback for the plain HTML pages (product/cart/checkout).
app.get(["/product", "/cart", "/checkout"], (req, res) => {
  const page = req.path.slice(1) + ".html";
  res.sendFile(path.join(__dirname, "public", page));
});

module.exports = app;
