document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const currentPath = window.location.pathname;

  if (!user && currentPath === '/profile.html') {
    window.location.href = '/auth.html';
    return;
  }

  if (user && currentPath === '/auth.html') {
    window.location.href = '/profile.html';
    return;
  }

  if (user && currentPath === '/profile.html') {
    initializeProfilePage(user);
  }

  setupNavigationLinks();
  setupProductForm();
  setupCategoryButtons();
});


// === Действия с формой профиля === //
function setupProfileActions(user) {
  const usernameInput = document.getElementById('user-username');
  const emailInput = document.getElementById('user-email');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const errorMsg = document.getElementById('error-msg');
  const logoutBtn = document.getElementById('logout-btn');
  const changeAvatarBtn = document.getElementById('change-avatar-btn');
  const deleteAvatarBtn = document.getElementById('delete-avatar-btn');
  const avatarInput = document.getElementById('user-avatar-input');

  if (!usernameInput || !emailInput) return;

  // Убедимся, что поля заполнены сразу после установки данных
  usernameInput.value = user?.username || '';
  emailInput.value = user?.email || '';

  // Обработчик сохранения
saveBtn?.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();

  if (!username || !email) {
    errorMsg.textContent = 'Пожалуйста, заполните все поля.';
    return;
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    errorMsg.textContent = 'Введите корректный email.';
    return;
  }

  const updatedUser = { ...user, username, email };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  alert('✅ Профиль успешно сохранён!');
});


  // Обработчик отмены
  cancelBtn?.addEventListener('click', () => {
    usernameInput.value = user.username || '';
    emailInput.value = user.email || '';
    errorMsg.textContent = '';
  });

  // Смена аватара
    // Чтобы не дублировалось событие
    if (changeAvatarBtn && !changeAvatarBtn.dataset.listenerAdded) {
      changeAvatarBtn.dataset.listenerAdded = 'true';

      changeAvatarBtn.addEventListener('click', () => {
        avatarInput.click();
      });
    }

// === Загрузка аватара (только один раз) === //
    if (avatarInput && !avatarInput.dataset.loaded) {
      avatarInput.dataset.loaded = 'true';

      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          const avatarImg = document.getElementById('user-avatar');
          if (avatarImg) {
            avatarImg.src = reader.result;
            localStorage.setItem('avatar', reader.result);
          }
        };
        reader.readAsDataURL(file);
      });
    }


  // Удаление аватара
    deleteAvatarBtn?.addEventListener('click', () => {
      const avatarImg = document.getElementById('user-avatar');
      if (avatarImg) {
        avatarImg.src = 'img/img2/avatar.webp'; // путь к дефолтной аватарке
        localStorage.removeItem('avatar'); // удаляем из локального хранилища
        alert("✅ Аватар восстановлен к стандартному");
      }
    });

  // Выход
    logoutBtn?.addEventListener('click', () => {
      localStorage.removeItem('user');
      localStorage.removeItem('avatar');

      // Очищаем поля формы
      const usernameInput = document.getElementById('user-username');
      const emailInput = document.getElementById('user-email');
      const avatarImg = document.getElementById('user-avatar');

      if (usernameInput) usernameInput.value = '';
      if (emailInput) emailInput.value = '';
      if (avatarImg) avatarImg.src = 'img/img2/avatar.webp';
    });
}


