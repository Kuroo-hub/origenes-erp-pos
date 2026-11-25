import { apiGet, apiPost } from './apiClient.js';

export const getActiveCashSessions = async () => apiGet('/cash-flow/sessions/active');

export const getCashSessionHistory = async () => apiGet('/cash-flow/sessions/history');

export const getCashSessionSummary = async (sessionId) =>
  apiGet(`/cash-flow/sessions/${sessionId}/summary`);

export const openCashSession = async (payload) =>
  apiPost('/cash-flow/sessions/open', payload);

export const closeCashSession = async (sessionId, payload) =>
  apiPost(`/cash-flow/sessions/${sessionId}/close`, payload);

export const addCashMovement = async (sessionId, payload) =>
  apiPost(`/cash-flow/sessions/${sessionId}/movements`, payload);
