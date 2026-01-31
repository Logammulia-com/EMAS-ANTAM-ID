const BIN_PRODUCTS = "6901673443b1c97be988af5c";
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

function isLoggedIn() {
  return localStorage.getItem("antamaUser") !== null;
}

async function fetchBin(id) {
  const res = await fetch(`${BASE_URL}${id}/latest`, {
    headers: { "X-Master-Key": API_KEY },
  });
  const data = await res.json();
  return data.record;
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(item, directBuy = false) {
  const cart = getCart();
  cart.push(item);
  saveCart(cart);
  if (directBuy) window.location.href = "checkoutupdate.html";
}

async function renderProducts(keyword = "") {
  const data = await fetchBin(BIN_PRODUCTS);
  const products = data.products || [];

  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(keyword.toLowerCase())
  );

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.image}" class="clickable">
      <h3>${p.name}</h3>
      <p class="price">Rp ${p.price.toLocaleString("id-ID")}</p>
      <div class="product-actions">
        <button class="btn add-cart">Simpan ke Keranjang</button>
        <button class="btn buy-now">Lanjutkan Pembelian</button>
      </div>
    `;

    card.querySelector(".clickable").onclick = () => {
      const modal = document.getElementById("productModal");
      modal.querySelector("img").src = p.image;
      modal.querySelector("h3").textContent = p.name;
      modal.querySelector("#modalPrice").textContent =
        `Harga: Rp ${p.price.toLocaleString("id-ID")}`;
      modal.style.display = "flex";
    };

    card.querySelector(".add-cart").onclick = () => {
      if (!isLoggedIn()) return location.href="index.html";
      addToCart(p);
      alert("Produk disimpan ke keranjang");
    };

    card.querySelector(".buy-now").onclick = () => {
      if (!isLoggedIn()) return location.href="index.html";
      addToCart(p, true);
    };

    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();

  document.getElementById("searchInput")
    .addEventListener("input", e => renderProducts(e.target.value));

  document.getElementById("closeModal")
    .addEventListener("click", () =>
      document.getElementById("productModal").style.display = "none"
    );
});

