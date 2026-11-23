const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/inventory';

/**
 * Helper genérico para peticiones HTTP REST con manejo de errores y Promesas.
 */
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
    console.error(`[InventoryAPI Error] ${endpoint}:`, error.message);
    throw error;
  }
};

/**
 * Obtiene el inventario actual y alertas de stock mínimo de una sucursal.
 */
export const getBranchInventory = async (branchId) => {
  return await request(`/branch/${branchId}`, { method: 'GET' });
};

/**
 * Registra un ajuste manual de stock (merma, conteo físico, etc.).
 */
export const createInventoryAdjustment = async (payload) => {
  return await request('/adjustments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Obtiene el listado de compras y cuentas por pagar de la sucursal.
 */
export const getBranchPurchases = async (branchId) => {
  return await request(`/purchases?branchId=${branchId}`, { method: 'GET' });
};

/**
 * Registra una nueva factura de compra a proveedor (suma stock y crea cuenta por pagar).
 */
export const createSupplierPurchase = async (purchaseData) => {
  return await request('/purchases', {
    method: 'POST',
    body: JSON.stringify(purchaseData),
  });
};

/**
 * Registra un abono o pago total a una cuenta por pagar de proveedor.
 */
export const registerSupplierPayment = async (payableId, paymentData) => {
  return await request(`/payables/${payableId}/payments`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

/**
 * Obtiene la bitácora de movimientos de inventario (IN, OUT, CONSUMPTION, ADJUSTMENT).
 */
export const getInventoryMovements = async (branchId) => {
  return await request(`/movements?branchId=${branchId}`, { method: 'GET' });
};