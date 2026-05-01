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
    nav?.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Mobile menu
  hamburger?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
  });
}

// ─── API ───────────────────────────────────────────────────────
async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  const json = await res.json();
  return json.data || [];
}

// ─── SAFE TEXT HELPERS ─────────────────────────────────────────
function escapeAttr(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// ─── PRODUCT CARD ──────────────────────────────────────────────
function createProductCard(product) {
  const productId = product._id || product.id;
  const productName = product.name || 'Product';
  const productPrice = Number(product.price || 0);
  const productImage = product.image || '/assets/images/placeholder.jpg';

  const badgeHtml = product.badge
    ? `<span class="product-badge ${escapeAttr(product.badge.toLowerCase())}">${escapeAttr(product.badge)}</span>`
    : '';

  return `
    <div class="product-card">
      <div class="product-card-image">
        <img src="${escapeAttr(productImage)}" alt="${escapeAttr(productName)}" 
             onerror="this.src='/assets/images/placeholder.jpg'">
        ${badgeHtml}
      </div>

      <div class="product-card-body">
        <div class="product-category">${escapeAttr(product.category || 'Pure')}</div>
        <h3 class="product-name">${escapeAttr(productName)}</h3>
        <p class="product-desc">${escapeAttr(product.description || '')}</p>

        <div class="product-footer">
          <div>
            <div class="product-price">$${productPrice.toFixed(2)}</div>
            <div class="product-weight">${escapeAttr(product.weight || '')}</div>
          </div>

          <button 
  class="btn btn-ghost add-to-cart"
  data-id="${product.id}"
  data-name="${product.name}"
  data-price="${product.price}"
  data-image="${product.image || '/assets/images/placeholder.jpg'}"
  data-weight="${product.weight || ''}"
>
  Add to Cart
</button>
        </div>
      </div>
    </div>
  `;
}

// ─── CART ──────────────────────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);

  const cartCount = document.querySelector('#cart-count');
  if (cartCount) {
    cartCount.textContent = count;
  }
}

function addToCart(product) {
  let cart = getCart();

  const existingProduct = cart.find(item => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      weight: product.weight,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartCount();

  showToast(`${product.name} added to cart`, 'success');

  setTimeout(() => {
    window.location.href = '/cart';
  }, 500);
}

function initCartButtons() {
  document.addEventListener('click', event => {
    const button = event.target.closest('.add-to-cart');
    if (!button) return;

    const product = {
      id: button.dataset.id,
      name: button.dataset.name,
      price: button.dataset.price,
      image: button.dataset.image,
      weight: button.dataset.weight
    };

    addToCart(product);
  });

  updateCartCount();
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
// ─── RENDER PRODUCTS ON PAGES ─────────────────────────────────
function findProductsContainer() {
  const selectors = [
    '#products-grid',
    '#productsGrid',
    '#featured-products',
    '#featuredProducts',
    '.products-grid',
    '.featured-products',
    '[data-products-grid]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }

  const elements = Array.from(document.querySelectorAll('main *'));
  return elements.find(element =>
    element.children.length === 0 &&
    element.textContent.trim().toLowerCase().includes('loading products')
  );
}

async function renderProductsOnPage() {
  const productsContainer = findProductsContainer();

  if (!productsContainer) return;

  productsContainer.classList.add('products-grid');

  try {
    const products = await fetchProducts();

    if (!products.length) {
      productsContainer.innerHTML = `
        <div class="empty-cart">
          <h3>No products found</h3>
          <p>Please add products from the admin dashboard.</p>
        </div>
      `;
      return;
    }

    const isHomePage = window.location.pathname === '/';
    const productsToShow = isHomePage ? products.slice(0, 3) : products;

    productsContainer.innerHTML = productsToShow
      .map(product => createProductCard(product))
      .join('');

  } catch (error) {
    console.error('Error loading products:', error);

    productsContainer.innerHTML = `
      <div class="empty-cart">
        <h3>Could not load products</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCartButtons();
  buildFooter(document.querySelector('#footer'));
  renderProductsOnPage();
});
