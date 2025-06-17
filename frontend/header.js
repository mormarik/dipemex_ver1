document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('login-btn');
    const profileBtnContainer = document.getElementById('profile-btn-container');
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileBtnContainer) profileBtnContainer.style.display = 'inline-block';
        if (profileBtn) profileBtn.textContent = user.username || 'Профиль';
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (event) => {
                const isVisible = profileDropdown.style.display === 'block';
                profileDropdown.style.display = isVisible ? 'none' : 'block';
                event.stopPropagation(); 
            });
            document.addEventListener('click', (e) => {
                if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.style.display = 'none';
                }
            });
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.clear(); 
                window.location.href = '/auth.html';
            });
        }
    } else {
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = '/auth.html';
            });
        }
    }
});
