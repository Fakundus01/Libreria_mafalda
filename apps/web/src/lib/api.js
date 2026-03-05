import { apiBaseUrl } from '../config/site';

function buildHeaders({ auth = false, token, headers = {}, hasJsonBody = false }) {
  const authToken = token || (auth ? localStorage.getItem('mafalda_token') : '');
  return {
    ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...headers,
  };
}

async function apiRequest(path, { method = 'GET', body, auth = false, token, headers = {} } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: buildHeaders({ auth, token, headers, hasJsonBody: body !== undefined && !isFormData }),
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  const raw = await response.text();
  let json = {};

  if (raw) {
    try {
      json = JSON.parse(raw);
    } catch {
      json = {};
    }
  }

  if (!response.ok) {
    throw new Error(json?.error?.message || 'No se pudo completar la solicitud.');
  }

  return json;
}

export function apiGet(path, options = {}) {
  return apiRequest(path, { method: 'GET', ...options });
}

export function apiPost(path, body, options = {}) {
  return apiRequest(path, { method: 'POST', body, ...options });
}

export function apiPut(path, body, options = {}) {
  return apiRequest(path, { method: 'PUT', body, ...options });
}

export function apiPatch(path, body, options = {}) {
  return apiRequest(path, { method: 'PATCH', body, ...options });
}

export function apiDelete(path, options = {}) {
  return apiRequest(path, { method: 'DELETE', ...options });
}
