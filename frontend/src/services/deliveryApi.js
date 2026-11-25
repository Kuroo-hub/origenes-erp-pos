import { apiGet, apiPatch } from './apiClient.js';

export const getDeliveryOrders = async (branchId) =>
  apiGet(`/orders/delivery?branchId=${branchId}`);

export const updateDeliveryStatus = async (orderId, payload) =>
  apiPatch(`/orders/${orderId}/delivery-status`, payload);
