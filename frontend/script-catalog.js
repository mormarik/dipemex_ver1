let allProducts = []; // Все товары будут храниться здесь

document.addEventListener("DOMContentLoaded", async () => {
  const catalogGrid = document.getElementById("catalogGrid");
  const categoryButtons = document.querySelectorAll(".category-btn");

  try {
    const productResponse = await fetch("/api/products");
    if (!productResponse.ok) throw new Error("Ошибка загрузки товаров");

    allProducts = await productResponse.json(); // Сохраняем все товары в переменную
  } catch (err) {
    console.error("Ошибка получения товаров:", err);
    catalogGrid.innerHTML = "<p>Не удалось загрузить товары</p>";
    return;
  }

  function renderProducts(category = "all") {
    catalogGrid.innerHTML = ""; // Очищаем перед отрисовкой

    const filteredProducts = allProducts.filter(product => {
      return category === "all" || product.category === category;
    });

    if (filteredProducts.length === 0) {
      catalogGrid.innerHTML = "<p>Товаров не найдено.</p>";
      return;
    }

    filteredProducts.forEach(product => {
      const productCard = document.createElement("div");
      productCard.classList.add("item-card");
      productCard.setAttribute("data-category", product.category || "Без категории");

      productCard.innerHTML = `
        <div class="item-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="item-info">
          <div class="item-price">${product.price} ₽</div>
          <div class="item-name">${product.name}</div>
          <div class="item-article">Артикул: ${product.article}</div>
        </div>`;

      // Обработчик клика по карточке
      productCard.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) return; // если кнопка удаления — не открываем карточку

        window.location.href = `product.html?id=${product._id}`;
      });


      catalogGrid.appendChild(productCard);
    });
  }

  // === Обработчики кнопок категорий === //
  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      document.querySelector(".category-btn.active")?.classList.remove("active");
      button.classList.add("active");

      const selectedCategory = button.dataset.category;
      renderProducts(selectedCategory);
    });
  });

  // === Первоначальная отрисовка === //
  renderProducts();
});