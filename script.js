// script.js - Carrito y Whatsapp
// Reemplaza este número con el número del vendedor en formato internacional (ejemplo Perú: 519XXXXXXXX)
const SELLER_PHONE = "51903415178"; // <-- Cambia aquí

// Productos de ejemplo
const products = [
  { id: 1, name: "Bombón de fresa", price: 3.50, emoji: "🍓", desc: "Delicioso bombón relleno" },
  { id: 2, name: "Trufa de chocolate", price: 1.00, emoji: "🍫", desc: "Trufa cremosa artesanal" },
  { id: 3, name: "Caramelos surtidos", price: 2.50, emoji: "🍬", desc: "Bolsa 100g" },
  { id: 4, name: "Cupcake rosa", price: 5.00, emoji: "🧁", desc: "Cupcake con frosting" },
  { id: 5, name: "Macarons", price: 6.00, emoji: "🍥", desc: "Pack de 4 sabores" },
  { id: 6, name: "Galletas decoradas", price: 4.50, emoji: "🍪", desc: "Set de 6 galletas" },
];

// Estado del carrito (memoria)
let cart = [];

// DOM
const productsList = document.getElementById("products-list");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const clearCartBtn = document.getElementById("clear-cart");
const whatsappBtn = document.getElementById("whatsapp-order");

// --- Render productos
function formatMoney(v){ return `S/ ${v.toFixed(2)}`; }

function renderProducts(){
  productsList.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("article");
    card.className = "card product";
    card.innerHTML = `
      <div class="product-image" aria-hidden="true">${p.emoji}</div>
      <div>
        <div class="product-title">${p.name}</div>
        <div class="product-desc small">${p.desc}</div>
      </div>
      <div class="product-meta">
        <div class="price">${formatMoney(p.price)}</div>
        <button class="btn primary add-to-cart" data-id="${p.id}">Agregar</button>
      </div>
    `;
    productsList.appendChild(card);
  });

  // listeners en botones agregar
  document.querySelectorAll(".add-to-cart").forEach(btn=>{
    btn.addEventListener("click", e=>{
      const id = Number(e.currentTarget.dataset.id);
      addToCart(id);
    });
  });
}

// --- Carrito: añadir, actualizar, borrar
function addToCart(productId, qty = 1){
  const product = products.find(p => p.id === productId);
  if(!product) return;
  const item = cart.find(ci => ci.id === productId);
  if(item) item.qty += qty;
  else cart.push({ id: productId, name: product.name, price: product.price, qty });
  renderCart();
}

function removeFromCart(productId){
  cart = cart.filter(i => i.id !== productId);
  renderCart();
}

function changeQty(productId, delta){
  const item = cart.find(i => i.id === productId);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) removeFromCart(productId);
  renderCart();
}

function clearCart(){
  cart = [];
  renderCart();
}

// --- Render carrito
function renderCart(){
  cartItems.innerHTML = "";
  if(cart.length === 0){
    cartItems.innerHTML = `<p class="empty">Tu carrito está vacío</p>`;
    cartTotal.textContent = formatMoney(0);
    whatsappBtn.disabled = true;
    return;
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div style="flex:1">
        <div><strong>${item.name}</strong></div>
        <div class="small">Precio unitario: ${formatMoney(item.price)}</div>
      </div>

      <div class="qty">
        <button class="btn ghost dec" data-id="${item.id}" aria-label="Disminuir cantidad">-</button>
        <div class="small" aria-live="polite">${item.qty} u</div>
        <button class="btn ghost inc" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
        <div style="width:8px"></div>
        <div class="small" style="min-width:64px; text-align:right">${formatMoney(item.price * item.qty)}</div>
        <button class="btn ghost remove" data-id="${item.id}" title="Eliminar">✕</button>
      </div>
    `;
    cartItems.appendChild(row);
  });

  // agregar listeners
  cartItems.querySelectorAll(".inc").forEach(b=>b.addEventListener("click", e=>{
    changeQty(Number(e.currentTarget.dataset.id), +1);
  }));
  cartItems.querySelectorAll(".dec").forEach(b=>b.addEventListener("click", e=>{
    changeQty(Number(e.currentTarget.dataset.id), -1);
  }));
  cartItems.querySelectorAll(".remove").forEach(b=>b.addEventListener("click", e=>{
    removeFromCart(Number(e.currentTarget.dataset.id));
  }));

  // total
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  cartTotal.textContent = formatMoney(total);
  whatsappBtn.disabled = false;
}

// --- Generar mensaje para WhatsApp
function buildWhatsAppMessage(){
  if(cart.length === 0) return "";
  let text = "Hola! quisiera hacer el siguiente pedido:%0A";
  cart.forEach(i=>{
    // %0A es salto de línea en URL (ya codificaremos luego)
    text += `${i.qty} x ${i.name} - S/ ${ (i.price * i.qty).toFixed(2) }%0A`;
  });
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  text += `Total: S/ ${total.toFixed(2)}%0A`;
  text += "%0APor favor confirme disponibilidad y tiempo de entrega. Gracias!";
  return text; // ya con %0A para saltos
}

function openWhatsApp(){
  if(!SELLER_PHONE || SELLER_PHONE.includes("0000")){
    alert("Por favor, actualiza el número de WhatsApp del vendedor en script.js (variable SELLER_PHONE).");
    return;
  }
  const msg = buildWhatsAppMessage();
  // Usamos wa.me con número y texto (ya con saltos codificados)
  const url = `https://wa.me/${SELLER_PHONE}?text=${msg}`;
  window.open(url, "_blank");
}

// --- Inicialización
function init(){
  renderProducts();
  renderCart();

  clearCartBtn.addEventListener("click", ()=>{
    if(confirm("¿Vaciar todo el carrito?")) clearCart();
  });

  whatsappBtn.addEventListener("click", openWhatsApp);
}

init();

