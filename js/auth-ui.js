// =============================================
// STICKIVERSE – Auth UI Injector & Sync
// Automatically injects the login modal and updates navigation on all pages
// =============================================
console.log("[Auth-Debug] auth-ui.js geladen und wird ausgeführt!");

const AUTH_MODAL_HTML = `
<div class="auth-modal-overlay" id="authModal">
  <div class="auth-modal">
    <button class="auth-modal__close" id="closeAuthModalBtn">✕</button>

    <div class="auth-modal__logo">
      <img src="assets/logo.png" alt="Stickiverse Logo" style="height: 36px; width: auto;">
    </div>

    <h2 class="auth-modal__title" id="authModalTitle">Einloggen</h2>
    <p class="auth-modal__subtitle">Willkommen zurück! Bitte melde dich an.</p>

    <!-- OAuth -->
    <div class="oauth-buttons">
      <button class="oauth-btn" id="googleLoginBtn" data-oauth-google>
        <svg class="oauth-btn__icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Mit Google anmelden
      </button>
      <button class="oauth-btn" id="appleLoginBtn" data-oauth-apple>
        <svg class="oauth-btn__icon" viewBox="0 0 24 24" fill="white">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Mit Apple anmelden
      </button>
    </div>

    <div class="auth-divider">oder</div>

    <!-- Login Form -->
    <form class="auth-form" id="loginForm" style="display:flex;">
      <div class="auth-input-group">
        <label class="auth-label" for="loginEmail">E-Mail</label>
        <input type="email" id="loginEmail" class="auth-input" placeholder="deine@email.de" required>
      </div>
      <div class="auth-input-group">
        <label class="auth-label" for="loginPassword">Passwort</label>
        <input type="password" id="loginPassword" class="auth-input" placeholder="••••••••" required>
        <div class="auth-forgot"><a id="toForgotBtn">Passwort vergessen?</a></div>
      </div>
      <button type="submit" class="auth-submit-btn">Einloggen →</button>
      <div class="auth-footer">
        Noch kein Konto?
        <a id="toRegisterBtn">Jetzt registrieren</a>
      </div>
    </form>

    <!-- Register Form -->
    <form class="auth-form" id="registerForm" style="display:none;">
      <div class="auth-name-row">
        <div class="auth-input-group">
          <label class="auth-label" for="regFirstName">Vorname</label>
          <input type="text" id="regFirstName" class="auth-input" placeholder="Max" required>
        </div>
        <div class="auth-input-group">
          <label class="auth-label" for="regLastName">Nachname</label>
          <input type="text" id="regLastName" class="auth-input" placeholder="Muster" required>
        </div>
      </div>
      <div class="auth-input-group">
        <label class="auth-label" for="regEmail">E-Mail</label>
        <input type="email" id="regEmail" class="auth-input" placeholder="deine@email.de" required>
      </div>
      <div class="auth-input-group">
        <label class="auth-label" for="regPassword">Passwort (min. 6 Zeichen)</label>
        <input type="password" id="regPassword" class="auth-input" placeholder="••••••••" minlength="6" required>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10px;margin-top:4px;">
        <input type="checkbox" id="agb" required style="accent-color:#8B5CF6;width:16px;height:16px;margin-top:2px;flex-shrink:0;">
        <label for="agb" style="font-size:13px;color:rgba(255,255,255,0.5);cursor:pointer;">
          Ich akzeptiere die <a href="#" style="color:#A78BFA;">AGB</a> und
          <a href="#" style="color:#A78BFA;">Datenschutzerklärung</a>
        </label>
      </div>
      <button type="submit" class="auth-submit-btn">Konto erstellen →</button>
      <div class="auth-footer">
        Bereits registriert?
        <a id="toLoginBtn">Einloggen</a>
      </div>
    </form>

    <!-- Forgot Password Form -->
    <form class="auth-form" id="forgotForm" style="display:none;">
      <p style="font-size:14px;color:rgba(255,255,255,0.55);margin-bottom:8px;">
        Gib deine E-Mail ein und wir schicken dir einen Link zum Zurücksetzen deines Passworts.
      </p>
      <div class="auth-input-group">
        <label class="auth-label" for="forgotEmail">E-Mail</label>
        <input type="email" id="forgotEmail" class="auth-input" placeholder="deine@email.de" required>
      </div>
      <button type="submit" class="auth-submit-btn">Reset-Link senden</button>
      <div class="auth-footer">
        <a id="toLoginBtn2">← Zurück zum Login</a>
      </div>
    </form>
  </div>
</div>
`;

