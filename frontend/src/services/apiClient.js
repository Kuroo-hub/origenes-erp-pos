export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    withAuth = true,
  } = options;

  const token = localStorage.getItem('token');
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  let response;
  let data = {};

  try {
    response = await fetch(`${API_BASE_URL}${path}`, config);
    data = await response.json().catch(() => ({}));
  } catch (error) {
    throw new ApiError('No se pudo conectar con el servidor.', 0, { cause: error.message });
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    throw new ApiError(
      data.message || `Error HTTP ${response.status}: ${response.statusText}`,
      response.status,
      data
    );
  }

  return data;
}

export const apiGet = (path, options = {}) => apiRequest(path, { ...options, method: 'GET' });

export const apiPost = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: 'POST', body });

export const apiPatch = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: 'PATCH', body });

export const apiPut = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: 'PUT', body });

export const apiDelete = (path, options = {}) => apiRequest(path, { ...options, method: 'DELETE' });
