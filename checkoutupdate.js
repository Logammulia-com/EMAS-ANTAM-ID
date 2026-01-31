// === KONFIGURASI JSONBIN ===
const BIN_USERS = "6901583b43b1c97be9887dd7";
const BIN_REKENING = "6901807043b1c97be988e00f";
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("antamaUser"));
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!user) {
    alert("Silakan login terlebih dahulu!");
    window.location.href = "index.html";
    return;
  }

  const list = document.getElementById("checkoutList");
  const totalEl = document.getElementById("checkoutTotal");
  const savedAddress = document.getElementById("savedAddress");

  async function fetchBin(id) {
    const res = await fetch(`${BASE_URL}${id}/latest`, {
      headers: { "X-Master-Key": API_KEY },
    });
    const data = await res.json();
    return data.record;
  }

  async function updateBin(id, record) {
    await fetch(`${BASE_URL}${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify(record),
    });
  }

  async function fetchUsers() {
    const data = await fetchBin(BIN_USERS);
    return data.users || [];
  }

  async function updateUsers(users) {
    await updateBin(BIN_USERS, { users });
  }

  async function fetchRekening() {
    try {
      const data = await fetchBin(BIN_REKENING);
      return data.rekening || {};
    } catch {
      return {};
    }
  }

  // === RENDER CART ===
  function renderCart() {
    list.innerHTML = "";
    let total = 0;
    if (!cart.length) {
      list.innerHTML = "<p>Keranjang kosong.</p>";
      totalEl.textContent = "Rp 0";
      return;
    }
    cart.forEach((item, i) => {
      const el = document.createElement("div");
      el.className = "checkout-item";
      el.innerHTML = `
        <div class="item-thumb"><img src="${item.image || 'https://via.placeholder.com/150'}"></div>
        <div class="item-info">
          <h4>${item.name}</h4>
          <p>Rp ${item.price.toLocaleString("id-ID")}</p>
        </div>
        <div class="item-actions">
          <button class="remove-btn" data-index="${i}">Hapus</button>
        </div>`;
      list.appendChild(el);
      total += item.price;
    });
    totalEl.textContent = `Rp ${total.toLocaleString("id-ID")}`;
  }

  renderCart();

  list.addEventListener("click", e => {
    if (e.target.classList.contains("remove-btn")) {
      cart.splice(e.target.dataset.index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  });

  // === ALAMAT TERSIMPAN ===
  async function renderSavedAddresses() {
    const users = await fetchUsers();
    const current = users.find(u => u.email === user.email);

    if (!current) return;
    if (!current.addresses) current.addresses = [];

    const savedBox = document.getElementById("savedBox");
    const newBox = document.getElementById("newBox");

    if (!current.addresses.length) {
      document.querySelector("input[value='new']").checked = true;
      savedBox.style.display = "none";
      newBox.style.display = "block";
      savedAddress.innerHTML = "<p>Belum ada alamat tersimpan.</p>";
      return;
    }

    savedAddress.innerHTML = "";
    current.addresses.forEach((addr, i) => {
      const div = document.createElement("div");
      div.className = "alamat-item";
      div.innerHTML = `
        <label>
          <input type="radio" name="savedAddr" value="${i}" ${addr.isDefault ? "checked" : ""}>
          <strong>${addr.label}</strong><br>
          ${addr.alamat}
        </label>`;
      savedAddress.appendChild(div);
    });
  }

  await renderSavedAddresses();

  document.querySelectorAll("input[name='addressOpt']").forEach(r => {
    r.addEventListener("change", e => {
      document.getElementById("savedBox").style.display = e.target.value === "saved" ? "block" : "none";
      document.getElementById("newBox").style.display = e.target.value === "saved" ? "none" : "block";
    });
  });

  // === STEP 1 -> STEP 2 ===
  document.getElementById("nextToPayment").addEventListener("click", async () => {
    if (!cart.length) return alert("Keranjang kosong!");

    const addrOpt = document.querySelector("input[name='addressOpt']:checked").value;

    if (addrOpt === "new") {
      const name = checkoutName.value.trim();
      const email = checkoutEmail.value.trim();
      const phone = checkoutPhone.value.trim();
      const alamat = checkoutAlamat.value.trim();
      if (!name || !email || !phone || !alamat) {
        alert("Lengkapi semua data alamat terlebih dahulu.");
        return;
      }
    }

    const total = cart.reduce((s, i) => s + i.price, 0);
    finalTotal.textContent = `Rp ${total.toLocaleString("id-ID")}`;

    const rekening = await fetchRekening();
    paymentInfo.innerHTML = `
      <p>Silakan transfer ke:</p>
      <p><strong>${rekening.bank || "-"}</strong><br>
      No: <strong>${rekening.nomor || "-"}</strong><br>
      a/n ${rekening.nama || "-"}</p>`;

    checkoutStep1.style.display = "none";
    checkoutStep2.style.display = "grid";
  });

  // === SIMPAN ORDER + ALAMAT ===
  document.getElementById("confirmPayment").addEventListener("click", async () => {
    const addrOpt = document.querySelector("input[name='addressOpt']:checked").value;
    const note = orderNote.value.trim();
    const total = cart.reduce((s, i) => s + i.price, 0);

    const users = await fetchUsers();
    const current = users.find(u => u.email === user.email);
    if (!current.addresses) current.addresses = [];

    let shipping = {};

    if (addrOpt === "saved") {
      const idx = document.querySelector("input[name='savedAddr']:checked")?.value;
      if (idx === undefined) return alert("Pilih alamat dulu.");
      const addr = current.addresses[idx];
      shipping = { name: user.name, email: user.email, phone: current.phone || "", alamat: addr.alamat };
    } else {
      const name = checkoutName.value.trim();
      const email = checkoutEmail.value.trim();
      const phone = checkoutPhone.value.trim();
      const alamat = checkoutAlamat.value.trim();
      const addrStr = `${name} - ${phone} | ${alamat}`;
      shipping = { name, email, phone, alamat: addrStr };

      current.addresses.forEach(a => a.isDefault = false);
      current.addresses.push({ label: "Alamat Checkout", alamat: addrStr, isDefault: true });
    }

    if (!current.orders) current.orders = [];
    current.orders.push({
      id: "ORD-" + Date.now(),
      date: new Date().toLocaleString("id-ID"),
      items: cart.map(i => ({ name: i.name, price: i.price })),
      total,
      payment: "transfer",
      note,
      shipping,
      status: "Menunggu Konfirmasi"
    });

    await updateUsers(users);
    localStorage.removeItem("cart");

    alert("Pesanan berhasil dikirim.\nAdmin akan memverifikasi pembayaran kamu.");
    window.location.href = "home.html";
  });
});