// ── Injektion der Elemente ───────────────────
function injectAuthModal() {
  if (document.getElementById('authModal')) return;

  // CSS einfügen
  const style = document.createElement('style');
  style.textContent = `
    .auth-modal-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.75); backdrop-filter: blur(12px);
      z-index: 9000; align-items: center; justify-content: center; padding: 24px;
    }
    .auth-modal-overlay.show { display: flex; }
    .auth-modal {
      background: #0F0F1C; border: 1px solid rgba(139,92,246,0.25);
      border-radius: 28px; padding: 40px; width: 100%; max-width: 440px;
      box-shadow: 0 32px 128px rgba(139,92,246,0.25); position: relative;
    }
    .auth-modal__close {
      position: absolute; top: 16px; right: 16px; width: 32px; height: 32px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; color: rgba(255,255,255,0.5); font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .auth-modal__close:hover { background: rgba(255,255,255,0.1); color: white; }
    .auth-modal__logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
    .auth-modal__logo-icon {
      width: 38px; height: 38px; background: linear-gradient(135deg, #8B5CF6, #EC4899);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-size: 18px; box-shadow: 0 4px 16px rgba(139,92,246,0.4);
    }
    .auth-modal__logo-name {
      font-family: 'Inter', system-ui, sans-serif; font-size: 20px; font-weight: 800;
      background: linear-gradient(135deg, #8B5CF6, #EC4899);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .auth-modal__title { font-family: 'Inter', system-ui, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
    .auth-modal__subtitle { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 28px; }
    .oauth-buttons { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .oauth-btn {
      display: flex; align-items: center; gap: 12px; padding: 12px 18px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; color: white; font-size: 15px; font-weight: 600;
      font-family: 'Inter', system-ui, sans-serif; cursor: pointer; transition: all 0.2s;
    }
    .oauth-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.18); }
    .oauth-btn__icon { width: 22px; height: 22px; flex-shrink: 0; }
    .auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: rgba(255,255,255,0.3); font-size: 13px; }
    .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
    .auth-form { display: flex; flex-direction: column; gap: 14px; }
    .auth-input-group { display: flex; flex-direction: column; gap: 6px; }
    .auth-label { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.6); }
    .auth-input {
      padding: 12px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; color: white; font-size: 15px; outline: none; transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .auth-input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
    .auth-submit-btn {
      width: 100%; padding: 14px; background: linear-gradient(135deg, #8B5CF6, #EC4899);
      border: none; border-radius: 12px; color: white; font-size: 16px; font-weight: 700;
      font-family: 'Inter', system-ui, sans-serif; cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 20px rgba(139,92,246,0.35); margin-top: 4px;
    }
    .auth-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(139,92,246,0.45); }
    .auth-footer { margin-top: 20px; text-align: center; font-size: 14px; color: rgba(255,255,255,0.5); }
    .auth-footer a { color: #A78BFA; font-weight: 600; cursor: pointer; text-decoration: none; }
    .auth-forgot { text-align: right; margin-top: -6px; }
    .auth-forgot a { font-size: 13px; color: rgba(255,255,255,0.45); cursor: pointer; }
    .auth-name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    /* Nav Avatar */
    .nav-user-container {
      position: relative;
      display: inline-block;
      margin-right: 8px;
    }
    .nav-user-btn {
      display: flex; align-items: center; gap: 8px; padding: 6px 14px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 100px; color: white; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; text-decoration: none;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .nav-user-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(139,92,246,0.3); }
    .nav-user-avatar {
      width: 24px; height: 24px; background: linear-gradient(135deg, #8B5CF6, #EC4899);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: white;
    }
    .nav-user-dropdown {
      display: none;
      position: absolute;
      top: 100%; right: 0;
      margin-top: 10px;
      width: 200px;
      background: #0F0F1C;
      border: 1px solid rgba(139,92,246,0.25);
      border-radius: 12px;
      padding: 8px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5);
      z-index: 1000;
    }
    .nav-user-dropdown.show { display: block; }
    .nav-dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      color: rgba(255,255,255,0.7);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .nav-dropdown-item:hover {
      background: rgba(139,92,246,0.12);
      color: #A78BFA;
    }
    .nav-dropdown-divider {
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin: 6px 0;
    }
  `;
  document.head.appendChild(style);

  // Modal in Body einfügen
  const div = document.createElement('div');
  div.innerHTML = AUTH_MODAL_HTML;
  document.body.appendChild(div.firstElementChild);

  // Event Listeners für Switching
  document.getElementById('closeAuthModalBtn')?.addEventListener('click', closeAuthModal);
  document.getElementById('toRegisterBtn')?.addEventListener('click', () => setAuthMode('register'));
  document.getElementById('toForgotBtn')?.addEventListener('click', () => setAuthMode('forgot'));
  document.getElementById('toLoginBtn')?.addEventListener('click', () => setAuthMode('login'));
  document.getElementById('toLoginBtn2')?.addEventListener('click', () => setAuthMode('login'));
}

