const API = '/api';
let allProducts = [];
let deleteTargetId = null;

// ── AUTH ──────────────────────────────────────────────
function getToken() { return localStorage.getItem('hg_token'); }

function logout() {
  localStorage.removeItem('hg_token');
  localStorage.removeItem('hg_user');
  window.location.href = '/admin';
}

async function verifyAuth() {
  const token = getToken();
  if (!token) { window.location.href = '/admin'; return; }
  try {
    const res = await fetch(`${API}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const username = data.user?.username || localStorage.getItem('hg_user') || 'admin';
    document.getElementById('topbar-username').textContent = username;
    document.getElementById('sb-user').textContent = username;
  } catch {
    logout();
  }
}

// ── TOAST ─────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ── LOAD PRODUCTS ──────────────────────────────────────
async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    allProducts = data.data || [];
    renderTable(allProducts);
    updateStats(allProducts);
  } catch {
    showToast('Could not load products', 'error');
    document.getElementById('table-body').innerHTML =
      '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-light);">Failed to load. Is the server running?</td></tr>';
  }
}

// ── STATS ──────────────────────────────────────────────
function updateStats(products) {
  document.getElementById('stat-total').textContent = products.length;
  const cats = new Set(products.map(p => p.category)).size;
  document.getElementById('stat-cats').textContent = cats;
  const inStock = products.filter(p => (p.stock || 0) > 0).length;
  document.getElementById('stat-stock').textContent = inStock;
  const avg = products.length
    ? (products.reduce((s, p) => s + parseFloat(p.price), 0) / products.length).toFixed(0)
    : 0;
  document.getElementById('stat-avg').textContent = `$${avg}`;
}

// ── RENDER TABLE ───────────────────────────────────────
function renderTable(products) {
  const tbody = document.getElementById('table-body');
  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state">
        <div class="icon">🍯</div>
        <h3>No products yet</h3>
        <p>Add your first product to get started.</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const badgeHtml = p.badge
      ? `<span class="badge badge-gold">${p.badge}</span>`
      : `<span class="badge badge-grey">—</span>`;
    const stockBadge = (p.stock || 0) > 0
      ? `<span class="badge badge-green">${p.stock}</span>`
      : `<span class="badge badge-red">0</span>`;
    const imgHtml = p.image
      ? `<img src="${p.image}" class="product-thumb" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';

    return `
      <tr>
        <td>
          ${imgHtml}
          <div class="product-thumb-placeholder" ${p.image ? 'style="display:none"' : ''}>🍯</div>
        </td>
        <td><strong style="color:var(--brown-deep)">${p.name}</strong></td>
        <td>${p.category || '—'}</td>
        <td><strong style="color:var(--gold-deep)">$${parseFloat(p.price).toFixed(2)}</strong></td>
        <td>${p.weight || '—'}</td>
        <td>${stockBadge}</td>
        <td>${badgeHtml}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-edit btn-sm" onclick="editProduct('${p.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="openDelete('${p.id}', '${p.name.replace(/'/g, "\\'")}')">Del</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── SEARCH FILTER ──────────────────────────────────────
function filterTable() {
  const q = document.getElementById('search-input').value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.category || '').toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q)
  );
  renderTable(filtered);
}

// ── MODAL OPEN/CLOSE ───────────────────────────────────
function openModal(product = null) {
  clearForm();
  if (product) {
    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('edit-id').value = product.id;
    document.getElementById('f-name').value = product.name;
    document.getElementById('f-category').value = product.category || 'Pure';
    document.getElementById('f-price').value = product.price;
    document.getElementById('f-weight').value = product.weight || '';
    document.getElementById('f-stock').value = product.stock || 0;
    document.getElementById('f-badge').value = product.badge || '';
    document.getElementById('f-description').value = product.description || '';
    if (product.image) {
      document.getElementById('current-image-info').textContent = `Current: ${product.image}`;
    }
  } else {
    document.getElementById('modal-title').textContent = 'Add Product';
    document.getElementById('edit-id').value = '';
  }
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  clearForm();
}

function clearForm() {
  ['f-name', 'f-price', 'f-weight', 'f-stock', 'f-description'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-category').value = 'Pure';
  document.getElementById('f-badge').value = '';
  document.getElementById('f-image').value = '';
  document.getElementById('image-preview').style.display = 'none';
  document.getElementById('current-image-info').textContent = '';
  document.getElementById('edit-id').value = '';
}

function editProduct(id) {
  const p = allProducts.find(p => p.id === id);
  if (p) openModal(p);
}

// ── SAVE PRODUCT ───────────────────────────────────────
async function saveProduct() {
  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('f-name').value.trim();
  const price = document.getElementById('f-price').value;

  if (!name || !price) {
    showToast('Name and price are required', 'error');
    return;
  }

  const btn = document.getElementById('save-btn');
  btn.textContent = 'Saving…';
  btn.disabled = true;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', price);
  formData.append('category', document.getElementById('f-category').value);
  formData.append('weight', document.getElementById('f-weight').value);
  formData.append('stock', document.getElementById('f-stock').value || 0);
  formData.append('badge', document.getElementById('f-badge').value);
  formData.append('description', document.getElementById('f-description').value);

  const imageFile = document.getElementById('f-image').files[0];
  if (imageFile) formData.append('image', imageFile);

  const url = id ? `${API}/products/${id}` : `${API}/products`;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      showToast(id ? 'Product updated!' : 'Product added!', 'success');
      closeModal();
      loadProducts();
    } else {
      showToast(data.message || 'Save failed', 'error');
    }
  } catch {
    showToast('Network error', 'error');
  } finally {
    btn.textContent = 'Save Product';
    btn.disabled = false;
  }
}

// ── DELETE ──────────────────────────────────────────────
function openDelete(id, name) {
  deleteTargetId = id;
  document.getElementById('delete-name').textContent = name;
  document.getElementById('delete-overlay').classList.add('open');
}

function closeDelete() {
  deleteTargetId = null;
  document.getElementById('delete-overlay').classList.remove('open');
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const btn = document.getElementById('delete-btn');
  btn.textContent = 'Deleting…';
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/products/${deleteTargetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('Product deleted', 'success');
      closeDelete();
      loadProducts();
    } else {
      showToast('Delete failed', 'error');
    }
  } catch {
    showToast('Network error', 'error');
  } finally {
    btn.textContent = 'Delete';
    btn.disabled = false;
  }
}

// ── IMAGE PREVIEW ──────────────────────────────────────
function previewImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const preview = document.getElementById('image-preview');
    preview.src = ev.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// ── SECTION NAV ───────────────────────────────────────
function showSection(section) {
  document.getElementById('page-title').textContent =
    section.charAt(0).toUpperCase() + section.slice(1);
}

// ── CLOSE MODAL ON OVERLAY CLICK ──────────────────────
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.getElementById('delete-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('delete-overlay')) closeDelete();
});

// ── INIT ──────────────────────────────────────────────
(async () => {
  await verifyAuth();
  await loadProducts();
})();
