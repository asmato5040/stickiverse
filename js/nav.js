// =============================================
// STICKIVERSE – Navigation (Global)
// Handles: Hamburger menu, auto-active links,
// scroll state, consistent behavior on all pages
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('mainNav');
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');

  // ── 0. Mega-Menü unter "Produkte" (eine Stelle für alle Seiten) ──
  (function buildMegaMenu() {
    const link = document.querySelector('.nav__link[data-nav="products"]');
    if (!link || link.parentElement.classList.contains('nav__item--has-dropdown')) return;
    const shapes = [
      ['rund', 'Runde Sticker', 'Der Klassiker', 'images/Runde Sticker.webp'],
      ['quadrat', 'Quadratisch', 'Klare Linien', 'images/Quadratische Sticker.webp'],
      ['rechteck', 'Rechteckig', 'Mehr Platz für Text', 'images/Rechteck Sticker.webp'],
      ['oval', 'Oval', 'Elegant und einzigartig', 'images/Oval Sticker.webp'],
      ['freigestanzt', 'Freigestanzt', 'Deine eigene Form', 'images/Freigestanzte Sticker.webp'],
      ['transparent', 'Transparent', 'Nur dein Motiv bleibt', 'images/Transparente Sticker.webp'],
    ];
    const item = (tab, title, sub, img) => `
      <a href="products.html?cat=${tab}" class="mega__item" data-shop-tab="${tab}">
        <img data-src="${img}" alt="" width="56" height="56">
        <span><strong>${title}</strong><small>${sub}</small></span>
      </a>`;
    const wrap = document.createElement('div');
    wrap.className = 'nav__item--has-dropdown';
    link.replaceWith(wrap);
    wrap.appendChild(link);
    const panel = document.createElement('div');
    panel.className = 'nav__dropdown nav__dropdown--mega';
    panel.innerHTML = `
      <div class="mega__col">
        <div class="mega__head">Sticker nach Form</div>
        <div class="mega__grid">${shapes.map(s => item(...s)).join('')}</div>
      </div>
      <div class="mega__col mega__col--side">
        <div class="mega__head">Mehr</div>
        ${item('designs', 'Fertige Designs', 'Sofort bestellbar', 'images/slider/gallery-5.webp')}
        <a href="editor.html" class="mega__item mega__item--text"><span><strong>Selbst gestalten</strong><small>Im Editor direkt im Browser</small></span><b>→</b></a>
        <a href="etiketten.html" class="mega__item mega__item--text"><span><strong>Etiketten</strong><small>Für Flaschen und Verpackungen</small></span><b>→</b></a>
      </div>
      <a href="products.html" class="mega__all">Alle Sticker ansehen →</a>`;
    wrap.appendChild(panel);
    // Bilder erst beim ersten Öffnen laden
    let loaded = false;
    const loadImgs = () => { if (loaded) return; loaded = true; panel.querySelectorAll('img[data-src]').forEach(i => { i.src = i.dataset.src; }); };
    wrap.addEventListener('mouseenter', loadImgs); wrap.addEventListener('focusin', loadImgs);
    // Nach Klick kurz schließen, damit das Menü nicht über der Auswahl stehen bleibt
    panel.addEventListener('click', () => {
      wrap.classList.add('mega-closed');
      if (document.activeElement) document.activeElement.blur();
    });
    wrap.addEventListener('mouseleave', () => wrap.classList.remove('mega-closed'));
  })();

  // ── 1. Auto-Active: Mark current page in nav ──
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // Highlight main nav links
  document.querySelectorAll('.nav__link[data-nav]').forEach(link => {
    const navKey = link.getAttribute('data-nav');
    
    let isActive = false;
    if (navKey === 'index' && (currentPath === 'index.html' || currentPath === '')) {
      isActive = true;
    } else if (navKey === 'products' && ['products.html', 'aufkleber.html', 'etiketten.html'].includes(currentPath)) {
      // "Produkte" is active if we are on products, aufkleber, or etiketten
      isActive = true;
    } else if (navKey !== 'index' && navKey !== 'products' && currentPath === navKey + '.html') {
      isActive = true;
    }

    if (isActive) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Highlight mega menu dropdown cards
  document.querySelectorAll('.nav__dropdown-card[data-dropdown-nav]').forEach(card => {
    const navKey = card.getAttribute('data-dropdown-nav');
    if (currentPath === navKey + '.html') {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  // ── 2. Scroll State: Add/remove .scrolled ──
  const isHomePage = (currentPath === 'index.html' || currentPath === '' || currentPath === '/');

  function updateScrollState() {
    if (!nav) return;
    if (!isHomePage) {
      nav.classList.add('scrolled');
      return;
    }
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  // ── 3. Hamburger Menu Toggle & Mobile Dropdown ──
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Handle Mobile Mega Menu Dropdown Toggle
    const productsLink = document.querySelector('.nav__item--has-dropdown > .nav__link');
    if (productsLink) {
      productsLink.addEventListener('click', (e) => {
        // Only prevent default on mobile sizes if they click to open dropdown
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const dropdown = productsLink.nextElementSibling;
          if (dropdown) {
            dropdown.classList.toggle('open');
          }
        }
      });
    }

    // Close menu when a link is clicked (unless it's the products link on mobile)
    navLinks.querySelectorAll('.nav__link, .nav__dropdown-card').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.parentElement.classList.contains('nav__item--has-dropdown') && window.innerWidth <= 768) {
          return; // Handled above
        }
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  }
});

