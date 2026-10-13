(() => {
  const body = document.body;
  const root = document.documentElement;
  const open = document.querySelector('[data-menu]');
  const close = document.querySelector('[data-overlay]');

  if (open) open.addEventListener('click', () => body.classList.toggle('nav-open'));
  if (close) close.addEventListener('click', () => body.classList.remove('nav-open'));
  document.querySelectorAll('.sidebar a').forEach(a => a.addEventListener('click', () => body.classList.remove('nav-open')));

  const isSpanish = (root.lang || '').toLowerCase().startsWith('es');
  const text = isSpanish
    ? { title: 'Tema', light: 'Modo claro', dark: 'Modo oscuro', currentLight: 'Claro', currentDark: 'Oscuro', aria: 'Cambiar tema' }
    : { title: 'Theme', light: 'Light mode', dark: 'Dark mode', currentLight: 'Light', currentDark: 'Dark', aria: 'Switch theme' };

  const getTheme = () => root.dataset.theme || 'dark';
  const setTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem('lumekori-theme', theme); } catch (_) {}
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f6f3' : '#08090d');
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const target = theme === 'dark' ? 'light' : 'dark';
      const icon = btn.querySelector('[data-theme-icon]');
      const label = btn.querySelector('[data-theme-label]');
      const hint = btn.querySelector('[data-theme-hint]');
      if (icon) icon.textContent = target === 'light' ? '☀' : '☾';
      if (label) label.textContent = target === 'light' ? text.light : text.dark;
      if (hint) hint.textContent = theme === 'light' ? text.currentLight : text.currentDark;
      btn.setAttribute('aria-label', `${text.aria}: ${target === 'light' ? text.light : text.dark}`);
      btn.setAttribute('title', target === 'light' ? text.light : text.dark);
    });
  };

  const sidebarLang = document.querySelector('.sidebar .lang-wrap');
  if (sidebarLang) {
    const wrap = document.createElement('div');
    wrap.className = 'theme-wrap';
    wrap.innerHTML = `
      <div class="nav-title">${text.title}</div>
      <button class="theme-toggle" data-theme-toggle type="button">
        <span class="theme-left"><span class="theme-icon" data-theme-icon aria-hidden="true"></span><span class="theme-label" data-theme-label></span></span>
        <span class="theme-hint" data-theme-hint></span>
      </button>`;
    sidebarLang.insertAdjacentElement('afterend', wrap);
  }

  const mobileActions = document.querySelector('.mobile-actions');
  if (mobileActions) {
    const btn = document.createElement('button');
    btn.className = 'mobile-theme-toggle';
    btn.type = 'button';
    btn.setAttribute('data-theme-toggle', '');
    btn.innerHTML = '<span data-theme-icon aria-hidden="true"></span>';
    const menu = mobileActions.querySelector('[data-menu]');
    if (menu) mobileActions.insertBefore(btn, menu); else mobileActions.appendChild(btn);
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
  });

  setTheme(getTheme(), false);
})();
