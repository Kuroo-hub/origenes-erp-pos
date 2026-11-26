import { apiGet, apiPatch, apiPost } from './apiClient.js';

export const registerSale = async (payload) => apiPost('/sales', payload);

export const getSales = async (branchId, params = {}) => {
  const search = new URLSearchParams({ branchId, ...params });
  return apiGet(`/sales?${search.toString()}`);
};

export const updateKitchenStatus = async (invoiceId, payloadOrStatus) => {
  const payload =
    typeof payloadOrStatus === 'string'
      ? { kitchen_status: payloadOrStatus }
      : payloadOrStatus;
  return apiPatch(`/orders/${invoiceId}/kitchen-status`, payload);
};