function setupAdminTabs(originalProfileHTML) {
  const navList = document.getElementById('admin-nav-list');
  const tabs = document.querySelectorAll('.admin-tab');
  const profileContainer = document.getElementById('user-profile-container');
  const adminPanel = document.getElementById('admin-panel');

  if (!navList || !profileContainer || !adminPanel) return;

  navList.innerHTML = `
    <li><button data-tab="profile">Профиль</button></li>
    <li><button data-tab="products">Товары</button></li>
    <li><button data-tab="accounts">Аккаунты</button></li>
    <li><button data-tab="orders">Заказы</button></li>
    <li><button data-tab="my-orders">Мои заказы</button></li>
  `;

  const navButtons = document.querySelectorAll('.admin-nav [data-tab]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      // Скрываем все вкладки
      tabs.forEach(tab => {
        tab.style.display = 'none';
      });

      profileContainer.style.display = 'none';
      adminPanel.style.display = 'none';

      if (tabId === 'profile') {
        profileContainer.style.display = 'block';
        adminPanel.style.display = 'block';
        profileContainer.innerHTML = originalProfileHTML;
        setupProfileActions(JSON.parse(localStorage.getItem('user')));
      } else {
        const activeTab = document.getElementById(`tab-${tabId}`);
        if (activeTab) {
          activeTab.style.display = 'block';
        }

        if (tabId === 'products' && !document.querySelector('#tab-products .product-item')) loadProducts();
        if (tabId === 'accounts' && !document.querySelector('#tab-accounts tr')) loadAccounts();
        if (tabId === 'orders' && !document.querySelector('#tab-orders tr')) loadOrders();
        if (tabId === 'my-orders' && !document.querySelector('#tab-my-orders tr')) loadUserOrders();
      }
    });
  });

  // По умолчанию открываем "Профиль"
  document.querySelector('[data-tab="profile"]')?.click();
}

function setupUserTabs(originalProfileHTML) {
  const navList = document.getElementById('admin-nav-list');
  const tabs = document.querySelectorAll('.admin-tab');
  const profileContainer = document.getElementById('user-profile-container');

  if (!navList || !profileContainer) return;

  navList.innerHTML = `
    <li><button data-tab="profile">Профиль</button></li>
    <li><button data-tab="my-orders">Мои заказы</button></li>
  `;

  const navButtons = document.querySelectorAll('.admin-nav [data-tab]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      tabs.forEach(tab => tab.style.display = 'none');

      if (tabId === 'profile') {
        profileContainer.style.display = 'block';
        profileContainer.innerHTML = originalProfileHTML;
        setupProfileActions(JSON.parse(localStorage.getItem('user')));
      } else {
        profileContainer.style.display = 'none';

        const activeTab = document.getElementById(`tab-${tabId}`);
        if (activeTab) {
          activeTab.style.display = 'block';
        }

        if (tabId === 'my-orders' && !document.querySelector('#tab-my-orders tr')) {
          loadUserOrders();
        }
      }
    });
  });

  document.querySelector('[data-tab="profile"]')?.click();
}

// === Фильтрация по категориям === //
function setupCategoryButtons() {
  const categoryButtons = document.querySelectorAll('.category-btn');
  if (!categoryButtons.length) return;

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeBtn = document.querySelector('.category-btn.active');
      if (activeBtn) activeBtn.classList.remove('active');
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');
      loadProducts(category);
    });
  });
}

// === Загрузка товаров с фильтром по категории === //
async function loadProducts(category = null) {
  try {
    const response = await fetch("/api/products");
    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Получен не JSON:", text);
      document.getElementById("catalog").innerHTML = '<p>Ошибка загрузки данных</p>';
      return;
    }

    const products = await response.json();
    displayProducts(products, category);
  } catch (err) {
    console.error("Ошибка загрузки товаров:", err);
    document.getElementById("catalog").innerHTML = '<p>Не удалось загрузить товары</p>';
  }
}

