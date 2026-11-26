import crypto from "node:crypto";
import { createError } from "../../../utils/errors.js";
import { formatCents, toCents } from "../../../utils/money.js";
import { withTransaction } from "../../../utils/transaction.js";
import { parseBranchFilter, validateId } from "../../../utils/validation.js";
import { consumeSaleProduct } from "../../inventory/inventoryService.js";
import {
    findActiveBranchById,
    findActiveEmployeeById,
    findCustomerById,
    findOpenCashShiftById,
    findActiveProductsByIds,
    getNextDocumentSequence,
    createCustomer,
    createInvoice,
    createInvoiceDetail,
    createSalePayment,
    findInvoicesHistory,
    findInvoiceHeaderById,
    findInvoiceDetailsByInvoiceId,
    findInvoicePaymentsByInvoiceId,
    updateInvoiceStatusToCancelled
} from "./salesDao.js";

// Registra una venta completa, calcula IVA, genera correlativo y emite comprobante.
export async function registerSaleService({
    customerId = null,
    customerData = null,
    branchId,
    employeeId,
    shiftId,
    documentType,
    paymentMethod,
    paymentReference = null,
    isDelivery = false,
    deliveryStatus = null,
    deliveryAddress = null,
    deliveryPhone = null,
    items
}) {
    const validBranchId = validateId(branchId, "ID de sucursal");
    const validEmployeeId = validateId(employeeId, "ID de empleado");
    const validShiftId = validateId(shiftId, "ID de turno de caja");
    let validCustomerId = customerId ? validateId(customerId, "ID de cliente") : null;

    if (!["FINAL_CONSUMER", "CREDIT_TAX"].includes(documentType)) {
        throw createError("El tipo de documento debe ser FINAL_CONSUMER o CREDIT_TAX.");
    }

    const normalizedCustomerData =
        customerData && typeof customerData === "object"
            ? {
                fullName: String(customerData.fullName ?? customerData.full_name ?? "").trim(),
                taxId: String(customerData.taxId ?? customerData.tax_id ?? "").trim() || null,
                registrationNumber:
                    String(
                        customerData.registrationNumber ??
                        customerData.registration_number ??
                        ""
                    ).trim() || null,
                businessName:
                    String(customerData.businessName ?? customerData.business_name ?? "").trim() ||
                    null,
                economicActivity:
                    String(
                        customerData.economicActivity ?? customerData.economic_activity ?? ""
                    ).trim() || null,
                taxAddress:
                    String(customerData.taxAddress ?? customerData.tax_address ?? "").trim() ||
                    null
            }
            : null;

    if (!validCustomerId) {
        const nombreCliente = normalizedCustomerData?.fullName ?? "";
        if (!nombreCliente) {
            throw createError("El nombre del cliente es obligatorio para emitir la factura.");
        }
        if (
            nombreCliente.length < 3 ||
            !/^[\p{L}][\p{L}\p{M}\s.'-]*$/u.test(nombreCliente)
        ) {
            throw createError("El nombre del cliente no es válido.");
        }
    }

    if (documentType === "CREDIT_TAX" && !validCustomerId) {
        if (!normalizedCustomerData?.fullName || !normalizedCustomerData.taxId) {
            throw createError(
                "Para Crédito Fiscal (CREDIT_TAX) es obligatorio el nombre y NIT del cliente."
            );
        }
    }

    const normalizedIsDelivery = isDelivery === true || isDelivery === "true";
    const normalizedDeliveryStatus = normalizedIsDelivery
        ? deliveryStatus ?? "READY"
        : null;
    const normalizedDeliveryAddress = String(deliveryAddress ?? "").trim() || null;
    const normalizedDeliveryPhone = String(deliveryPhone ?? "").trim() || null;

    if (normalizedIsDelivery) {
        if (!normalizedDeliveryAddress || normalizedDeliveryAddress.length < 5) {
            throw createError("La dirección de entrega es obligatoria y debe ser válida para entregas a domicilio.");
        }

        const digitosTelefono = String(normalizedDeliveryPhone ?? "").replace(/\D/g, "");
        if (
            !normalizedDeliveryPhone ||
            !/^[+()\d\s-]+$/.test(normalizedDeliveryPhone) ||
            digitosTelefono.length < 7 ||
            digitosTelefono.length > 15
        ) {
            throw createError("El teléfono de entrega es obligatorio y debe ser válido.");
        }

        if (!["READY", "IN_TRANSIT", "DELIVERED"].includes(normalizedDeliveryStatus)) {
            throw createError("El estado de entrega no es válido.");
        }
    }

    if (!["CASH", "CARD", "BITCOIN", "CHIVO"].includes(paymentMethod)) {
        throw createError("Método de pago no válido (CASH, CARD, BITCOIN o CHIVO).");
    }

    const normalizedPaymentReference = String(paymentReference ?? "").trim() || null;
    if (paymentMethod !== "CASH" && !normalizedPaymentReference) {
        throw createError("La referencia del pago es obligatoria para este método de pago.");
    }
    if (normalizedPaymentReference && normalizedPaymentReference.length < 3) {
        throw createError("La referencia del pago debe tener al menos 3 caracteres.");
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

    return withTransaction(async (client) => {
        // Valida sucursal, empleado y cliente.
        const branch = await findActiveBranchById(client, validBranchId);
        if (!branch) throw createError("La sucursal no existe o está inactiva.", 404);

        const employee = await findActiveEmployeeById(client, validEmployeeId);
        if (!employee) throw createError("El empleado no existe o está inactivo.", 404);

        if (validCustomerId) {
            const customer = await findCustomerById(client, validCustomerId);
            if (!customer) throw createError("El cliente especificado no existe.", 404);
        } else if (normalizedCustomerData?.fullName) {
            const createdCustomer = await createCustomer(client, {
                ...normalizedCustomerData,
                taxId: documentType === "CREDIT_TAX" ? normalizedCustomerData.taxId : null,
                registrationNumber:
                    documentType === "CREDIT_TAX"
                        ? normalizedCustomerData.registrationNumber
                        : null
            });
            validCustomerId = createdCustomer.customer_id;
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
            employeeId: validEmployeeId,
            documentType,
            consecutiveNumber,
            controlNumber,
            generationCode,
            receptionStamp,
            subtotal: subtotalStr,
            vat: vatStr,
            total: totalStr,
            status: "PAID",
            isDelivery: normalizedIsDelivery,
            deliveryStatus: normalizedDeliveryStatus,
            deliveryAddress: normalizedDeliveryAddress,
            deliveryPhone: normalizedDeliveryPhone
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
            reference: normalizedPaymentReference
        });

        // Descuenta las existencias de los productos vendidos.
        for (const detail of preparedDetails) {
            await consumeSaleProduct(client, {
                branchId: validBranchId,
                productId: detail.productId,
                quantity: detail.quantity,
                employeeId: validEmployeeId
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

    const validBranchId = parseBranchFilter(branchId);
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

export async function cancelSaleService(invoiceId) {
    const id = validateId(invoiceId, "ID de factura");

    const cancelledSale = await updateInvoiceStatusToCancelled(id);
    if (!cancelledSale) {
        throw createError("No se encontró la factura o ya estaba anulada.", 404);
    }

    return cancelledSale;
}

