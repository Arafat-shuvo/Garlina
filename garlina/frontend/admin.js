const token = localStorage.getItem('garlina_token');
if(!token){
  location.href = '/login.html';
}

document.getElementById('logoutBtn').addEventListener('click', ()=>{
  localStorage.removeItem('garlina_token');
  location.href = '/';
});

async function api(path, opts={}){
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Authorization': 'Bearer ' + token,
      ...(opts.headers||{})
    }
  });
  if(!res.ok){
    const msg = await res.json().catch(()=>({message:'Error'}));
    alert(msg.message || 'Request failed');
    throw new Error('Request failed');
  }
  return res.json();
}

async function loadProducts(){
  const list = await fetch('/api/products').then(r=>r.json());
  const wrap = document.getElementById('prodList');
  wrap.innerHTML = '';
  for(const p of list){
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.imageUrl || 'https://placehold.co/400x300?text=G'}"/>
      <div class="content">
        <div><strong>${p.name}</strong></div>
        <div class="price">${p.price} BDT</div>
        <div>${p.category||''}</div>
        <button class="btn ghost" data-del="${p.id}">Delete</button>
      </div>
    `;
    wrap.appendChild(card);
  }
}

async function loadOrders(){
  const orders = await api('/api/orders');
  const wrap = document.getElementById('orders');
  wrap.innerHTML = '';
  for(const o of orders){
    const div = document.createElement('div');
    div.className = 'checkout';
    div.innerHTML = `
      <div><strong>Order #${o.id}</strong> — ${o.status} — ${new Date(o.createdAt).toLocaleString()}</div>
      <div><strong>Customer:</strong> ${o.customer.name} | ${o.customer.phone} | ${o.customer.address}</div>
      <ul>${o.items.map(it=>`<li>${it.name} x ${it.qty} — ${it.size||''} ${it.color||''}</li>`).join('')}</ul>
      <div><strong>Total:</strong> ${o.total} BDT</div>
      <select data-status="${o.id}">
        ${['Pending','Confirmed','Shipped','Delivered','Cancelled'].map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}
      </select>
    `;
    wrap.appendChild(div);
  }
}

document.addEventListener('change', async (e)=>{
  const id = e.target.getAttribute('data-status');
  if(id){
    await api('/api/orders/'+id+'/status', {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status: e.target.value })
    });
  }
});

document.addEventListener('click', async (e)=>{
  const del = e.target.getAttribute('data-del');
  if(del){
    if(confirm('Delete this product?')){
      await api('/api/products/'+del, { method:'DELETE' });
      loadProducts();
    }
  }
});

async function createProduct(e){
  e.preventDefault();
  const fd = new FormData(e.target);

  // 1) upload image if provided
  let imageUrl = '';
  const imgFile = fd.get('image');
  if(imgFile && imgFile.size>0){
    const upFd = new FormData();
    upFd.append('image', imgFile);
    const res = await fetch('/api/upload', { method:'POST', headers: { 'Authorization':'Bearer '+token }, body: upFd });
    const data = await res.json();
    if(!res.ok){ alert(data.message||'Upload failed'); return; }
    imageUrl = data.url;
  }

  // 2) create product
  const payload = {
    name: fd.get('name'),
    price: Number(fd.get('price')),
    category: fd.get('category') || 'Dress',
    sizes: (fd.get('sizes')||'S,M,L').split(',').map(s=>s.trim()).filter(Boolean),
    colors: (fd.get('colors')||'Pink,White').split(',').map(s=>s.trim()).filter(Boolean),
    description: fd.get('description') || '',
    imageUrl
  };

  const created = await api('/api/products', {
    method:'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });

  e.target.reset();
  loadProducts();
}

document.getElementById('prodForm').addEventListener('submit', createProduct);

loadProducts();
loadOrders();
