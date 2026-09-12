/* ===================================================
   Sanira Clothing — Shared Script
   Cart (localStorage) + WhatsApp checkout + UI effects
=================================================== */

const WHATSAPP_NUMBER = "923143551238"; // 0314-3551238 in international format
const CART_KEY = "saniraCart";

/* ---------- Cart helpers ---------- */
function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount(){
  const cart = getCart();
  const count = cart.reduce((sum,item)=>sum+item.qty,0);
  document.querySelectorAll(".cart-count").forEach(el=>{
    el.textContent = count;
    el.style.display = count > 0 ? "inline-block" : "none";
  });
}
function addToCart(name, price, img){
  const cart = getCart();
  const existing = cart.find(i=>i.name === name);
  if(existing){ existing.qty += 1; }
  else{ cart.push({name, price:Number(price), img, qty:1}); }
  saveCart(cart);
  showToast(`${name} cart mein add ho gaya`);
}
function removeFromCart(name){
  let cart = getCart().filter(i=>i.name !== name);
  saveCart(cart);
  renderCartPage();
}
function changeQty(name, delta){
  let cart = getCart();
  const item = cart.find(i=>i.name === name);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){ cart = cart.filter(i=>i.name !== name); }
  saveCart(cart);
  renderCartPage();
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg){
  let toast = document.querySelector(".toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove("show"), 2200);
}

/* ---------- Render cart page ---------- */
function renderCartPage(){
  const wrap = document.getElementById("cart-container");
  if(!wrap) return; // not on cart page
  const cart = getCart();

  if(cart.length === 0){
    wrap.innerHTML = `
      <div class="empty-cart reveal in-view">
        <h2>Aapka cart khali hai</h2>
        <p>Shopping shuru karein aur apni pasandeeda dupatta cart mein add karein.</p>
        <a href="products.html" class="btn btn-primary">Shop Now</a>
      </div>`;
    return;
  }

  let rows = cart.map(item => `
    <tr>
      <td>
        <div class="cart-item-info">
          <img src="${item.img}" alt="${item.name}">
          <span>${item.name}</span>
        </div>
      </td>
      <td>Rs. ${item.price.toLocaleString()}</td>
      <td>
        <div class="qty-control">
          <button aria-label="Kam karein" onclick="changeQty('${item.name.replace(/'/g,"\\'")}',-1)">−</button>
          <span>${item.qty}</span>
          <button aria-label="Zyada karein" onclick="changeQty('${item.name.replace(/'/g,"\\'")}',1)">+</button>
        </div>
      </td>
      <td>Rs. ${(item.price*item.qty).toLocaleString()}</td>
      <td><button class="remove-btn" onclick="removeFromCart('${item.name.replace(/'/g,"\\'")}')">Remove</button></td>
    </tr>`).join("");

  const total = cart.reduce((sum,i)=>sum + i.price*i.qty, 0);

  wrap.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="cart-summary reveal in-view">
      <div class="row"><span>Subtotal</span><span>Rs. ${total.toLocaleString()}</span></div>
      <div class="row"><span>Delivery</span><span>Order par confirm hoga</span></div>
      <div class="row total"><span>Total</span><span>Rs. ${total.toLocaleString()}</span></div>
      <button class="btn btn-whatsapp" style="width:100%;justify-content:center;margin-top:16px" onclick="checkoutOnWhatsApp()">
        Order on WhatsApp
      </button>
    </div>`;
}

function checkoutOnWhatsApp(){
  const cart = getCart();
  if(cart.length === 0) return;
  let msg = "Assalam-o-Alaikum! Mujhe ye order place karna hai:%0A%0A";
  cart.forEach(item=>{
    msg += `• ${item.name} x${item.qty} — Rs. ${(item.price*item.qty).toLocaleString()}%0A`;
  });
  const total = cart.reduce((sum,i)=>sum + i.price*i.qty, 0);
  msg += `%0ATotal: Rs. ${total.toLocaleString()}%0A%0AName: %0AAddress: %0AShehar: `;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

/* ---------- Product filter (Shop page) ---------- */
function applyFilter(cat){
  document.querySelectorAll(".product-card").forEach(card=>{
    card.style.display = (cat === "all" || card.dataset.category === cat) ? "" : "none";
  });
}
function initFilters(){
  const chips = document.querySelectorAll(".chip");
  if(!chips.length) return;
  chips.forEach(chip=>{
    chip.addEventListener("click", ()=>{
      chips.forEach(c=>c.classList.remove("active"));
      chip.classList.add("active");
      applyFilter(chip.dataset.filter);
    });
  });
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat");
  if(cat){
    const match = document.querySelector(`.chip[data-filter="${cat}"]`);
    if(match){
      chips.forEach(c=>c.classList.remove("active"));
      match.classList.add("active");
      applyFilter(cat);
    }
  }
}

/* ---------- Mobile nav ---------- */
function initNavToggle(){
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if(!toggle || !nav) return;
  toggle.addEventListener("click", ()=> nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click", ()=>nav.classList.remove("open")));
}

/* ---------- Scroll reveal ---------- */
function initReveal(){
  const items = document.querySelectorAll(".reveal");
  if(!items.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.15});
  items.forEach(el=>io.observe(el));
}

/* ---------- Contact form -> WhatsApp ---------- */
function initContactForm(){
  const form = document.getElementById("contact-form");
  if(!form) return;
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("cf-name").value.trim();
    const message = document.getElementById("cf-message").value.trim();
    const text = encodeURIComponent(`Assalam-o-Alaikum, mera naam ${name} hai.%0A${message}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  });
}

/* ---------- Init on every page ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartCount();
  initNavToggle();
  initReveal();
  initFilters();
  renderCartPage();
  initContactForm();

  document.querySelectorAll("[data-add-to-cart]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      addToCart(btn.dataset.name, btn.dataset.price, btn.dataset.img);
    });
  });
});

let vid = document.querySelector('#vid')

function hoverFun(){
  vid.autoplay = false
  console.log(vid.autoplay);
  
}
  console.log(vid);
