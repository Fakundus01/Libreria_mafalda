import { apiBaseUrl } from '../config/site';

function getAuthHeaders() {
  const token = localStorage.getItem('mafalda_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(path, withAuth = false) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    headers: withAuth ? getAuthHeaders() : {},
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'No se pudo cargar. Intentá nuevamente.');
  return json;
}

export async function apiPost(path, body, headers = {}) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...headers },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'No se pudo procesar la solicitud.');
  }
  return json;
}

export async function apiPatch(path, body, token) {
  const authHeader = token ? { Authorization: `Bearer ${token}` } : getAuthHeaders();
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'No se pudo actualizar. Intentá nuevamente.');
  return json;
}
