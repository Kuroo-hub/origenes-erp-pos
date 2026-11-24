const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/orders';

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
    console.error(`[DeliveryAPI Error] ${endpoint}:`, error.message);
    throw error;
  }
};

/**
 * Obtiene los pedidos asignados para entrega a domicilio de una sucursal.
 */
export const getDeliveryOrders = async (branchId) => {
  return await request(`/delivery?branchId=${branchId}`, { method: 'GET' });
};

/**
 * Actualiza el estado de entrega de un pedido (READY, IN_TRANSIT, DELIVERED).
 */
export const updateDeliveryStatus = async (orderId, payload) => {
  return await request(`/${orderId}/delivery-status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};