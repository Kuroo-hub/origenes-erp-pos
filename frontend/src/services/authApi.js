import { apiGet, apiPost } from './apiClient.js';

export function login(email, password) {
  return apiPost('/auth/login', { email, password }, { withAuth: false });
}

export function getMe() {
  return apiGet('/auth/me');
}

export function registerEmployee(payload) {
  return apiPost('/auth/register', payload);
}
