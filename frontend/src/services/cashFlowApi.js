import { apiGet, apiPost } from './apiClient.js';

export const getActiveCashSessions = async (branchId) => apiGet(`/cash-flow/sessions/active?branchId=${branchId}`);

export const openCashSession = async (payload) =>
  apiPost('/cash-flow/sessions/open', payload);

export const closeCashSession = async (sessionId, payload) =>
  apiPost(`/cash-flow/sessions/${sessionId}/close`, payload);
