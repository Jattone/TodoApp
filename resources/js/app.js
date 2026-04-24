import './bootstrap';
import './task';
import './list';


document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle-btn') || document.getElementById('theme-toggle-btn-guest');;
    const themeIcon = document.getElementById('theme-icon') || document.getElementById('theme-icon-guest');
    const themeText = document.getElementById('theme-text');
    const body = document.body;

    const updateThemeUI = (isDark) => {
        if (isDark) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeIcon.style.color = '#fadb14'; 
            if (themeText) themeText.innerText = 'Light Mode';
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeIcon.style.color = 'inherit'; 
            if (themeText) themeText.innerText = 'Dark Mode';
        }
    };

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (isDark) {
        body.classList.add('dark-theme');
        updateThemeUI(isDark);
    } else {
        body.classList.remove('dark-theme');
    }
    updateThemeUI(isDark);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const nowDark = body.classList.toggle('dark-theme');
            localStorage.setItem('theme', nowDark ? 'dark' : 'light');
            updateThemeUI(nowDark);

            if (navigator.vibrate) navigator.vibrate(10);
        });
    }

    if (!window.isAuthenticated) {
    setTimeout(() => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'info',
            title: 'Want to save your tasks and share it with friends? Log in via Telegram!'
        });
    }, 30000);
}
});