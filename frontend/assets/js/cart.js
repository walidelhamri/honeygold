function getCartItems() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCartItems(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartNumber() {
  const cart = getCartItems();
  const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);

  const cartCount = document.querySelector('#cart-count');
  if (cartCount) {
    cartCount.textContent = count;
  }
}

function renderCart() {
  const cartItemsContainer = document.querySelector('#cart-items');
  const subtotalEl = document.querySelector('#cart-subtotal');
  const totalEl = document.querySelector('#cart-total');

  if (!cartItemsContainer) return;

  const cart = getCartItems();

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some pure HoneyGold products to your cart.</p>
        <a href="/products" class="btn btn-primary">Shop Products</a>
      </div>
    `;

    subtotalEl.textContent = '0.00';
    totalEl.textContent = '0.00';
    updateCartNumber();
    return;
  }

  let subtotal = 0;

  cartItemsContainer.innerHTML = cart.map(item => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);
    const itemTotal = price * quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image || '/assets/images/placeholder.jpg'}" 
               alt="${item.name}" 
               onerror="this.src='/assets/images/placeholder.jpg'">
        </div>

        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p>${item.weight || ''}</p>
          <strong>$${price.toFixed(2)}</strong>
        </div>

        <div class="cart-quantity">
          <button onclick="changeQuantity('${item.id}', -1)">−</button>
          <span>${quantity}</span>
          <button onclick="changeQuantity('${item.id}', 1)">+</button>
        </div>

        <div class="cart-item-total">
          $${itemTotal.toFixed(2)}
        </div>

        <button class="remove-item" onclick="removeFromCart('${item.id}')">×</button>
      </div>
    `;
  }).join('');

  subtotalEl.textContent = subtotal.toFixed(2);
  totalEl.textContent = subtotal.toFixed(2);

  updateCartNumber();
}

function changeQuantity(id, amount) {
  const cart = getCartItems();
  const item = cart.find(product => product.id === id);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCartItems(cart);
  renderCart();
}

function removeFromCart(id) {
  let cart = getCartItems();
  cart = cart.filter(item => item.id !== id);

  saveCartItems(cart);
  renderCart();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  const clearCartBtn = document.querySelector('#clear-cart');

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      localStorage.removeItem('cart');
      renderCart();
    });
  }
});
