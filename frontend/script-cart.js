document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById("cart-root");
  const isLoggedIn = localStorage.getItem("user");

  if (!isLoggedIn) {
    root.innerHTML = '<p class="message">Зарегистрируйтесь или войдите в систему, чтобы увидеть корзину</p>';
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  window.products = {}; // Сохраняем товары для дальнейшего использования

  if (cart.length === 0) {
    root.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
    return;
  }

  Promise.all(cart.map(id => fetch(`/api/products/${id}`).then(res => res.json())))
    .then(productsData => {
      // Подсчёт количества каждого товара
      cart.forEach(id => {
        if (!window.products[id]) {
          window.products[id] = { count: 0 };
        }
        window.products[id].count++;
      });

      // Объединение информации о товарах
      productsData.forEach(product => {
        if (window.products[product._id]) {
          window.products[product._id] = {
            ...window.products[product._id],
            ...product
          };
        }
      });

      renderCart(Object.values(window.products));
    })
    .catch(err => {
      console.error('Ошибка загрузки товаров:', err);
      root.innerHTML = '<p>Не удалось загрузить товары из API</p>';
    });
});

function renderCart(items) {
  let total = 0;
  let html = `<div class="cart-container">`;

  items.forEach(item => {
    const subtotal = item.price * item.count;
    total += subtotal;

    html += `
      <div class="cart-item" data-id="${item._id}">
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-info">
          <h3>${item.name}</h3>
          <p>${item.description || "Без описания"}</p>
        </div>
        <div class="cart-controls">
          <button onclick="updateQuantity('${item._id}', -1)">-</button>
          <span>${item.count}</span>
          <button onclick="updateQuantity('${item._id}', 1)">+</button>
        </div>
        <div class="cart-price">${subtotal} ₽</div>
      </div>
    `;
  });

  html += `
    <div class="cart-total">Итого: ${total} ₽</div>
    <button class="checkout-btn" onclick="proceedToCheckout()">Перейти к оформлению</button>
  </div>`;

  document.getElementById("cart-root").innerHTML = html;
}

// === Изменение количества товара ===
window.updateQuantity = function (id, delta) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (delta === -1) {
    const index = cart.indexOf(id);
    if (index > -1) cart.splice(index, 1);
  } else {
    cart.push(id);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
};

// === Переход к оформлению заказа === //
window.proceedToCheckout = function () {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    alert("🛒 Корзина пуста");
    return;
  }

  // Сохраняем временно товары для checkout
  localStorage.setItem('checkout-cart', JSON.stringify({ items: cart }));

  // Перенаправление
  window.location.href = 'checkout.html';

  const cartItems = Object.values(window.products).map(item => ({
    productId: item._id,
    name: item.name,
    price: item.price,
    quantity: item.count,
    image: item.image
  }));

  const user = JSON.parse(localStorage.getItem('user'));
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!user) {
    alert('Авторизуйтесь, чтобы оформить заказ');
    return;
  }

  const newOrder = new Order({
    userId: user._id,
    items: cartItems,
    total,
    deliveryMethod: 'Курьером',
    paymentMethod: 'Онлайн',
    status: 'Собран'
  });

  // Для тестирования без бэкенда:
  localStorage.setItem(`orders-${user.email}`, JSON.stringify([{
    orderId: `order-${Date.now()}`,
    items: cartItems,
    total,
    deliveryMethod: 'Курьером',
    paymentMethod: 'Онлайн',
    status: 'Собран',
    date: new Date().toLocaleDateString()
  }]));

  window.location.href = 'order-success.html';
};