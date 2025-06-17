document.getElementById('catalog-button').addEventListener('click', function () {
    window.location.href = 'catalog.html';
  });

const products = {
    category1: [
      { price: "3291 ₽", name: "Моторное масло SHELL Helix Ultra ECT C3", article: "103761157049", imgSrc: "img/tovar1.svg", link: "/product.html?id=685062d2141a50edf43b36e2" },
      { price: "1988 ₽", name: "Масло моторное SLT Неliх Ultrа", article: "550046387", imgSrc: "img/tovar2.svg", link: "/product.html?id=68507f6f141a50edf43b3710" },
      { price: "12415 ₽", name: "Лобовое стекло Volkswagen Passat CC", article: "944048322", imgSrc: "img/tovar3.svg", link: "/product.html?id=685118de79966544754e148a" },
      { price: "1357 ₽", name: "Комплект свечей зажигания NGK BPR6ES", article: "944048321", imgSrc: "img/tovar4.svg", link: "/product.html?id=68511b4e79966544754e14a8" },
      { price: "666 ₽", name: "Фильтр масляный Лада Гранта", article: "944048327", imgSrc: "img/tovar5.svg", link: "/product.html?id=68511dca79966544754e14c7" },
      { price: "152 ₽", name: "Пробка сливная масляного поддона двигателя с прокладкой VAG Audi Seat Skoda Volkswagen", article: "955548327", imgSrc: "img/tovar6.svg", link: "/product.html?id=68511f3779966544754e14de" }
    ],
    category2: [
      { price: "135 ₽", name: "RPA RemProfAvto Сальник вала", article: "508010", imgSrc: "img/tovar7.svg", link: "/product.html?id=6851202d79966544754e1502" },
      { price: "734 ₽", name: "Прокладка клапанной крышки", article: "224412002", imgSrc: "img/tovar8.svg", link: "/product.html?id=685120e679966544754e1518" },
      { price: "581 ₽", name: "Втулка стабилизатора", article: "9440483676", imgSrc: "img/tovar9.svg", link: "/product.html?id=685121a179966544754e152b" },
      { price: "230 ₽", name: "Кольцо уплотнительное фильтра", article: "315263144", imgSrc: "img/tovar10.svg", link: "/product.html?id=6851227f79966544754e153f" },
      { price: "560 ₽", name: "Cальник свечного колодца Mitsubishi Pajero II-IV", article: "198128545", imgSrc: "img/tovar11.svg", link: "/product.html?id=6851236079966544754e1556" },
      { price: "1561 ₽", name: "Свечи зажигания NGK BKR6E-11/2756", article: "650046387", imgSrc: "img/tovar12.svg", link: "/product.html?id=6851241979966544754e1569" }
    ],
    category3: [
      { price: "892 ₽", name: "Очиститель двигателя Motor Cleaner", article: "264412002", imgSrc: "img/tovar13.svg", link: "/product.html?id=6851251a79966544754e157d" },
      { price: "264 ₽", name: "Герметик-прокладка черный KERRY", article: "564412002", imgSrc: "img/tovar14.svg", link: "/product.html?id=685125db79966544754e1590" },
      { price: "636 ₽", name: "Щетки стеклоочистителя RD5", article: "864412002", imgSrc: "img/tovar15.svg", link: "/product.html?id=6851266679966544754e15a3" },
      { price: "1147 ₽", name: "Philips Лампа автомобильная", article: "12496542", imgSrc: "img/tovar16.svg", link: "/product.html?id=6851274a79966544754e15b6" },
      { price: "497 ₽", name: "Манометр автомобильный для шин", article: "9440483000", imgSrc: "img/tovar17.svg", link: "/product.html?id=685127fa79966544754e15ca" },
      { price: "284 ₽", name: "Муфта ресивера", article: "21121008088", imgSrc: "img/tovar18.svg", link: "/product.html?id=68517ee21588964be10b5204" }
    ],
    category4: [
      { price: "890 ₽", name: "Приспособление для утапливания поршней", article: "1040483000", imgSrc: "img/tovar19.svg", link: "/product.html?id=68517fc11588964be10b5217" },
      { price: "456 ₽", name: "Щетка очистки клеммы АКБ", article: "260012002", imgSrc: "img/tovar20.svg", link: "/product.html?id=685180bd1588964be10b522d" },
      { price: "2025 ₽", name: "Набор разрезных головок для снятия и установки кислородных датчиков", article: "260000000", imgSrc: "img/tovar21.svg", link: "/product.html?id=685183021588964be10b523f" },
      { price: "287 ₽", name: "Ключ для снятия масляного фильтра", article: "666046387", imgSrc: "img/tovar22.svg", link: "/product.html?id=685183cd1588964be10b5258" },
      { price: "336 ₽", name: "Масленка-нагнетатель DENZEL", article: "666046999", imgSrc: "img/tovar23.svg", link: "/product.html?id=6851846c1588964be10b526d" },
      { price: "620 ₽", name: "Приспособление JTC для проверки зазора", article: "326046999", imgSrc: "img/tovar24.svg", link: "/product.html?id=685185191588964be10b5280" }
    ]
  };
  
