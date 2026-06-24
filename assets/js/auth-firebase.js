/**
 * D! STORE — auth-firebase.js
 * Firebase Auth guard for admin & owner panel.
 * Replaces the old sessionStorage-based auth.js.
 */

let _authRole = null;
let _authUnsubscribe = null;

/**
 * Guard a dashboard page.
 * Shows login screen if not authenticated or wrong role.
 * @param {'admin'|'owner'} requiredRole
 * @param {Function} onAuthenticated - called once user is verified
 */
function guardDashboard(requiredRole, onAuthenticated) {
  const loginScreen = document.getElementById('loginScreen');
  const dashScreen  = document.getElementById('dashScreen');

  function showLogin(msg = '') {
    loginScreen.style.display = 'flex';
    dashScreen.style.display  = 'none';
    if (msg) dstoreToast(msg, 'error');
  }

  function showDash() {
    loginScreen.style.display = 'none';
    dashScreen.style.display  = 'flex';
    if (onAuthenticated) onAuthenticated();
  }

  _authUnsubscribe = auth.onAuthStateChanged(async user => {
    if (!user) { showLogin(); return; }
    try {
      const role = await FireAuth.getUserRole(user.uid);
      _authRole = role;
      if (role === requiredRole || role === 'superadmin') {
        showDash();
      } else {
        await auth.signOut();
        showLogin('Akun ini tidak memiliki akses ke panel ini.');
      }
    } catch (e) {
      console.error('Auth guard error:', e);
      showLogin('Terjadi kesalahan autentikasi.');
    }
  });
}

/**
 * Handle login form submit.
 */
async function handleDashboardLogin(formId, requiredRole, onSuccess) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"], input[id*="email"], input[id*="Email"]');
    const passInput  = form.querySelector('input[type="password"]');
    const submitBtn  = form.querySelector('button[type="submit"]');

    if (!emailInput || !passInput) return;

    const email    = emailInput.value.trim();
    const password = passInput.value;

    if (!email || !password) { dstoreToast('Email dan password wajib diisi', 'error'); return; }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Masuk...';

    try {
      const { user, role } = await FireAuth.loginWithEmail(email, password);
      if (role !== requiredRole && role !== 'superadmin') {
        await auth.signOut();
        dstoreToast('Akun ini tidak memiliki akses ke panel ini.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk';
        return;
      }
      dstoreToast('Login berhasil!', 'success');
      if (onSuccess) onSuccess(user);
    } catch (err) {
      let msg = 'Login gagal. Coba lagi.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Email atau password salah.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan. Coba beberapa menit lagi.';
      }
      dstoreToast(msg, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk';
    }
  });
}

/**
 * Logout and redirect to home.
 */
async function dashboardLogout(redirectUrl = '../index.html') {
  const ok = await dstoreConfirm({ title: 'Keluar dari panel?', confirmText: 'Ya, Keluar' });
  if (!ok) return;
  if (_authUnsubscribe) _authUnsubscribe();
  await FireAuth.logout();
  window.location.href = redirectUrl;
}

window.guardDashboard    = guardDashboard;
window.handleDashboardLogin = handleDashboardLogin;
window.dashboardLogout   = dashboardLogout;
