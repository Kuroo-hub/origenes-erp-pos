const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const request = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Error HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`[OwnerAPI Error] ${endpoint}:`, error.message);
    throw error;
  }
};

/**
 * Obtiene el resumen ejecutivo, métricas por sucursal y cuentas por pagar.
 */
export const getOwnerDashboard = async (branchId = 'ALL') => {
  const query = branchId !== 'ALL' ? `?branchId=${branchId}` : '';
  return await request(`/reports/dashboard${query}`, { method: 'GET' });
};