// === Отображение товаров с фильтрацией по категории === //
function displayProducts(products, category = null) {
  const catalog = document.getElementById("catalog");
  if (!catalog) return;

  catalog.innerHTML = "";

  if (!Array.isArray(products)) {
    catalog.innerHTML = "<p>Неверный формат данных</p>";
    return;
  }

  if (products.length === 0) {
    catalog.innerHTML = "<p>Нет товаров</p>";
    return;
  }

  const filtered = category && category !== "all"
    ? products.filter(p => p.category === category)
    : products;

  if (filtered.length === 0) {
    catalog.innerHTML = `<p>Нет товаров в категории "${category}"</p>`;
    return;
  }

  filtered.forEach(product => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.dataset.category = product.category;
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>Цена: ${product.price} ₽</p>
      <p>Артикул: ${product.article}</p>
    `;
    catalog.appendChild(div);
  });
}

async function updateProductPrice(button) {
  const input = button.previousElementSibling.querySelector('input');
  const productId = input.dataset.id;
  const newPrice = parseFloat(input.value);

  if (isNaN(newPrice)) {
    alert('Введите корректную цену');
    return;
  }

  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ price: newPrice })
    });

    if (!response.ok) throw new Error('Ошибка обновления цены');

    alert('Цена изменена');
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Не удалось обновить цену');
  }
}


// === Переход между страницами === //
function setupNavigationLinks() {
  const profileLink = document.getElementById('profile-link');
  const homeLink = document.getElementById('home-link');

  profileLink?.addEventListener('click', () => {
    if (window.location.pathname !== '/profile.html') {
      window.location.href = '/profile.html';
    }
  });

  homeLink?.addEventListener('click', () => {
    if (window.location.pathname !== '/index.html') {
      window.location.href = '/index.html';
    }
  });
}


// Вызываем при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  setupCategoryButtons();
});

// === Загрузка всех товаров или по категории === //
async function loadProducts(category = null) {
  try {
    const url = category ? `/api/products?category=${encodeURIComponent(category)}` : '/api/products';
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    const products = await response.json();
    displayProducts(products);
  } catch (err) {
    console.error("Ошибка загрузки товаров:", err);
  }
}

// === Отображение товаров === //
function displayProducts(products) {
  const container = document.getElementById("products-list");
  if (!container) return;

  container.innerHTML = "";

  if (!Array.isArray(products)) {
    container.innerHTML = "<p>Неверный формат данных</p>";
    return;
  }

  if (products.length === 0) {
    container.innerHTML = "<p>Нет товаров</p>";
    return;
  }

  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product-item";
    div.dataset.category = product.category; // устанавливаем атрибут data-category
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>Цена: ${product.price} ₽</p>
      <p>Артикул: ${product.article}</p>
    `;
    container.appendChild(div);
  });
}

// === Кнопки фильтрации === //
function setupCategoryButtons() {
  const categoryButtons = document.querySelectorAll('.category-btn');
  if (!categoryButtons.length) return;

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeBtn = document.querySelector('.category-btn.active');
      if (activeBtn) activeBtn.classList.remove('active');
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');
      loadProducts(category); // загружаем товары этой категории
    });
  });
}
// === Проверка роли и отображение панели === //
function checkAuthAndShowAdminPanel() {
  const user = JSON.parse(localStorage.getItem("user"));
  const adminPanel = document.getElementById("admin-panel");

  if (adminPanel) {
    adminPanel.style.display = user && user.role === "admin" ? "block" : "none";
  }
}

// === Форма добавления товара === //
async function setupProductForm() {
  const addProductForm = document.getElementById('add-product-form');
  if (!addProductForm) return;

  addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      alert('❗ Только администратор может добавлять товары');
      return;
    }

    const name = document.getElementById('product-name').value.trim();
    const article = document.getElementById('product-article').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value.trim();
    const properties = document.getElementById('product-properties').value
      .split(',')
      .map(p => p.trim());
    const category = document.getElementById('product-category').value;
    const imageInput = document.getElementById('product-image');
    const imageFile = imageInput.files[0];

    if (!name || !article || !price || !category) {
      alert('❗ Заполните все обязательные поля');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('article', article);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('properties', properties.join(','));
    formData.append('category', category);
    if (imageFile) formData.append('image', imageFile);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        const errorText = await response.text();
        console.error("⚠️ Ошибка парсинга JSON:", errorText);
        alert("Ошибка: сервер вернул некорректный ответ");
        return;
      }

      if (result.message === 'Товар успешно добавлен') {
        alert("✅ Товар успешно добавлен");
        addProductForm.reset();
        await loadProducts(); // обновляем список
      } else {
        alert("⚠️ Что-то пошло не так");
      }
    } catch (err) {
      console.error('❌ Ошибка отправки товара:', err);
      alert("Не удалось отправить товар");
    }
  });
}

