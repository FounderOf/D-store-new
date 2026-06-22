/**
 * D! STORE — auth.js
 * Simple client-side session gate for admin/ and owner-panel/.
 * NOTE: This is a frontend-only demo auth (per project spec: no backend,
 * data persists via localStorage). For production, replace with real
 * server-side authentication.
 */

const DSTORE_CREDENTIALS = {
  admin: { username: 'admin', password: 'admin123' },
  owner: { username: 'owner', password: 'owner123' }
};

function dstoreCheckSession(role) {
  const key = role === 'owner' ? DSTORE_KEYS.OWNER_SESSION : DSTORE_KEYS.ADMIN_SESSION;
  return sessionStorage.getItem(key) === 'authenticated';
}

function dstoreLogin(role, username, password) {
  const creds = DSTORE_CREDENTIALS[role];
  if (username === creds.username && password === creds.password) {
    const key = role === 'owner' ? DSTORE_KEYS.OWNER_SESSION : DSTORE_KEYS.ADMIN_SESSION;
    sessionStorage.setItem(key, 'authenticated');
    return true;
  }
  return false;
}

function dstoreLogout(role) {
  const key = role === 'owner' ? DSTORE_KEYS.OWNER_SESSION : DSTORE_KEYS.ADMIN_SESSION;
  sessionStorage.removeItem(key);
  window.location.href = 'index.html';
}

function dstoreGuardPage(role) {
  if (!dstoreCheckSession(role)) {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashScreen').style.display = 'none';
  } else {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashScreen').style.display = 'flex';
  }
}

window.dstoreCheckSession = dstoreCheckSession;
window.dstoreLogin = dstoreLogin;
window.dstoreLogout = dstoreLogout;
window.dstoreGuardPage = dstoreGuardPage;
