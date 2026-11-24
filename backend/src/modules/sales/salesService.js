import crypto from "node:crypto";
import { AppError } from "../../utils/AppError.js";
import { pool } from "../../config/database.js";
import { consumeSaleProduct } from "../inventory/inventoryService.js";
import {
    findActiveBranchById,
    findActiveUserById,
    findCustomerById,
    findOpenCashShiftById,
    findActiveProductsByIds,
    getNextDocumentSequence,
    createInvoice,
    createInvoiceDetail,
    createSalePayment,
    findInvoicesHistory,
    findInvoiceHeaderById,
    findInvoiceDetailsByInvoiceId,
    findInvoicePaymentsByInvoiceId,
    updateInvoiceStatusToCancelled
} from "./salesDao.js";

function createError(message, statusCode = 400) {
    return new AppError(message, statusCode);
}

// Ejecuta operaciones dentro de una transacción.
async function executeTransaction(callback) {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
        await client.query("BEGIN");
        transactionStarted = true;

        const result = await callback(client);

        await client.query("COMMIT");
        transactionStarted = false;

        return result;

    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Error al ejecutar ROLLBACK:", rollbackError);
            }
        }
        throw error;

    } finally {
        client.release();
    }
}

function validateId(id, fieldName = "ID") {
    const value = Number(id);
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw createError(`${fieldName} no es válido.`);
    }
    return value;
}

// Convierte un precio decimal a centavos enteros.
function toCents(amount) {
    const [whole, decimal = ""] = String(amount).split(".");
    const cents = decimal.padEnd(2, "0").slice(0, 2);
    return BigInt(whole) * 100n + BigInt(cents);
}

// Convierte centavos enteros de vuelta a texto decimal.
function formatCents(cents) {
    const whole = cents / 100n;
    const decimal = String(cents % 100n).padStart(2, "0");
    return `${whole}.${decimal}`;
}