async function loadAccounts() {
  try {
    const response = await fetch('/api/users');
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Получен не JSON:', text);
      alert('Ошибка: получен не JSON');
      return;
    }

    const users = await response.json();
    const container = document.getElementById('accounts-list');
    if (!container) return;

    container.innerHTML = '';

    if (users.length === 0) {
      container.innerHTML = '<tr><td colspan="4">Нет пользователей</td></tr>';
      return;
    }

    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>********</td>
        <td class="action-buttons">
          <button onclick="deleteAccount('${user._id}', this)">Удалить</button>
        </td>
      `;
      container.appendChild(row);
    });
  } catch (err) {
    console.error('Ошибка загрузки аккаунтов:', err);
    alert('Не удалось загрузить аккаунты');
  }
}

fetch('/api/session')
  .then(res => res.json())
  .then(data => console.log('SESSION:', data))
  .catch(err => console.error('Ошибка получения сессии:', err));




// === Инициализация страницы профиля === //
function initializeProfilePage(user) {
  const usernameInput = document.getElementById('user-username');
  const emailInput = document.getElementById('user-email');
  const avatarImg = document.getElementById('user-avatar');
  const storedAvatar = localStorage.getItem('avatar');

  if (usernameInput) usernameInput.value = user?.username || '';
  if (emailInput) emailInput.value = user?.email || '';
  if (storedAvatar && avatarImg) avatarImg.src = storedAvatar;
  else if (avatarImg) avatarImg.src = 'img/img2/avatar.webp'; // дефолтная аватарка

  const profileContainer = document.getElementById('user-profile-container');
  const originalProfileHTML = profileContainer ? profileContainer.innerHTML : '';

  if (user?.role === 'admin') {
    setupAdminTabs(originalProfileHTML);
    loadProducts();
    loadAccounts();
    loadOrders();
  } else {
    setupUserTabs(originalProfileHTML);
    loadUserOrders();
  }

  setupProfileActions(user);
}

// === Добавление товара === //
let formInitialized = false;

function setupProductForm() {
  if (formInitialized) return;
  formInitialized = true;

  const addProductForm = document.getElementById('add-product-form');
  if (!addProductForm) return;

  addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      alert("❗ Только администратор может добавлять товары");
      return;
    }

    const name = document.getElementById("product-name").value.trim();
    const article = document.getElementById("product-article").value.trim();
    const price = parseFloat(document.getElementById("product-price").value);
    const description = document.getElementById("product-description").value.trim();
    const properties = document.getElementById("product-properties").value.split(',').map(p => p.trim());
    const category = document.getElementById("product-category").value;
    const imageInput = document.getElementById("product-image");
    const imageFile = imageInput.files[0];

    if (!name || !article || !price || !category) {
      alert("❗ Заполните обязательные поля");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("article", article);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("properties", properties.join(","));
    formData.append("category", category);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        const errorText = await response.text();
        console.error("⚠️ Сервер вернул не JSON:", errorText);
        alert("Ошибка: сервер вернул неверный ответ");
        return;
      }

      if (result.message === "Товар успешно добавлен") {
        alert("✅ Товар успешно добавлен");
        addProductForm.reset();
        await loadProducts();
      } else {
        alert("⚠️ Что-то пошло не так");
      }
    } catch (err) {
      console.error("❌ Ошибка:", err);
      alert("Не удалось отправить товар");
    }
  });
}

// === Загрузка товаров === //
async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Получен не JSON:", text);
      alert("Ошибка: получен не JSON");
      return;
    }

    const products = await response.json();
    const container = document.getElementById("products-list");
    if (!container) return;

    container.innerHTML = "";

    products.forEach(product => {
      const div = document.createElement("div");
      div.className = "product-item";
      div.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>Цена: ${product.price} ₽</p>
        <p>Артикул: ${product.article}</p>
        <button onclick="deleteProduct('${product._id}', this)">Удалить</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Ошибка загрузки товаров:", err);
    alert("❌ Не удалось загрузить товары");
  }
}

function displayProducts(products) {
  const catalog = document.getElementById("catalog");
  if (!catalog) return;

  catalog.innerHTML = ""; // очищаем перед отображением

  if (!Array.isArray(products)) {
    catalog.innerHTML = "<p>Неверный формат данных</p>";
    return;
  }

  if (products.length === 0) {
    catalog.innerHTML = "<p>Нет товаров</p>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>Цена: ${product.price} ₽</p>
      <p>Артикул: ${product.article}</p>
    `;
    catalog.appendChild(card);
  });
}


