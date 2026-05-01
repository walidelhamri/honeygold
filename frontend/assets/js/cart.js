function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = count;
  }
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  if (!cartItems || !cartTotal) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
    cartTotal.textContent = '0';
    updateCartCount();
    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map(item => {
    const itemTotal = Number(item.price) * item.quantity;
    total += itemTotal;

    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" width="80">
        <div>
          <h3>${item.name}</h3>
          <p>Price: ${item.price} €</p>
          <p>Quantity: ${item.quantity}</p>
          <button onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  cartTotal.textContent = total.toFixed(2);
  updateCartCount();
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  renderCart();
}

const clearCartButton = document.getElementById('clear-cart');

if (clearCartButton) {
  clearCartButton.addEventListener('click', () => {
    localStorage.removeItem('cart');
    renderCart();
  });
}

renderCart();
