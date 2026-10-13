
(() => {
  const root = document.documentElement;
  const body = document.body;
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const themeIcon = document.querySelector('[data-theme-icon]');
  const openBtns = document.querySelectorAll('[data-menu-open]');
  const closeBtns = document.querySelectorAll('[data-menu-close]');
  const setTheme = (theme, persist=true) => {
    root.dataset.theme = theme;
    if (persist) { try { localStorage.setItem('lumekori-theme', theme); } catch(e){} }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#07080c' : '#f6f7f9';
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀' : '☾';
    if (themeBtn) themeBtn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  };
  setTheme(root.dataset.theme || 'dark', false);
  if (themeBtn) themeBtn.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  const openMenu = () => body.classList.add('menu-open');
  const closeMenu = () => body.classList.remove('menu-open');
  openBtns.forEach(b => b.addEventListener('click', openMenu));
  closeBtns.forEach(b => b.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.querySelectorAll('.drawer a').forEach(a => a.addEventListener('click', closeMenu));
})();