// Registra una venta completa, calcula IVA, genera correlativo y emite comprobante.
export async function registerSaleService({
    customerId = null,
    branchId,
    userId,
    shiftId,
    documentType,
    paymentMethod,
    paymentReference = null,
    items
}) {
    const validBranchId = validateId(branchId, "ID de sucursal");
    const validUserId = validateId(userId, "ID de usuario");
    const validShiftId = validateId(shiftId, "ID de turno de caja");
    const validCustomerId = customerId ? validateId(customerId, "ID de cliente") : null;

    if (!["FINAL_CONSUMER", "CREDIT_TAX"].includes(documentType)) {
        throw createError("El tipo de documento debe ser FINAL_CONSUMER o CREDIT_TAX.");
    }

    if (documentType === "CREDIT_TAX" && !validCustomerId) {
        throw createError("Para Crédito Fiscal (CREDIT_TAX) es obligatorio indicar el cliente.");
    }

    if (!["CASH", "CARD", "BITCOIN", "CHIVO"].includes(paymentMethod)) {
        throw createError("Método de pago no válido (CASH, CARD, BITCOIN o CHIVO).");
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw createError("La venta debe incluir al menos un producto.");
    }

    // Valida cantidades y agrupa productos repetidos en el carrito.
    const groupedItems = new Map();
    for (const item of items) {
        const prodId = validateId(item.productId, "ID de producto");
        const qty = Number(item.quantity);

        if (!Number.isInteger(qty) || qty <= 0) {
            throw createError(`La cantidad del producto ${prodId} debe ser un entero mayor a cero.`);
        }

        groupedItems.set(prodId, (groupedItems.get(prodId) ?? 0) + qty);
    }

    return executeTransaction(async (client) => {
        // Valida sucursal, usuario y cliente.
        const branch = await findActiveBranchById(client, validBranchId);
        if (!branch) throw createError("La sucursal no existe o está inactiva.", 404);

        const user = await findActiveUserById(client, validUserId);
        if (!user) throw createError("El usuario no existe o está inactivo.", 404);

        if (validCustomerId) {
            const customer = await findCustomerById(client, validCustomerId);
            if (!customer) throw createError("El cliente especificado no existe.", 404);
        }

        // Valida que la caja esté abierta (conexión directa con el módulo de Caja).
        const shift = await findOpenCashShiftById(client, validShiftId);
        if (!shift) throw createError("El turno de caja no existe.", 404);
        if (shift.status !== "OPEN") {
            throw createError("La caja está cerrada. No se pueden registrar ventas.", 409);
        }
        if (Number(shift.branch_id) !== validBranchId) {
            throw createError("El turno de caja no pertenece a esta sucursal.", 403);
        }

        // Consulta los productos en BD y calcula subtotales en centavos.
        const productIds = Array.from(groupedItems.keys());
        const dbProducts = await findActiveProductsByIds(client, productIds);

        if (dbProducts.length !== productIds.length) {
            throw createError("Uno o más productos no existen en el catálogo.", 404);
        }

        let subtotalCents = 0n;
        const preparedDetails = [];

        for (const dbProd of dbProducts) {
            if (!dbProd.active) {
                throw createError(`El producto "${dbProd.name}" está inactivo.`, 409);
            }

            const quantity = groupedItems.get(dbProd.product_id);
            const unitPriceCents = toCents(dbProd.price);
            const lineSubtotalCents = unitPriceCents * BigInt(quantity);

            subtotalCents += lineSubtotalCents;

            preparedDetails.push({
                productId: dbProd.product_id,
                productName: dbProd.name,
                quantity,
                unitPrice: formatCents(unitPriceCents),
                subtotal: formatCents(lineSubtotalCents)
            });
        }

        // Calcula el IVA del 13% y el total.
        const vatCents = (subtotalCents * 13n + 50n) / 100n;
        const totalCents = subtotalCents + vatCents;

        const subtotalStr = formatCents(subtotalCents);
        const vatStr = formatCents(vatCents);
        const totalStr = formatCents(totalCents);

        // Genera el siguiente número correlativo y arma los identificadores oficiales DTE (MH El Salvador).
        const sequence = await getNextDocumentSequence(client, validBranchId, documentType);
        if (!sequence) {
            throw createError(
                `No hay una secuencia de correlativos activa para ${documentType} en esta sucursal.`,
                409
            );
        }

        const consecutiveNumber = sequence.last_number;

        // 01 = Factura Consumidor Final | 03 = Comprobante de Crédito Fiscal
        const dteTypeCode = documentType === "CREDIT_TAX" ? "03" : "01";
        const branchCode = `M${String(validBranchId).padStart(3, "0")}P001`; // 8 caracteres (Casa Matriz/Sucursal + Punto de venta)
        const paddedCorrelative = String(consecutiveNumber).padStart(15, "0"); // 15 dígitos

        // Formato oficial de 31 caracteres: DTE-01-M001P001-000000000000001
        const controlNumber = `DTE-${dteTypeCode}-${branchCode}-${paddedCorrelative}`;

        // UUID v4 en MAYÚSCULAS exigido por el esquema JSON de Hacienda
        const generationCode = crypto.randomUUID().toUpperCase();

        // Sello de recepción simulado de 40 caracteres hexadecimales en mayúsculas
        const receptionStamp = crypto.randomBytes(20).toString("hex").toUpperCase();

        // Guarda la factura en la base de datos.
        const invoice = await createInvoice(client, {
            customerId: validCustomerId,
            branchId: validBranchId,
            userId: validUserId,
            documentType,
            consecutiveNumber,
            controlNumber,
            generationCode,
            receptionStamp,
            subtotal: subtotalStr,
            vat: vatStr,
            total: totalStr,
            status: "PAID"
        });

        // Guarda los detalles de productos y el pago.
        const savedDetails = [];
        for (const detail of preparedDetails) {
            const savedItem = await createInvoiceDetail(client, {
                invoiceId: invoice.invoice_id,
                productId: detail.productId,
                quantity: detail.quantity,
                unitPrice: detail.unitPrice,
                subtotal: detail.subtotal
            });
            savedDetails.push({ ...savedItem, productName: detail.productName });
        }

        const payment = await createSalePayment(client, {
            invoiceId: invoice.invoice_id,
            shiftId: validShiftId,
            paymentMethod,
            amount: totalStr,
            reference: paymentReference
        });

        // Descuenta las existencias de los productos vendidos.
        for (const detail of preparedDetails) {
            await consumeSaleProduct(client, {
                branchId: validBranchId,
                productId: detail.productId,
                quantity: detail.quantity,
                userId: validUserId
            });
        }

        // Devuelve el comprobante fiscal completo.
        return {
            invoice,
            details: savedDetails,
            payment
        };
    });
}

// Consulta historial de ventas.
export async function getSalesHistoryService({ limit = 20, offset = 0, branchId } = {}) {
    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        throw createError("El límite debe ser un entero entre 1 y 100.");
    }
    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
        throw createError("El desplazamiento debe ser un entero mayor o igual a cero.");
    }

    const validBranchId = branchId ? validateId(branchId, "ID de sucursal") : null;
    return findInvoicesHistory(parsedLimit, parsedOffset, validBranchId);
}

// Consulta el comprobante fiscal completo de una venta.
export async function getSaleByIdService(invoiceId) {
    const id = validateId(invoiceId, "ID de factura");

    const header = await findInvoiceHeaderById(id);
    if (!header) {
        throw createError("No se encontró el comprobante fiscal solicitado.", 404);
    }

    const [details, payments] = await Promise.all([
        findInvoiceDetailsByInvoiceId(id),
        findInvoicePaymentsByInvoiceId(id)
    ]);

    return {
        ...header,
        details,
        payments
    };
}

