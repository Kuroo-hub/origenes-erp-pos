import { apiGet, apiPost } from './apiClient.js';

export function login(email, password) {
  return apiPost('/auth/login', { email, password });
}

export function getMe() {
  return apiGet('/auth/me');
}

export function logout() {
  return apiPost('/auth/logout');
}

export function registerEmployee(payload) {
  return apiPost('/auth/register', payload);
}