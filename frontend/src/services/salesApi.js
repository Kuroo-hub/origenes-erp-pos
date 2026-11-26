import { apiGet, apiPost, apiPatch } from './apiClient.js';

export const registerSale = async (payload) => apiPost('/sales', payload);

export const getSales = async (branchId, params = {}) => {
  const search = new URLSearchParams({ branchId, ...params });
  return apiGet(`/sales?${search.toString()}`);
};

export const updateKitchenStatus = async (invoiceId, kitchenStatus) =>
  apiPatch(`/orders/${invoiceId}/kitchen-status`, {
    kitchen_status: kitchenStatus
  });