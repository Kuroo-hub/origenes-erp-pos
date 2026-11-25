import { apiGet, apiPost } from './apiClient.js';

export const getBranchInventory = async (branchId) =>
  apiGet(`/inventory/branches/${branchId}/stock`);

export const getBranchStockAlerts = async (branchId) =>
  apiGet(`/inventory/branches/${branchId}/alerts`);

export const createInventoryAdjustment = async (payload) => {
  const branchId = payload.branch_id ?? payload.branchId;
  const ingredientId = payload.ingredient_id ?? payload.ingredientId;
  const movementType = payload.movement_type ?? payload.movementType;
  const body = {
    ingredientId,
    quantity: payload.quantity,
    reason: payload.reason,
  };

  if (!branchId || !ingredientId) {
    throw new Error('El ajuste requiere sucursal e ingrediente.');
  }

  if (movementType === 'IN') {
    return apiPost(`/inventory/branches/${branchId}/movements`, body);
  }

  if (movementType === 'OUT') {
    return apiPost(`/inventory/branches/${branchId}/movements/out`, body);
  }

  throw new Error('Tipo de movimiento no soportado.');
};

export const getBranchPurchases = async (branchId) =>
  apiGet(`/purchases?branchId=${branchId}`);

export const createSupplierPurchase = async (purchaseData) =>
  apiPost('/purchases', purchaseData);

export const registerSupplierPayment = async (payableId, paymentData) =>
  apiPost(`/payables/${payableId}/payments`, paymentData);

export const getInventoryMovements = async (branchId) =>
  apiGet(`/inventory/branches/${branchId}/movements`);
