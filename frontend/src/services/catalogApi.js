import { apiGet, apiPost } from './apiClient.js';

export const getBranches = async () => apiGet('/inventory/branches');

export const getProducts = async () => apiGet('/inventory/products');

export const getCashRegisters = async (branchId) =>
  apiGet(`/cash-flow/registers?branchId=${branchId}`);
