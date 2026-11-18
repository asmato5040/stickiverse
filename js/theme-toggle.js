// ============================================
// STICKIVERSE – Theme Toggle (Dark / Light)
// ============================================

(function() {
  'use strict';

  // Create the toggle bar
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  // Umschalter direkt im Menü (Sonne/Mond). Fallback: schwebende Leiste, z. B. im Editor.
  function createNavToggle() {
    const actions = document.querySelector('.nav__actions');
    if (!actions || document.querySelector('.nav__theme-btn')) return false;
    const btn = document.createElement('button');
    btn.className = 'nav__theme-btn';
    btn.type = 'button';
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(cur === 'dark' ? 'light' : 'dark');
    });
    actions.insertBefore(btn, actions.firstChild);
    updateActiveButton();
    return true;
  }

  function createToggleBar() {
    if (createNavToggle()) return;
    // Don't add to editor page (it has its own light layout)
    if (document.querySelector('.editor-layout')) return;

    const bar = document.createElement('div');
    bar.className = 'theme-toggle-bar';
    bar.innerHTML = `
      <button class="theme-toggle-btn" data-theme-set="dark" title="Dark Mode" aria-label="Dark Mode">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
      <button class="theme-toggle-btn" data-theme-set="light" title="Light Mode" aria-label="Light Mode">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </button>
    `;
    document.body.appendChild(bar);

    // Event listeners
    bar.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.themeSet;
        setTheme(theme);
      });
    });

    // Set initial active state
    updateActiveButton();
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stickiverse-theme', theme);
    updateActiveButton();
  }

  function updateActiveButton() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeSet === current);
    });
    const nb = document.querySelector('.nav__theme-btn');
    if (nb) {
      // zeigt, wohin man wechselt
      nb.innerHTML = current === 'dark' ? SUN : MOON;
      const label = current === 'dark' ? 'Helles Design einschalten' : 'Dunkles Design einschalten';
      nb.setAttribute('aria-label', label);
      nb.title = label;
    }
  }

  // Apply saved theme immediately (before DOM loads to prevent flash)
  function applySavedTheme() {
    const saved = localStorage.getItem('stickiverse-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }

  // Run immediately
  applySavedTheme();

  // Create toggle bar when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createToggleBar);
  } else {
    createToggleBar();
  }
})();
