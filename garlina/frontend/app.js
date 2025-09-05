// Simple SPA-ish frontend using vanilla JS + React for DOM rendering (via CDN).

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('garlina_cart') || '[]'),
};

function saveCart() {
  localStorage.setItem('garlina_cart', JSON.stringify(state.cart));
  updateCartCount();
}

function updateCartCount() {
  $('#cartCount').textContent = state.cart.reduce((sum, it) => sum + (it.qty || 1), 0);
}

async function loadProducts() {
  const res = await fetch('/api/products');
  state.products = await res.json();
  renderProducts();
}

function filteredProducts() {
  const cat = $('#categoryFilter').value;
  const q = $('#searchInput').value.trim().toLowerCase();
  return state.products.filter(p => {
    const okCat = !cat || p.category === cat;
    const okQ = !q || (p.name + ' ' + p.description).toLowerCase().includes(q);
    return okCat && okQ;
  });
}

function renderProducts() {
  const grid = $('#productGrid');
  grid.innerHTML = '';
  const items = filteredProducts();
  for (const p of items) {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.imageUrl || 'https://placehold.co/400x300?text=Garlina'}" alt="${p.name}" />
      <div class="content">
        <div><strong>${p.name}</strong></div>
        <div class="price">${p.price} BDT</div>
        <div>
          <label>Size 
            <select data-sel="size">
              ${(p.sizes||["S","M","L"]).map(s=>`<option>${s}</option>`).join('')}
            </select>
          </label>
          <label>Color 
            <select data-sel="color">
              ${(p.colors||["Pink","White"]).map(c=>`<option>${c}</option>`).join('')}
            </select>
          </label>
        </div>
        <button class="btn primary" data-add="${p.id}">Add to Cart</button>
      </div>
    `;
    grid.appendChild(el);
  }
}

function openCart() {
  $('#cartDrawer').classList.remove('hidden');
  renderCart();
}
function closeCart() {
  $('#cartDrawer').classList.add('hidden');
}

function renderCart() {
  const wrap = $('#cartItems');
  wrap.innerHTML = '';
  let total = 0;
  for (const it of state.cart) {
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <img src="${it.imageUrl || 'https://placehold.co/100x100?text=G'}" alt="${it.name}" />
      <div>
        <div><strong>${it.name}</strong></div>
        <div>${it.size || ''} ${it.color || ''}</div>
        <div>${it.price} BDT</div>
      </div>
      <div class="qty">
        <button data-dec="${it.id}">-</button>
        <span>${it.qty}</span>
        <button data-inc="${it.id}">+</button>
        <button data-del="${it.id}" title="Remove">🗑️</button>
      </div>
    `;
    wrap.appendChild(row);
    total += Number(it.price) * Number(it.qty || 1);
  }
  $('#cartTotal').textContent = total.toFixed(2);
}

function addToCart(productId, size, color) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;
  const key = `${p.id}-${size}-${color}`;
  const existing = state.cart.find(x => x.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      key, id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl,
      size, color, qty: 1
    });
  }
  saveCart();
  openCart();
}

function toCheckout() {
  $('#checkout').classList.remove('hidden');
  closeCart();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function placeOrder(e) {
  e.preventDefault();
  if (state.cart.length === 0) return alert('Cart is empty');
  const fd = new FormData(e.target);
  const payload = {
    items: state.cart,
    customer: {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      address: fd.get('address'),
    },
    note: fd.get('note') || ''
  };
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const msg = await res.json().catch(()=>({message:'Error'}));
    return alert(msg.message || 'Order failed');
  }
  const order = await res.json();
  state.cart = [];
  saveCart();
  $('#checkout').innerHTML = `<div class="success">Thanks! Your order <strong>#${order.id}</strong> is placed.</div>`;
}

document.addEventListener('click', (e) => {
  const add = e.target.getAttribute('data-add');
  if (add) {
    const card = e.target.closest('.card');
    const size = card.querySelector('[data-sel="size"]').value;
    const color = card.querySelector('[data-sel="color"]').value;
    addToCart(add, size, color);
  }
  const inc = e.target.getAttribute('data-inc');
  if (inc) {
    const row = e.target.closest('.cart-row');
    const id = inc;
    const item = state.cart.find(x=>x.id===id);
    if (item) { item.qty += 1; saveCart(); renderCart(); }
  }
  const dec = e.target.getAttribute('data-dec');
  if (dec) {
    const item = state.cart.find(x=>x.id===dec);
    if (item) { item.qty = Math.max(1, item.qty - 1); saveCart(); renderCart(); }
  }
  const del = e.target.getAttribute('data-del');
  if (del) {
    const idx = state.cart.findIndex(x=>x.id===del);
    if (idx>-1) { state.cart.splice(idx,1); saveCart(); renderCart(); }
  }
});

$('#cartBtn').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
$('#goCheckout').addEventListener('click', toCheckout);
$('#cancelCheckout').addEventListener('click', ()=> $('#checkout').classList.add('hidden'));
$('#checkoutForm').addEventListener('submit', placeOrder);
$('#categoryFilter').addEventListener('change', renderProducts);
$('#searchInput').addEventListener('input', renderProducts);

updateCartCount();
loadProducts();
