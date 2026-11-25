import { createError } from "../../../utils/errors.js";
import { formatCents, toScaledBigInt } from "../../../utils/money.js";
import { withTransaction } from "../../../utils/transaction.js";
import { validatePositiveInteger } from "../../../utils/validation.js";
import { increaseStock, insertInventoryMovement } from "../../inventory/inventoryDao.js";
import { insertSupplierPayment } from "../payables/payablesDao.js";
import {
    findPurchasesByBranch,
    verifyActiveBranch,
    findSupplierById,
    findIngredientsByIds,
    findPurchaseByBranchAndInvoice,
    insertPurchase,
    insertPurchaseDetail,
    insertAccountsPayable
} from "./purchasesDao.js";

export function validateBranchId(value) {
    return validatePositiveInteger(value, "ID de sucursal");
}

export function validateSupplierId(value) {
    return validatePositiveInteger(value, "ID de proveedor");
}

export function validateIngredientId(value) {
    return validatePositiveInteger(value, "ID de ingrediente");
}

export function validateEmployeeId(value) {
    return validatePositiveInteger(value, "ID de empleado");
}

export function validateInvoiceNumber(value) {
    if (typeof value !== "string") {
        throw createError("El número de factura no es válido.");
    }

    const invoiceNumber = value.trim();
    if (invoiceNumber.length < 1 || invoiceNumber.length > 50) {
        throw createError("El número de factura debe tener entre 1 y 50 caracteres.");
    }

    return invoiceNumber;
}

export function validatePurchaseStatus(value) {
    if (typeof value !== "string") {
        throw createError("El estado de la compra debe ser PENDING o PAID.");
    }

    const status = value.trim().toUpperCase();
    if (!["PENDING", "PAID"].includes(status)) {
        throw createError("El estado de la compra debe ser PENDING o PAID.");
    }

    return status;
}

