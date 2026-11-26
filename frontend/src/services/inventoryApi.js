import { apiGet, apiPost } from './apiClient.js';

export const getBranchInventory = async (branchId) =>
  apiGet(`/inventory/branches/${branchId}/stock`);

export const getBranchStockAlerts = async (branchId) =>
  apiGet(`/inventory/branches/${branchId}/alerts`);

export const createInventoryAdjustment = async (payload) => {
  const branchId = Number(payload.branch_id ?? payload.branchId);
  const ingredientId = Number(payload.ingredient_id ?? payload.ingredientId);
  const rawType = String(payload.movement_type ?? payload.movementType ?? '').toUpperCase();
  const rawQty = Number(payload.quantity ?? payload.amount ?? 0);

  if (!branchId || !ingredientId) {
    throw new Error('El ajuste requiere una sucursal y un ingrediente válidos.');
  }

  if (!rawQty || Number.isNaN(rawQty)) {
    throw new Error('La cantidad del ajuste debe ser distinta de cero.');
  }

  // Normalizar dirección del movimiento ('IN' para entradas, 'OUT' para salidas/mermas)
  let direction = null;
  if (['IN', 'ADD', 'ENTRADA', 'INCREMENT'].includes(rawType)) {
    direction = 'IN';
  } else if (['OUT', 'SUBTRACT', 'REMOVE', 'SALIDA', 'MERMA', 'DECREMENT'].includes(rawType)) {
    direction = 'OUT';
  } else if (rawType === 'ADJUSTMENT' || rawType === 'AJUSTE') {
    direction = rawQty >= 0 ? 'IN' : 'OUT';
  }

  const quantity = Math.abs(rawQty);
  const reason = (payload.reason ?? payload.notes ?? 'Ajuste manual de inventario').trim();

  const body = {
    ingredientId,
    ingredient_id: ingredientId,
    quantity,
    reason,
  };

  if (direction === 'IN') {
    return apiPost(`/inventory/branches/${branchId}/movements`, body);
  }

  if (direction === 'OUT') {
    return apiPost(`/inventory/branches/${branchId}/movements/out`, body);
  }

  throw new Error(`Tipo de movimiento no soportado: ${rawType || 'vacío'}`);
};

export const getBranchPurchases = async (branchId) =>
  apiGet(`/purchases?branchId=${branchId}`);

export const createSupplierPurchase = async (purchaseData) =>
  apiPost('/purchases', purchaseData);

export const registerSupplierPayment = async (payableId, paymentData) =>
  apiPost(`/payables/${payableId}/payments`, paymentData);

export const getInventoryMovements = async (branchId) =>
  apiGet(`/inventory/branches/${branchId}/movements`);

export const getSuppliers = async () => apiGet('/inventory/suppliers');