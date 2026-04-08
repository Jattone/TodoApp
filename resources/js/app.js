import './bootstrap';
import './task';
import './list';


document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const body = document.body;

    const updateThemeUI = (isDark) => {
        if (isDark) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            themeText.innerText = 'Light Mode';
            themeIcon.style.color = '#fadb14'; 
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            themeText.innerText = 'Dark Mode';
            themeIcon.style.color = 'inherit'; 
        }
    };

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark-theme');
        updateThemeUI(true);
    }

    themeToggleBtn.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeUI(isDark);
        
        if (navigator.vibrate) navigator.vibrate(10);
    });
});