// =============================================
// STICKIVERSE – Auth Logic (Login, Register, OAuth)
// =============================================
console.log("[Auth-Debug] auth.js geladen und wird ausgeführt!");

// ── Session & User State ─────────────────────
let currentUser = null;
let currentSession = null;

async function initAuth() {
  const { data: { session } } = await db.auth.getSession();
  currentSession = session;
  currentUser = session?.user || null;
  window.currentUser = currentUser;
  window.currentSession = currentSession;
  updateAuthUI();

  // Auf Auth-Änderungen hören (Login, Logout, Token-Refresh)
  db.auth.onAuthStateChange((event, session) => {
    currentSession = session;
    currentUser = session?.user || null;
    window.currentUser = currentUser;
    window.currentSession = currentSession;
    updateAuthUI();

    if (event === 'SIGNED_IN') {
      closeAuthModal();
      showToast('Erfolgreich eingeloggt! 👋', 'success');
    }
    if (event === 'SIGNED_OUT') {
      showToast('Erfolgreich ausgeloggt.', 'info');
      // Wenn auf Account-Seite, zur Startseite
      if (window.location.pathname.includes('account')) {
        window.location.href = '/index.html';
      }
    }
  });
}

// ── Auth UI aktualisieren ─────────────────────
function updateAuthUI() {
  const loginBtns = document.querySelectorAll('[data-auth-login]');
  const logoutBtns = document.querySelectorAll('[data-auth-logout]');
  const accountLinks = document.querySelectorAll('[data-auth-account]');
  const userNames = document.querySelectorAll('[data-auth-username]');

  if (currentUser) {
    loginBtns.forEach(el => el.style.display = 'none');
    logoutBtns.forEach(el => el.style.display = 'flex');
    accountLinks.forEach(el => el.style.display = 'flex');
    const name = currentUser.user_metadata?.first_name
      || currentUser.email?.split('@')[0]
      || 'Konto';
    userNames.forEach(el => el.textContent = name);
  } else {
    loginBtns.forEach(el => el.style.display = 'flex');
    logoutBtns.forEach(el => el.style.display = 'none');
    accountLinks.forEach(el => el.style.display = 'none');
  }
}

// ── E-Mail / Passwort Login ───────────────────
async function signInWithEmail(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ── E-Mail / Passwort Registrierung ──────────
async function signUpWithEmail(email, password, firstName, lastName) {
  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName }
    }
  });
  if (error) throw error;
  return data;
}

// ── Google Login ──────────────────────────────
async function signInWithGoogle() {
  const { error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/index.html',
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  });
  if (error) throw error;
}

// ── Apple Login ───────────────────────────────
async function signInWithApple() {
  const { error } = await db.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: window.location.origin + '/index.html' }
  });
  if (error) throw error;
}

// ── Passwort vergessen ────────────────────────
async function sendPasswordReset(email) {
  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/auth.html?mode=reset'
  });
  if (error) throw error;
}

// ── Ausloggen ─────────────────────────────────
async function signOut() {
  const { error } = await db.auth.signOut();
  if (error) console.error('Logout error:', error);
}

// ── Profil laden ──────────────────────────────
async function getProfile() {
  const { data: { session } } = await db.auth.getSession();
  const user = session?.user;
  if (!user) return null;
  const { data, error } = await db.from('profiles').select('*').eq('id', user.id).single();
  if (error) console.error('Profile error:', error);
  return data;
}

// ── Profil aktualisieren ──────────────────────
async function updateProfile(updates) {
  const { data: { session } } = await db.auth.getSession();
  const user = session?.user;
  if (!user) return null;
  const { data, error } = await db.from('profiles').update(updates).eq('id', user.id);
  if (error) throw error;
  return data;
}

// ── Meine Bestellungen laden ──────────────────
async function getMyOrders() {
  const { data: { session } } = await db.auth.getSession();
  const user = session?.user;
  if (!user) return [];
  const { data, error } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) { console.error('Orders error:', error); return []; }
  return data || [];
}

// ── Is Admin? ─────────────────────────────────
async function isAdmin() {
  const profile = await getProfile();
  return profile?.is_admin === true;
}

// ── Auth Modal öffnen/schließen ───────────────
function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('show');
  setAuthMode(mode);
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

function setAuthMode(mode) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');
  const modalTitle = document.getElementById('authModalTitle');

  [loginForm, registerForm, forgotForm].forEach(f => f && (f.style.display = 'none'));

  if (mode === 'login') {
    if (loginForm) loginForm.style.display = 'flex';
    if (modalTitle) modalTitle.textContent = 'Einloggen';
  } else if (mode === 'register') {
    if (registerForm) registerForm.style.display = 'flex';
    if (modalTitle) modalTitle.textContent = 'Registrieren';
  } else if (mode === 'forgot') {
    if (forgotForm) forgotForm.style.display = 'flex';
    if (modalTitle) modalTitle.textContent = 'Passwort vergessen';
  }
}

