// =============================================
// STICKIVERSE – Warenkorb-Logik (localStorage)
// =============================================

const CART_KEY = 'stickiverse_cart';

// Cart Objekt holen
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

// Cart speichern
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

// Artikel hinzufügen
function addToCart(item) {
  const cart = getCart();

  // Prüfen ob gleicher Artikel schon drin (gleiche productId, size, quantity)
  const existingIdx = cart.findIndex(
    c => c.productId === item.productId &&
         c.size === item.size &&
         c.quantity === item.quantity
  );

  if (existingIdx >= 0) {
    cart[existingIdx].cartQty = (cart[existingIdx].cartQty || 1) + 1;
    cart[existingIdx].previewImage = item.previewImage || cart[existingIdx].previewImage;
  } else {
    cart.push({
      ...item,
      cartId: Date.now() + Math.random().toString(36).slice(2),
      cartQty: 1,
      addedAt: new Date().toISOString(),
    });
  }

  saveCart(cart);
  showToast('In den Warenkorb gelegt! ', 'success');
}

// Artikel entfernen
function removeFromCart(cartId) {
  const cart = getCart().filter(c => c.cartId !== cartId);
  saveCart(cart);
}

// Menge eines Cart-Items ändern
function updateCartItemQty(cartId, newQty) {
  const cart = getCart();
  const item = cart.find(c => c.cartId === cartId);
  if (!item) return;
  if (newQty <= 0) {
    removeFromCart(cartId);
    return;
  }
  item.cartQty = newQty;
  saveCart(cart);
}

// Warenkorb leeren
function clearCart() {
  saveCart([]);
}

// Gesamtanzahl der Artikel
function getCartCount() {
  return getCart().reduce((sum, item) => sum + (item.cartQty || 1), 0);
}

// Gesamtpreis berechnen
function getCartTotal() {
  return getCart().reduce((sum, item) => {
    const price = getPrice(item.productId, item.size, item.quantity);
    return sum + price * (item.cartQty || 1);
  }, 0);
}

// Navigation Cart-Counter aktualisieren
function updateCartUI() {
  const count = getCartCount();
  const counters = document.querySelectorAll('.nav__cart-count');
  counters.forEach(el => {
    el.textContent = count;
    el.classList.toggle('visible', count > 0);
  });

  // Cart-Badge in Nav-Button
  const cartBtns = document.querySelectorAll('[data-cart-count]');
  cartBtns.forEach(el => {
    el.setAttribute('data-cart-count', count);
  });
}

// Toast-Benachrichtigung
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Beim Laden der Seite Cart-UI aktualisieren
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  // Nav scrolled-Klasse
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
});
