import { apiBaseUrl } from '../config/site';

export async function apiGet(path) {
  const res = await fetch(`${apiBaseUrl}${path}`);
  return res.json();
}

export async function apiPost(path, body, headers = {}) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Request failed');
  }
  return json;
}

export async function apiPatch(path, body, token) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Request failed');
  return json;
}
