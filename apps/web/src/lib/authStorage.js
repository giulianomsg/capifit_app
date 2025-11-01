const ACCESS_TOKEN_KEY = 'capifit.access_token';
const USER_KEY = 'capifit.user';

export function persistSession({ token, user }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function loadSession() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  return {
    token: token ?? null,
    user: userRaw ? JSON.parse(userRaw) : null,
  };
}