// ── Nav Bar anpassen ─────────────────────────
function updateNavigationBar(user) {
  const actionsContainer = document.querySelector('.nav__actions');
  if (!actionsContainer) return;

  // Vorherige Auth-Buttons entfernen
  const oldLogin = actionsContainer.querySelector('.nav-login-trigger');
  const oldUser = actionsContainer.querySelector('.nav-user-container');
  if (oldLogin) oldLogin.remove();
  if (oldUser) oldUser.remove();

  if (user) {
    // Eingeloggt -> Zeige Avatar + Dropdown
    const name = user.user_metadata?.first_name || user.email?.split('@')[0] || 'A';
    const avatarChar = name[0].toUpperCase();

    const container = document.createElement('div');
    container.className = 'nav-user-container';

    const userBtn = document.createElement('button');
    userBtn.className = 'nav-user-btn';
    userBtn.innerHTML = `
      <div class="nav-user-avatar">${avatarChar}</div>
      <span>${name}</span>
    `;

    const dropdown = document.createElement('div');
    dropdown.className = 'nav-user-dropdown';
    
    // Admin Link Check
    const isAdminLink = window.location.pathname.includes('/admin/') ? '../admin/index.html' : 'admin/index.html';
    const accountLink = window.location.pathname.includes('/admin/') ? '../account.html' : 'account.html';

    dropdown.innerHTML = `
      <a href="${accountLink}" class="nav-dropdown-item">👤 Mein Konto</a>
      <div id="adminDropdownLinkPlaceholder"></div>
      <div class="nav-dropdown-divider"></div>
      <button class="nav-dropdown-item" id="navLogoutBtn" style="color:#ef4444;">🚪 Abmelden</button>
    `;

    container.appendChild(userBtn);
    container.appendChild(dropdown);

    // Click handler to toggle dropdown
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    // Close on click outside
    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });

    // Logout click
    dropdown.querySelector('#navLogoutBtn').addEventListener('click', async () => {
      await signOut();
      window.location.reload();
    });

    // Async Check Admin to insert dashboard link
    (async () => {
      try {
        const profile = await getProfile();
        if (profile?.is_admin) {
          const placeholder = dropdown.querySelector('#adminDropdownLinkPlaceholder');
          if (placeholder) {
            placeholder.outerHTML = `<a href="${isAdminLink}" class="nav-dropdown-item" style="color:#A78BFA;">🛠️ Admin Bereich</a>`;
          }
        }
      } catch (err) {
        console.error(err);
      }
    })();

    // Vor dem Warenkorb einfügen
    const cartBtn = actionsContainer.querySelector('.nav__cart-btn') || actionsContainer.querySelector('#cartBtn');
    if (cartBtn) {
      actionsContainer.insertBefore(container, cartBtn);
    } else {
      actionsContainer.appendChild(container);
    }
  } else {
    // Ausgeloggt -> Zeige Login-Button
    const loginBtn = document.createElement('button');
    loginBtn.className = 'btn btn--ghost btn--sm nav-login-trigger';
    loginBtn.style.marginRight = '8px';
    loginBtn.textContent = 'Anmelden';
    loginBtn.onclick = () => openAuthModal('login');

    const cartBtn = actionsContainer.querySelector('.nav__cart-btn') || actionsContainer.querySelector('#cartBtn');
    if (cartBtn) {
      actionsContainer.insertBefore(loginBtn, cartBtn);
    } else {
      actionsContainer.appendChild(loginBtn);
    }
  }

  // Global: Hide/Show specific elements based on login state
  document.querySelectorAll('.require-login').forEach(el => {
    el.style.display = user ? '' : 'none';
  });
}

// ── Scripts dynamisch laden ─────────────────
function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

