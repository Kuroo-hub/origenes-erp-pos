import { apiGet } from './apiClient.js';

export const getOwnerDashboard = async (branchId = 'ALL') => {
  const query = branchId !== 'ALL' ? `?branchId=${branchId}` : '';
  return apiGet(`/reports/dashboard${query}`);
};
