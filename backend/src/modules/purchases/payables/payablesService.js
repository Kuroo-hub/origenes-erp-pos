import { createError } from "../../../utils/errors.js";
import { formatCents, toCents } from "../../../utils/money.js";
import { withTransaction } from "../../../utils/transaction.js";
import { validatePositiveInteger } from "../../../utils/validation.js";
import {
    findPayableForUpdate,
    insertSupplierPayment,
    updatePayableAfterPayment,
    updatePurchaseStatus,
    findPurchaseStatusById
} from "./payablesDao.js";

export function validatePayableId(value) {
    return validatePositiveInteger(value, "ID de cuenta por pagar");
}

export function validatePaymentAmount(value) {
    const amount = String(value ?? "");

    if (!/^\d{1,10}(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
        throw createError("El monto del pago debe ser mayor a cero con hasta 2 decimales.");
    }

    return amount;
}

export function validatePaymentMethod(value) {
    if (typeof value !== "string") {
        throw createError("El método de pago debe ser CASH, TRANSFER o CHECK.");
    }

    const paymentMethod = value.trim().toUpperCase();
    if (!["CASH", "TRANSFER", "CHECK"].includes(paymentMethod)) {
        throw createError("El método de pago debe ser CASH, TRANSFER o CHECK.");
    }

    return paymentMethod;
}

export function validatePaymentReference(value) {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value !== "string") {
        throw createError("La referencia del pago no es válida.");
    }

    const reference = value.trim();
    if (reference.length > 150) {
        throw createError("La referencia no puede superar 150 caracteres.");
    }

    return reference === "" ? null : reference;
}

export function normalizePaymentPayload(body) {
    const source = body && typeof body === "object" ? body : {};

    return {
        amount: source.amount,
        paymentMethod: source.payment_method ?? source.paymentMethod,
        reference: source.reference
    };
}

export async function registerPaymentService(payableIdOrPayload, paymentPayload = {}, user = {}) {
    const payload =
        payableIdOrPayload !== null && typeof payableIdOrPayload === "object"
            ? payableIdOrPayload
            : { ...paymentPayload, payableId: payableIdOrPayload };

    const payableId = validatePayableId(payload.payableId ?? payload.payable_id);
    const normalized = normalizePaymentPayload(payload);
    const amount = validatePaymentAmount(normalized.amount);
    const paymentMethod = validatePaymentMethod(normalized.paymentMethod);
    const reference = validatePaymentReference(normalized.reference);
    const amountCents = toCents(amount);

    return withTransaction(async (client) => {
        const payable = await findPayableForUpdate(client, payableId);

        if (!payable) {
            throw createError("La cuenta por pagar no existe.", 404);
        }

        if (user?.role !== "ADMINISTRATOR" && Number(payable.branch_id) !== Number(user?.branchId)) {
            throw createError("No tiene permisos para acceder a otra sucursal.", 403);
        }

        const outstandingCents = toCents(payable.outstanding_amount);
        if (payable.status === "PAID" || outstandingCents <= 0n) {
            throw createError("La cuenta ya está liquidada.", 409);
        }

        if (amountCents > outstandingCents) {
            throw createError(
                `El monto supera el saldo pendiente de ${formatCents(outstandingCents)}.`,
                409
            );
        }

        const remainingCents = outstandingCents - amountCents;
        const remainingAmount = formatCents(remainingCents);
        const payableStatus = remainingCents === 0n ? "PAID" : "PARTIAL";

        const payment = await insertSupplierPayment(client, {
            payableId,
            amount,
            paymentMethod,
            reference
        });

        const updatedPayable = await updatePayableAfterPayment(client, {
            payableId,
            remainingAmount,
            status: payableStatus
        });

        if (remainingCents === 0n) {
            await updatePurchaseStatus(client, payable.purchase_id, "PAID");
        }

        const purchase = await findPurchaseStatusById(client, payable.purchase_id);

        return {
            payable_id: updatedPayable.payable_id,
            payment_id: payment.payment_id,
            amount: payment.amount,
            remaining_amount: updatedPayable.outstanding_amount,
            status: updatedPayable.status,
            purchase_status: purchase?.status ?? "PENDING"
        };
    });
}