export function validateDueDate(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (typeof value !== "string") {
        throw createError("La fecha de vencimiento no es válida.");
    }

    const dueDate = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        throw createError("La fecha de vencimiento debe tener el formato YYYY-MM-DD.");
    }

    const date = new Date(`${dueDate}T00:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dueDate) {
        throw createError("La fecha de vencimiento no es válida.");
    }

    return dueDate;
}

export function validateQuantity(value) {
    const quantity = String(value ?? "");

    if (!/^\d{1,9}(\.\d{1,3})?$/.test(quantity) || Number(quantity) <= 0) {
        throw createError("La cantidad debe ser mayor a cero con hasta 3 decimales.");
    }

    return quantity;
}

export function validateUnitCost(value) {
    const unitCost = String(value ?? "");

    if (!/^\d{1,8}(\.\d{1,4})?$/.test(unitCost) || !Number.isFinite(Number(unitCost))) {
        throw createError("El costo unitario no es válido.");
    }

    return unitCost;
}

export function validatePurchaseDetails(details) {
    if (!Array.isArray(details) || details.length === 0) {
        throw createError("La compra debe incluir al menos un ingrediente.");
    }

    return details.map((detail) => {
        if (!detail || typeof detail !== "object") {
            throw createError("Los detalles de la compra no son válidos.");
        }

        return {
            ingredientId: validateIngredientId(detail.ingredient_id ?? detail.ingredientId),
            quantity: validateQuantity(detail.quantity),
            unitCost: validateUnitCost(detail.unit_cost ?? detail.unitCost)
        };
    });
}

export function normalizePurchasePayload(body) {
    const source = body && typeof body === "object" ? body : {};

    return {
        supplierId: source.supplier_id ?? source.supplierId,
        branchId: source.branch_id ?? source.branchId,
        invoiceNumber: source.invoice_number ?? source.invoiceNumber,
        dueDate: source.due_date ?? source.dueDate,
        status: source.status,
        paymentMethod: source.payment_method ?? source.paymentMethod ?? "CASH",
        details: source.details
    };
}

export function calculatePurchaseTotals(details) {
    let subtotalCents = 0n;

    const lines = details.map((detail) => {
        const q3 = toScaledBigInt(detail.quantity, 3);
        const c4 = toScaledBigInt(detail.unitCost, 4);
        const lineCents = (q3 * c4 + 50000n) / 100000n;
        subtotalCents += lineCents;

        return {
            ...detail,
            q3,
            c4,
            lineCents,
            subtotal: formatCents(lineCents)
        };
    });

    const vatCents = (subtotalCents * 13n + 50n) / 100n;
    const totalCents = subtotalCents + vatCents;

    return {
        lines,
        subtotalCents,
        vatCents,
        totalCents,
        subtotal: formatCents(subtotalCents),
        vat: formatCents(vatCents),
        total: formatCents(totalCents)
    };
}

export async function listPurchasesService({ branchId } = {}) {
    const validBranchId = validateBranchId(branchId);
    return findPurchasesByBranch(validBranchId);
}

export async function createPurchaseService(input = {}, authenticatedEmployeeId = null) {
    const payload = normalizePurchasePayload(input);
    const supplierId = validateSupplierId(payload.supplierId);
    const branchId = validateBranchId(payload.branchId);
    const employeeId = validateEmployeeId(input.employeeId ?? authenticatedEmployeeId);
    const invoiceNumber = validateInvoiceNumber(payload.invoiceNumber);
    const status = validatePurchaseStatus(payload.status);
    const dueDate = validateDueDate(payload.dueDate);
    const details = validatePurchaseDetails(payload.details);
    const totals = calculatePurchaseTotals(details);

    const rawPaymentMethod = payload.paymentMethod;
    const paymentMethod =
        rawPaymentMethod === null || rawPaymentMethod === undefined || String(rawPaymentMethod).trim() === ""
            ? "CASH"
            : String(rawPaymentMethod).trim().toUpperCase();

    return withTransaction(async (client) => {
        const branchActive = await verifyActiveBranch(client, branchId);
        if (!branchActive) {
            throw createError("La sucursal no existe o está inactiva.", 404);
        }

        const supplier = await findSupplierById(client, supplierId);
        if (!supplier) {
            throw createError("El proveedor no existe.", 404);
        }
        if (!supplier.active) {
            throw createError("El proveedor está inactivo.", 409);
        }

        const ingredientIds = [...new Set(details.map((detail) => detail.ingredientId))];
        const ingredients = await findIngredientsByIds(client, ingredientIds);
        if (ingredients.length !== ingredientIds.length) {
            throw createError("Uno o más ingredientes no existen.", 404);
        }

        const duplicate = await findPurchaseByBranchAndInvoice(client, branchId, invoiceNumber);
        if (duplicate) {
            throw createError("Ya existe una compra con ese número de factura en la sucursal.", 409);
        }

        const purchase = await insertPurchase(client, {
            supplierId,
            branchId,
            employeeId,
            invoiceNumber,
            subtotal: totals.subtotal,
            vat: totals.vat,
            total: totals.total,
            status
        });

        const savedDetails = [];
        const stockMovements = [];

        for (const line of totals.lines) {
            const savedDetail = await insertPurchaseDetail(client, {
                purchaseId: purchase.purchase_id,
                ingredientId: line.ingredientId,
                quantity: line.quantity,
                unitCost: line.unitCost,
                subtotal: line.subtotal
            });
            savedDetails.push(savedDetail);

            await increaseStock(client, branchId, line.ingredientId, line.quantity);

            const movement = await insertInventoryMovement(
                client,
                branchId,
                line.ingredientId,
                line.quantity,
                `Compra ${invoiceNumber}`,
                employeeId
            );
            stockMovements.push(movement);
        }

        const payableStatus = status === "PAID" ? "PAID" : "PENDING";
        const outstandingAmount = status === "PAID" ? "0.00" : totals.total;
        const effectiveDueDate = status === "PAID" ? null : dueDate;

        const payable = await insertAccountsPayable(client, {
            purchaseId: purchase.purchase_id,
            outstandingAmount,
            dueDate: effectiveDueDate,
            status: payableStatus
        });

        if (status === "PAID") {
            await insertSupplierPayment(client, {
                payableId: payable.payable_id,
                amount: totals.total,
                paymentMethod,
                reference: invoiceNumber
            });
        }

        return {
            purchase_id: purchase.purchase_id,
            payable_id: payable.payable_id,
            branch_id: branchId,
            supplier_id: supplierId,
            supplier_name: supplier.name,
            invoice_number: invoiceNumber,
            purchase_date: purchase.purchase_date,
            subtotal: totals.subtotal,
            vat: totals.vat,
            total: totals.total,
            outstanding_amount: payable.outstanding_amount,
            status: payable.status,
            purchase_status: status,
            due_date: payable.due_date,
            items_count: savedDetails.length,
            details: savedDetails,
            stock_movements: stockMovements
        };
    });
}
