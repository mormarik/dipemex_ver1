document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    const profileBtnContainer = document.getElementById("profile-btn-container");
    const profileBtn = document.getElementById("profile-btn");
    const profileDropdown = document.getElementById("profile-dropdown");
    const logoutBtn = document.getElementById("logout-btn");
    const profileLink = document.getElementById("profile-link");
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && profileBtnContainer) {
        profileBtnContainer.style.display = "block";
        if (loginBtn) loginBtn.style.display = "none";
    }
    if (profileBtn) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (profileDropdown) {
                profileDropdown.style.display =
                    profileDropdown.style.display === "block" ? "none" : "block";
            }
        });
    }
    document.addEventListener("click", (e) => {
        if (
            profileDropdown &&
            !profileDropdown.contains(e.target) &&
            !profileBtn.contains(e.target)
        ) {
            profileDropdown.style.display = "none";
        }
    });
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

    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const usernameInput = document.getElementById("register-username");
            const emailInput = document.getElementById("register-email");
            const passwordInput = document.getElementById("register-password");

            if (!usernameInput || !emailInput || !passwordInput) {
                console.error("Одно из обязательных полей не найдено.");
                showMessage('Ошибка на форме. Попробуйте перезагрузить страницу.', 'error');
                return;
            }

            const data = {
                username: usernameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value
            };

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showMessage('Регистрация прошла успешно! Пожалуйста, войдите.', 'success');
                    setTimeout(() => toggleForms('login'), 2000);
                } else {
                    showMessage(result.message || 'Ошибка регистрации.', 'error');
                }
            } catch (error) {
                console.error('Ошибка регистрации:', error);
                showMessage('Произошла ошибка при регистрации. Попробуйте снова.', 'error');
            }
        });
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            const data = { email, password };

            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem("user", JSON.stringify(data.user));
                        window.location.href = "/profile.html";
                    } else {
                        showMessage('Неправильный email или пароль. Попробуйте еще раз.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Ошибка входа:', error);
                    showMessage('Произошла ошибка при входе. Попробуйте снова.', 'error');
                });
        });
    }

    function showMessage(message, type) {
        const messageContainer = document.getElementById("message-container");
        if (messageContainer) {
            messageContainer.style.display = 'block';
            messageContainer.textContent = message;
            messageContainer.style.backgroundColor = type === 'error' ? '#f8d7da' : '#d4edda';
            messageContainer.style.color = type === 'error' ? '#721c24' : '#155724';
        }
    }

    window.toggleForms = function (formType) {
        const registerFormContainer = document.getElementById("register-form");
        const loginFormContainer = document.getElementById("login-form");
        const resetFormContainer = document.getElementById("reset-form");

        if (formType === 'login') {
            if (registerFormContainer) registerFormContainer.style.display = 'none';
            if (resetFormContainer) resetFormContainer.style.display = 'none';
            if (loginFormContainer) loginFormContainer.style.display = 'block';
        } else if (formType === 'register') {
            if (loginFormContainer) loginFormContainer.style.display = 'none';
            if (resetFormContainer) resetFormContainer.style.display = 'none';
            if (registerFormContainer) registerFormContainer.style.display = 'block';
        } else if (formType === 'reset') {
            if (loginFormContainer) loginFormContainer.style.display = 'none';
            if (registerFormContainer) registerFormContainer.style.display = 'none';
            if (resetFormContainer) resetFormContainer.style.display = 'block';
        }
    };
});