/// === ГАРАНТИРУЕМ, ЧТО DOM ЗАГРУЖЕН === //
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-input");
    const searchButton = document.querySelector(".search-button");

    if (!searchInput || !searchButton) {
        console.warn("🔍 Элементы поиска не найдены");
        return;
    }

    function searchProductByArticle(article) {
        const query = article.trim();

        for (const category in products) {
            const found = products[category].find(product => 
                product.article.trim() === query
            );

            if (found) {
                console.log("✅ Найден товар:", found.name);
                window.location.href = found.link;
                return;
            }
        }

        console.warn("🚫 Артикул не найден");
        alert("Такой артикул не найден");
    }

    // === УБРАЛИ input, ОСТАВИЛИ ТОЛЬКО Enter и кнопку === //

    // === Поиск при нажатии Enter === //
    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const query = this.value.trim();
            if (query) {
                searchProductByArticle(query);
            }
        }
    });

    // === Поиск при клике на кнопку === //
    searchButton.addEventListener("click", function () {
        const query = searchInput.value.trim();
        if (query) {
            searchProductByArticle(query);
        }
    });
});


  function updateProducts(category) {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = ''; 
    const categoryProducts = products[category];  
  
    categoryProducts.forEach(product => {
      const productCell = document.createElement('div');
      productCell.classList.add('product-cell', 'product-card');
      productCell.innerHTML = `
        <a href="${product.link}">
          <img src="${product.imgSrc}" alt="${product.name}">
        </a>
        <div class="product-info">
          <div class="product-price">${product.price}</div>
          <div class="product-name">${product.name}</div>
          <div class="product-article">${product.article}</div>
        </div>
      `;
      productGrid.appendChild(productCell);  
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const rectangles = document.querySelectorAll(".rectangle");
  
    rectangles.forEach(rect => {
      rect.addEventListener("click", function () {
        rectangles.forEach(el => {
          el.classList.remove("rectangle-yellow");
          el.classList.add("rectangle-black");
        });
        this.classList.remove("rectangle-black");
        this.classList.add("rectangle-yellow");
        const category = this.getAttribute("data-category");

        updateProducts(category);
      });
    });
    updateProducts('category1');
  });


function toggleFilter(id) {
  const filter = document.getElementById(id);
  const toggle = filter.previousElementSibling.querySelector('.toggle');
  if (filter.style.display === 'none' || filter.style.display === '') {
      filter.style.display = 'block';
      toggle.textContent = '-';
  } else {
      filter.style.display = 'none';
      toggle.textContent = '+';
  }
}


  const loadRange = document.getElementById('loadRange');
  const loadValue = document.getElementById('loadValue');
  loadRange.addEventListener('input', () => {
    loadValue.textContent = loadRange.value;
  });

  const deliveryRange = document.getElementById('deliveryRange');
  const deliveryValue = document.getElementById('deliveryValue');
  deliveryRange.addEventListener('input', () => {
    deliveryValue.textContent = deliveryRange.value;
  });


  function updateFileName() {
    const input = document.getElementById('resume-file');
    const fileName = document.getElementById('file-name');
    fileName.textContent = input.files.length > 0 ? input.files[0].name : 'Файл не выбран';
  }


  app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "connect-src 'self' http://127.0.0.1:*;");
    next();
  });

  document.addEventListener("DOMContentLoaded", () => {
  // === Профиль и выпадающее меню === //
const loginBtn = document.getElementById("login-btn");
const profileBtnContainer = document.getElementById("profile-btn-container");
const profileBtn = document.getElementById("profile-btn");
const profileDropdown = document.getElementById("profile-dropdown");
const logoutBtn = document.getElementById("logout-btn");
const profileLink = document.getElementById("profile-link");

const user = JSON.parse(localStorage.getItem("user"));

if (user && user.username) {
  loginBtn.style.display = "none";
  profileBtnContainer.style.display = "inline-block";
  if (profileBtn) profileBtn.textContent = user.username;
} else {
  loginBtn.style.display = "inline-block";
  profileBtnContainer.style.display = "none";
}

if (profileBtn) {
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (profileDropdown) {
      profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
    }
  });
}

if (profileDropdown && profileBtn) {
    document.addEventListener("click", (e) => {
      if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        profileDropdown.style.display = "none";
      }
    });

    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.style.display =
        profileDropdown.style.display === "block" ? "none" : "block";
    });
  }


if (profileLink) {
  profileLink.addEventListener("click", () => {
    window.location.href = "/profile.html";
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    location.reload();
  });
}
  });
  

  document.getElementById('product-catalog').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.products) {
                const productList = data.products;
                const catalogContainer = document.getElementById('catalog'); 
                let productsHtml = '<ul>';

                productList.forEach(product => {
                    productsHtml += `
                        <li>
                            <div class="product-item">
                                <h3>${product.name}</h3>
                                <p>${product.description}</p>
                                <p>Цена: ${product.price}</p>
                                <img src="${product.image}" alt="${product.name}" />
                            </div>
                        </li>
                    `;
                });

                productsHtml += '</ul>';
                catalogContainer.innerHTML = productsHtml; 
            } else {
                catalogContainer.innerHTML = '<p>Не удалось загрузить товары.</p>';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке продуктов:', error);
            catalogContainer.innerHTML = '<p>Ошибка при загрузке товаров.</p>';
        });
});
document.addEventListener('DOMContentLoaded', loadAllProducts);

function loadAllProducts() {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      const productList = document.getElementById('product-list');
      productList.innerHTML = '';

      data.products.forEach(product => {
        const li = document.createElement('li');
        li.innerHTML = `
          <h3>${product.name}</h3>
          <p>Артикул: ${product.article}</p>
          <p>Категория: ${product.category}</p>
          <p>Цена: ${product.price} руб.</p>
          <p>${product.description}</p>
        `;
        productList.appendChild(li);
      });
    })
    .catch(err => {
      console.error('Ошибка загрузки товаров:', err);
    });
}


// товары!! catalog.html

const activeBtn = document.querySelector('.category-btn.active');
if (activeBtn) {
  activeBtn.classList.remove('active');
}
btn.classList.add('active');

if (categoryButtons.length > 0) {
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const category = btn.getAttribute('data-category');
      try {
        const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
        const products = await response.json();
        displayProducts(products);
      } catch (err) {
        console.error('Ошибка при загрузке товаров по категории:', err);
      }
    });
  });
}

