import { createError } from "../../../utils/errors.js";
import { parseBranchFilter } from "../../../utils/validation.js";
import {
    findDeliveryOrders,
    findDeliveryInvoiceForUpdate,
    updateDeliveryStatus,
    findKitchenInvoiceForUpdate,
    updateKitchenStatus
} from "./ordersDao.js";

export const DELIVERY_STATUSES = ["READY", "IN_TRANSIT", "DELIVERED"];

export const DELIVERY_TRANSITIONS = {
    READY: ["IN_TRANSIT"],
    IN_TRANSIT: ["DELIVERED"]
};

export const KITCHEN_STATUSES = ["PENDING", "PREPARING", "READY"];

export const KITCHEN_TRANSITIONS = {
    PENDING: ["PREPARING"],
    PREPARING: ["READY"]
};

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function parseDeliveryBranchFilter(value) {
    return parseBranchFilter(value);
}

export function parseOrderId(value) {
    if (typeof value !== "string" && typeof value !== "number") {
        throw createError("ID de orden no válido.");
    }

    const text = String(value).trim();
    const match = /^ORD-(\d+)$/.exec(text) ?? /^(\d+)$/.exec(text);

    if (!match) {
        throw createError("ID de orden no válido.");
    }

    const parsed = Number(match[1]);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw createError("ID de orden no válido.");
    }

    return parsed;
}

export function validateDeliveryStatus(value) {
    if (!DELIVERY_STATUSES.includes(value)) {
        throw createError("Estado de entrega no válido (READY, IN_TRANSIT o DELIVERED).");
    }
    return value;
}

export function validateDeliveryTransition(currentStatus, nextStatus) {
    const allowed = DELIVERY_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(nextStatus)) {
        throw createError("Transición de entrega no permitida.", 409);
    }
    return nextStatus;
}

export function validateKitchenStatus(value) {
    if (!KITCHEN_STATUSES.includes(value)) {
        throw createError("Estado de cocina no válido (PENDING, PREPARING o READY).");
    }
    return value;
}

export function validateKitchenTransition(currentStatus, nextStatus) {
    const allowed = KITCHEN_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(nextStatus)) {
        throw createError("Transición de cocina no permitida.", 409);
    }
    return nextStatus;
}

export function derivePaymentStatus(deliveryStatus, paymentMethod) {
    if (deliveryStatus === "DELIVERED") {
        return "COLLECTED";
    }
    if (paymentMethod === "CASH") {
        return "PENDING_COLLECTION";
    }
    return "PAID_ONLINE";
}

export function mapDeliveryOrder(row) {
    const invoiceId = Number(row.invoice_id);

    return {
        order_id: `ORD-${invoiceId}`,
        invoice_id: invoiceId,
        branch_id: Number(row.branch_id),
        customer_name: row.customer_name,
        customer_phone: row.customer_phone ?? null,
        origen: row.origen,
        delivery_address: row.delivery_address ?? null,
        address_reference: row.address_reference ?? null,
        items: Array.isArray(row.items) ? row.items : [],
        total_amount: toNumber(row.total_amount),
        payment_method: row.payment_method,
        payment_status: derivePaymentStatus(row.delivery_status, row.payment_method),
        delivery_status: row.delivery_status,
        created_at: row.created_at,
        fromCashier: false
    };
}

export function mapDeliveryStatusUpdate(row) {
    const invoiceId = Number(row.invoice_id);

    return {
        order_id: `ORD-${invoiceId}`,
        invoice_id: invoiceId,
        branch_id: Number(row.branch_id),
        delivery_status: row.delivery_status,
        payment_status: derivePaymentStatus(row.delivery_status, row.payment_method)
    };
}

export async function getDeliveryOrdersService({ branchId } = {}) {
    const parsedBranchId = parseDeliveryBranchFilter(branchId);
    const rows = await findDeliveryOrders(parsedBranchId);

    return rows.map(mapDeliveryOrder);
}

export async function updateDeliveryStatusService(orderId, body = {}, user = null) {
    const invoiceId = parseOrderId(orderId);
    const nextStatus = validateDeliveryStatus(body?.delivery_status);

    const invoice = await findDeliveryInvoiceForUpdate(invoiceId);
    if (!invoice) {
        throw createError("No se encontró la orden de entrega.", 404);
    }

    if (user?.role !== "ADMINISTRATOR" && Number(invoice.branch_id) !== Number(user?.branchId)) {
        throw createError("No tiene permisos para acceder a otra sucursal.", 403);
    }

    validateDeliveryTransition(invoice.delivery_status, nextStatus);

    const updated = await updateDeliveryStatus(
        invoiceId,
        invoice.delivery_status,
        nextStatus
    );
    if (!updated) {
        throw createError("No se encontró la orden de entrega o cambió su estado.", 409);
    }

    return mapDeliveryStatusUpdate(updated);
}

export async function updateKitchenStatusService(invoiceId, body = {}, user = null) {
    const parsedInvoiceId = parseOrderId(invoiceId);
    const nextStatus = validateKitchenStatus(body?.kitchen_status ?? body?.kitchenStatus);

    const invoice = await findKitchenInvoiceForUpdate(parsedInvoiceId);
    if (!invoice) {
        throw createError("No se encontró la orden de cocina.", 404);
    }

    if (invoice.status === "CANCELLED") {
        throw createError("No se puede actualizar el estado de cocina de una factura cancelada.", 409);
    }

    if (user?.role !== "ADMINISTRATOR" && Number(invoice.branch_id) !== Number(user?.branchId)) {
        throw createError("No tiene permisos para acceder a otra sucursal.", 403);
    }

    validateKitchenTransition(invoice.kitchen_status, nextStatus);

    const updated = await updateKitchenStatus(
        parsedInvoiceId,
        invoice.kitchen_status,
        nextStatus
    );
    if (!updated) {
        throw createError("No se encontró la orden de cocina o cambió su estado.", 409);
    }

    return {
        invoice_id: Number(updated.invoice_id),
        branch_id: Number(updated.branch_id),
        kitchen_status: updated.kitchen_status,
        status: updated.status
    };
}
