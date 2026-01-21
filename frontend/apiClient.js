import { AuthAPI } from './auth';

function getAccessToken() {
  return localStorage.getItem('access_token');
}

function setAccessToken(accessToken) {
  if (accessToken) localStorage.setItem('access_token', accessToken);
}

export async function fetchWithAuth(input, init = {}) {
  const url = input.startsWith('http') ? input : input;
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', 'Bearer ' + token);
  const res = await fetch(url, { ...init, headers });
  if (res.status !== 401) return res;

  try {
    const { accessToken } = await AuthAPI.refresh();
    setAccessToken(accessToken);
    headers.set('Authorization', 'Bearer ' + accessToken);
    const retry = await fetch(url, { ...init, headers });
    return retry;
  } catch (err) {
    localStorage.removeItem('access_token');
    return res;
  }
}