async function initAllAuthUI() {
  injectAuthModal();
  injectCookieBanner();
  updateFooterLinks();

  // Setup form event listeners
  if (typeof setupAuthForms === 'function') {
    setupAuthForms();
  }

  // Supabase auf Auth-Änderungen überwachen
  if (typeof db !== 'undefined') {
    db.auth.onAuthStateChange((event, session) => {
      updateNavigationBar(session?.user || null);
    });

    const { data: { session } } = await db.auth.getSession();
    updateNavigationBar(session?.user || null);
  }
}

// ── Cookie Banner ───────────────────────────
function injectCookieBanner() {
  if (localStorage.getItem('stickiverse-cookie-consent')) return;

  const style = document.createElement('style');
  style.textContent = `
    .cookie-banner {
      position: fixed;
      bottom: 24px;
      left: 24px;
      right: 24px;
      max-width: 440px;
      background: rgba(15, 15, 28, 0.96);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 20px 80px rgba(0, 0, 0, 0.6);
      z-index: 10000;
      animation: cookieSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: 'Inter', system-ui, sans-serif;
      color: #fff;
    }
    
    @media (min-width: 768px) {
      .cookie-banner {
        left: auto;
        right: 24px;
      }
    }

    .cookie-banner__title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #A78BFA;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cookie-banner__text {
      font-size: 13px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.75);
      margin-bottom: 20px;
    }

    .cookie-banner__text a {
      color: #A78BFA;
      text-decoration: underline;
    }

    .cookie-banner__actions {
      display: flex;
      gap: 12px;
    }

    .cookie-btn {
      flex: 1;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      border: none;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .cookie-btn--primary {
      background: linear-gradient(135deg, #8B5CF6, #EC4899);
      color: white;
    }
    .cookie-btn--primary:hover {
      box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
      transform: translateY(-1px);
    }

    .cookie-btn--secondary {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .cookie-btn--secondary:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    @keyframes cookieSlideUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  
  const pathPrefix = window.location.pathname.includes('/admin/') ? '../' : '';
  const dsLink = `${pathPrefix}datenschutz.html`;

  banner.innerHTML = `
    <div class="cookie-banner__title">🍪 Cookie-Einstellungen</div>
    <div class="cookie-banner__text">
      Wir verwenden Cookies, um dir ein optimales Einkaufserlebnis zu bieten. Dazu zählen funktionale Cookies für das Login (Supabase) und den Warenkorb sowie sicherheitsrelevante Cookies der Zahlungsabwicklung (Stripe). Details findest du in unserer <a href="${dsLink}">Datenschutzerklärung</a>.
    </div>
    <div class="cookie-banner__actions">
      <button class="cookie-btn cookie-btn--secondary" id="cookieRejectBtn">Nur notwendige</button>
      <button class="cookie-btn cookie-btn--primary" id="cookieAcceptBtn">Alle akzeptieren</button>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('cookieAcceptBtn').addEventListener('click', () => {
    localStorage.setItem('stickiverse-cookie-consent', 'all');
    banner.remove();
  });

  document.getElementById('cookieRejectBtn').addEventListener('click', () => {
    localStorage.setItem('stickiverse-cookie-consent', 'necessary');
    banner.remove();
  });
}

// ── Footer-Links dynamisch korrigieren ──────
function updateFooterLinks() {
  const pathPrefix = window.location.pathname.includes('/admin/') ? '../' : '';
  
  document.querySelectorAll('.footer__link').forEach(el => {
    const text = el.textContent.trim().toLowerCase();
    if (text.includes('impressum')) {
      el.href = `${pathPrefix}impressum.html`;
    }
    if (text.includes('datenschutz')) {
      el.href = `${pathPrefix}datenschutz.html`;
    }
    if (text.includes('faq') || text.includes('über uns')) {
      el.textContent = 'FAQ / Hilfe';
      el.href = `${pathPrefix}faq.html`;
    }
  });
}

// ── Scripts dynamisch laden ─────────────────
function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

// Start
async function startAuthUI() {
  // Falls Supabase noch nicht geladen ist (z.B. kein CDN auf der Seite)
  if (typeof supabase === 'undefined') {
    await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
  }
  if (typeof db === 'undefined') {
    await loadScript('js/config.js');
  }
  if (typeof initAuth === 'undefined') {
    await loadScript('js/auth.js');
  }

  initAllAuthUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAuthUI);
} else {
  startAuthUI();
}