// === Удаление товара === //
function deleteProduct(productId, button) {
  if (!confirm("Вы уверены?")) return;

  fetch(`/api/products/${productId}`, {
    method: "DELETE",
    credentials: "include"
  })
  .then(res => {
    if (!res.ok) throw new Error("Ошибка сервера");
    return res.json();
  })
  .then(() => {
    button.closest(".product-item").remove();
    alert("✅ Товар удален");
  })
  .catch(err => {
    console.error("Ошибка удаления:", err);
    alert("❌ Не удалось удалить товар");
  });
}

async function loadOrders() {
  try {
    const response = await fetch("/api/orders", {
      method: "GET",
      credentials: "include"
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Получен не JSON:", text);
      alert("Ошибка: получен не JSON");
      return;
    }

    const data = await response.json();

    // Проверяем, действительно ли это объект или массив
    if (!data || typeof data !== "object") {
      console.error("❌ Ответ сервера не содержит данных:", data);
      alert("Ошибка: неверный формат данных");
      return;
    }

    // Если сервер возвращает { orders: [...] }
    const orders = Array.isArray(data.orders)
      ? data.orders
      : Array.isArray(data)
        ? data
        : [];

    const tbody = document.getElementById("orders-list");

    if (!tbody) return;
    tbody.innerHTML = "";

    if (orders.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = "<td colspan='4'>Нет заказов</td>";
      tbody.appendChild(row);
      return;
    }

    orders.forEach(order => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.userId?.username || 'N/A'}</td>
        <td>${order.userId?.email || 'N/A'}</td>
        <td>
          <select onchange="updateOrderStatus('${order._id}', this.value)">
            <option value="Собран" ${order.status === 'Собран' ? 'selected' : ''}>Собран</option>
            <option value="В пути" ${order.status === 'В пути' ? 'selected' : ''}>В пути</option>
            <option value="На выдаче" ${order.status === 'На выдаче' ? 'selected' : ''}>На выдаче</option>
          </select>
        </td>
        <td><button onclick="showOrderDetails('${order._id}', this)">Подробнее</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Ошибка получения заказов:", err);
    alert("Не удалось загрузить заказы");
  }
}

// === Обновление статуса заказа === //
async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.message || "Не удалось обновить статус");
      return;
    }

    alert("✅ Статус изменён");
    loadOrders(); // обновляем список заказов
  } catch (err) {
    console.error("Ошибка обновления статуса:", err);
    alert("❌ Не удалось обновить статус");
  }
}

// === Загрузка своих заказов (пользователь) === //
async function loadUserOrders() {
  try {
    const response = await fetch("/api/user/orders", {
      method: "GET",
      credentials: "include"
    });

    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Получен не JSON:", text);
      alert("Ошибка: получен не JSON");
      return;
    }

    const orders = await response.json();
    const tbody = document.getElementById("user-orders-list");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (Array.isArray(orders) && orders.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = "<td colspan='4'>У вас нет заказов</td>";
      tbody.appendChild(row);
      return;
    }

    if (!Array.isArray(orders)) {
      console.error("❌ Не массив:", orders);
      alert("❌ Неожиданный формат данных");
      return;
    }

    orders.forEach(order => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order._id}</td>
        <td>${new Date(order.createdAt).toLocaleString()}</td>
        <td>${order.status}</td>
        <td>${order.totalAmount}₽</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Ошибка получения моих заказов:", err);
    alert("❌ Не удалось получить ваши заказы");
  }
}

async function deleteAccount(userId) {
    if (!confirm("Вы уверены, что хотите удалить этот аккаунт?")) return;

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
        });

        const result = await response.json();

        if (result.message === 'Пользователь удален') {
            alert('✅ Пользователь успешно удален');
            // Обновляем список пользователей или перезагружаем страницу
            location.reload();
        } else {
            alert('❌ Ошибка при удалении пользователя: ' + result.message);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('⚠️ Произошла ошибка при удалении аккаунта.');
    }
}