// ── Auth initialisieren ───────────────────────
function initAuthSystem() {
  initAuth();

  // Auth Modal Buttons
  document.querySelectorAll('[data-open-login]').forEach(btn => {
    btn.addEventListener('click', () => openAuthModal('login'));
  });
  document.querySelectorAll('[data-open-register]').forEach(btn => {
    btn.addEventListener('click', () => openAuthModal('register'));
  });
  document.querySelectorAll('[data-auth-logout]').forEach(btn => {
    btn.addEventListener('click', signOut);
  });

  // Modal schließen bei Klick auf Hintergrund
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAuthModal();
    });
  }

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAuthModal();
  });

  setupAuthForms();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthSystem);
} else {
  initAuthSystem();
}

function setupAuthForms() {
  console.log("🔑 [Auth-Debug] setupAuthForms wird ausgeführt.");

  // Login Form
  const loginForm = document.getElementById('loginForm');
  console.log("🔑 [Auth-Debug] Login-Formular gefunden:", !!loginForm);
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log("🔑 [Auth-Debug] Login-Formular gesendet.");
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const btn = loginForm.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Einloggen...';
      try {
        const data = await signInWithEmail(email, password);
        console.log("🔑 [Auth-Debug] Login erfolgreich:", data);
      } catch (err) {
        console.error("🔑 [Auth-Debug] Login fehlgeschlagen:", err);
        showToast(getAuthError(err.message), 'error');
        btn.disabled = false;
        btn.textContent = 'Einloggen';
      }
    });
  }

  // Register Form
  const registerForm = document.getElementById('registerForm');
  console.log("🔑 [Auth-Debug] Registrierungs-Formular gefunden:", !!registerForm);
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log("🔑 [Auth-Debug] Registrierungs-Formular gesendet.");
      const firstName = document.getElementById('regFirstName').value;
      const lastName  = document.getElementById('regLastName').value;
      const email     = document.getElementById('regEmail').value;
      const password  = document.getElementById('regPassword').value;
      const btn = registerForm.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Registrieren...';
      try {
        console.log("🔑 [Auth-Debug] Starte signUp mit:", email, firstName, lastName);
        const data = await signUpWithEmail(email, password, firstName, lastName);
        console.log("🔑 [Auth-Debug] Registrierung erfolgreich Rückgabe:", data);
        showToast('Konto erfolgreich erstellt! 🎉', 'success');
        setAuthMode('login');
      } catch (err) {
        console.error("🔑 [Auth-Debug] Registrierung fehlgeschlagen:", err);
        showToast(getAuthError(err.message), 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Registrieren';
      }
    });
  }

  // Forgot Form
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value;
      try {
        await sendPasswordReset(email);
        showToast('Reset-Link gesendet! Prüfe deine E-Mails. 📧', 'success');
        setAuthMode('login');
      } catch (err) {
        showToast(getAuthError(err.message), 'error');
      }
    });
  }

  // Google / Apple buttons
  const googleBtn = document.querySelector('[data-oauth-google]');
  const appleBtn = document.querySelector('[data-oauth-apple]');
  console.log("🔑 [Auth-Debug] Google-Button gefunden:", !!googleBtn);
  console.log("🔑 [Auth-Debug] Apple-Button gefunden:", !!appleBtn);

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      console.log("🔑 [Auth-Debug] Google Login Klick.");
      try { await signInWithGoogle(); }
      catch (err) { console.error(err); showToast('Google Login fehlgeschlagen.', 'error'); }
    });
  }

  if (appleBtn) {
    appleBtn.addEventListener('click', async () => {
      console.log("🔑 [Auth-Debug] Apple Login Klick.");
      try { await signInWithApple(); }
      catch (err) { console.error(err); showToast('Apple Login fehlgeschlagen.', 'error'); }
    });
  }
}

// ── Fehlermeldungen auf Deutsch ───────────────
function getAuthError(msg) {
  if (msg.includes('Invalid login credentials')) return 'E-Mail oder Passwort falsch.';
  if (msg.includes('Email not confirmed'))       return 'Bitte bestätige zuerst deine E-Mail.';
  if (msg.includes('already registered'))        return 'Diese E-Mail ist bereits registriert.';
  if (msg.includes('Password should be'))        return 'Passwort muss mindestens 6 Zeichen haben.';
  if (msg.includes('Unable to validate'))        return 'Ungültige E-Mail-Adresse.';
  return 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
}
