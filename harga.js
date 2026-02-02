const BIN_PRICES = "69016b77ae596e708f34751c";
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

// Format waktu WIB
function getWIBTime() {
  const now = new Date();
  return now.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) + " WIB";
}

async function loadHarga() {
  const list = document.getElementById("hargaList");
  const updateTime = document.getElementById("updateTime");

  updateTime.textContent = "Update terakhir: " + getWIBTime();
  list.innerHTML = "<p>Memuat harga...</p>";

  try {
    const res = await fetch(`${BASE_URL}${BIN_PRICES}/latest`, {
      headers: { "X-Master-Key": API_KEY }
    });

    const data = await res.json();
    const harga = data.record?.harga || [];

    list.innerHTML = "";

    harga.forEach(h => {
      const item = document.createElement("div");
      item.className = "harga-item";
      item.innerHTML = `
        <span>${h.gram} Gram</span>
        <strong>Rp ${Number(h.price).toLocaleString("id-ID")}</strong>
      `;
      list.appendChild(item);
    });

  } catch {
    list.innerHTML = "<p>Gagal memuat harga.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadHarga);
