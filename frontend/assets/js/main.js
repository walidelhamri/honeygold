const API_BASE = '/api';

// ─── NAV HELPERS ──────────────────────────────────────────────
function initNav() {
  const nav = document.querySelector('nav');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const currentPath = window.location.pathname;

  // Active link
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPath) link.classList.add('active');
  });

  // Scroll shadow
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Mobile menu
  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ─── API ───────────────────────────────────────────────────────
async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  const json = await res.json();
  return json.data || [];
}

// ─── PRODUCT CARD ──────────────────────────────────────────────
function createProductCard(product) {
  const badgeHtml = product.badge
    ? `<span class="product-badge ${product.badge.toLowerCase()}">${product.badge}</span>` : '';
  const imgSrc = product.image || '/assets/images/placeholder.jpg';

  return `
    <div class="product-card">
      <div class="product-card-image">
        <img src="${imgSrc}" alt="${product.name}" 
             onerror="this.src='/assets/images/placeholder.jpg'">
        ${badgeHtml}
      </div>
      <div class="product-card-body">
        <div class="product-category">${product.category || 'Pure'}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description || ''}</p>
        <div class="product-footer">
          <div>
            <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
            <div class="product-weight">${product.weight || ''}</div>
          </div>
          <button class="btn btn-ghost" onclick="addToCart('${product.id}', '${product.name}')">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

// ─── CART (simple) ─────────────────────────────────────────────
function addToCart(id, name) {
  showToast(`${name} added to cart`, 'success');
}

// ─── TOAST ─────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── FOOTER BUILDER ────────────────────────────────────────────
function buildFooter(container) {
  if (!container) return;
  container.innerHTML = `
    <footer>
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="nav-logo">
            <div class="logo-mark">🍯</div>
            <span class="logo-text">HoneyGold</span>
          </div>
          <p>Pure, organic, and wildly delicious honey — sourced from trusted apiaries and delivered to your door.</p>
        </div>
        <div>
          <div class="footer-heading">Shop</div>
          <ul class="footer-links">
            <li><a href="/products">All Products</a></li>
            <li><a href="/products?cat=Raw">Raw Honey</a></li>
            <li><a href="/products?cat=Organic">Organic</a></li>
            <li><a href="/products?cat=Premium">Premium</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-heading">Company</div>
          <ul class="footer-links">
            <li><a href="/about">Our Story</a></li>
            <li><a href="/about#beekeepers">Beekeepers</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-heading">Support</div>
          <ul class="footer-links">
            <li><a href="/contact">Help Center</a></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2024 HoneyGold. All rights reserved.</span>
        <span>Pure honey. Pure intention.</span>
      </div>
    </footer>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  buildFooter(document.querySelector('#footer'));
});
