import { http, setAccessToken, clearAccessToken } from '../lib/httpClient';

export async function login(payload) {
  const { data } = await http.post('/v1/auth/login', payload, { withCredentials: true });
  setAccessToken(data.token);
  return data;
}

export async function register(payload) {
  const { data } = await http.post('/v1/auth/register', payload, { withCredentials: true });
  setAccessToken(data.token);
  return data;
}

export async function fetchProfile() {
  const { data } = await http.get('/v1/auth/me');
  return data.user;
}

export async function logout() {
  await http.post('/v1/auth/logout', {}, { withCredentials: true });
  clearAccessToken();
}
