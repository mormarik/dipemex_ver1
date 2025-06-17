document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById("checkout-form");
  const productsList = document.getElementById("checkout-products-list");
  const totalPriceDiv = document.getElementById("checkout-total-price");
  const errorDiv = document.getElementById("checkout-error");

  // === Получаем товары из корзины === //
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    productsList.innerHTML = "<li>Корзина пуста</li>";
    totalPriceDiv.textContent = "Итого: 0 ₽";
    return;
  }

  let total = 0;

  // Загружаем товары по ID из API
  Promise.all(
    cart.map(id =>
      fetch(`/api/products/${id}`).then(res => {
        if (!res.ok) throw new Error(`Ошибка загрузки ${id}`);
        return res.json();
      })
    )
  ).then(products => {
    const productMap = {};
    cart.forEach(id => {
      if (!productMap[id]) productMap[id] = { count: 0 };
      productMap[id].count++;
    });

    const items = products.map(product => {
      const count = productMap[product._id]?.count || 1;
      const subtotal = product.price * count;
      total += subtotal;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${product.name}</span>
        <span>${product.price} × ${count} = ${subtotal} ₽</span>
      `;
      productsList.appendChild(li);

      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: count
      };
    });

    // ✅ Сохраняем данные для использования в форме
    window.checkoutData = {
      items,
      total
    };

    totalPriceDiv.textContent = `Итого: ${total} ₽`;

    // === Теперь можно обрабатывать форму === //
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", async e => {
        e.preventDefault();

        const fullName = document.getElementById("full-name").value.trim();
        const address = document.getElementById("address").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const deliveryMethod = document.querySelector('input[name="delivery"]:checked')?.value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

        if (!fullName || !address || !phone || !email || !deliveryMethod || !paymentMethod) {
          errorDiv.textContent = "❗ Заполните все поля";
          return;
        }

        // Валидация телефона
        const cleanedPhone = phone.replace(/\D/g, '');
        const phoneRegex = /^(\+7|\+8)\d{10,14}$/;

        if (!phoneRegex.test(`+${cleanedPhone}`)) {
          errorDiv.textContent = "⚠️ Неверный формат телефона";
          return;
        }

        // Валидация email
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
          errorDiv.textContent = "⚠️ Неверный email";
          return;
        }

        // Формируем данные заказа
        const orderData = {
          fullName,
          address,
          phone: `+${cleanedPhone}`,
          email,
          deliveryMethod,
          paymentMethod,
          items: window.checkoutData.items,
          total: window.checkoutData.total
        };

        try {
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(orderData)
          });

          if (!response.ok) {
            const errorText = await response.text(); // 🎯 Точный ответ от сервера
            console.error("❌ Сервер вернул:", errorText);
            alert("Не удалось оформить заказ");
            return;
          }

          const result = await response.json();
          localStorage.setItem("last-order", JSON.stringify(result.order));
          window.location.href = "order-success.html";
        } catch (err) {
          console.error("❌ Ошибка оформления заказа:", err);
          alert("Не удалось отправить заказ");
        }
      });
    }

  }).catch(err => {
    console.error("❌ Ошибка загрузки товаров:", err);
    productsList.innerHTML = `<li>Ошибка загрузки товаров: ${err.message}</li>`;
  });
});