import { pool } from "../../../config/database.js";

// Verifica que la sucursal exista y esté activa.
export async function findActiveBranchById(client, branchId) {
    const result = await client.query(
        `SELECT branch_id, name, active
         FROM branch
         WHERE branch_id = $1 AND active = TRUE`,
        [branchId]
    );

    return result.rows[0] ?? null;
}

// Verifica que el empleado exista y esté activo.
export async function findActiveEmployeeById(client, employeeId) {
    const result = await client.query(
        `SELECT employee_id, email, role, active
         FROM employee
         WHERE employee_id = $1 AND active = TRUE`,
        [employeeId]
    );

    return result.rows[0] ?? null;
}

// Verifica que el cliente exista (cuando se envía customerId).
export async function findCustomerById(client, customerId) {
    const result = await client.query(
        `SELECT customer_id, full_name, tax_id, registration_number
         FROM customer
         WHERE customer_id = $1`,
        [customerId]
    );

    return result.rows[0] ?? null;
}

// Verifica que el turno de caja exista y esté ABIERTO (OPEN).
export async function findOpenCashShiftById(client, shiftId) {
    const result = await client.query(
        `SELECT cs.shift_id, cs.status, cr.branch_id
         FROM cash_shift cs
         INNER JOIN cash_register cr
            ON cr.cash_register_id = cs.cash_register_id
         WHERE cs.shift_id = $1
          FOR UPDATE OF cs`,
        [shiftId]
    );

    return result.rows[0] ?? null;
}

// Busca los productos solicitados en la BD para obtener sus precios reales.
export async function findActiveProductsByIds(client, productIds) {
    const result = await client.query(
        `SELECT product_id, name, price, active
         FROM product
         WHERE product_id = ANY($1::int[])`,
        [productIds]
    );

    return result.rows;
}

// Obtiene y actualiza el correlativo bloqueando la fila (FOR UPDATE) para evitar duplicados.
export async function getNextDocumentSequence(client, branchId, documentType) {
    const result = await client.query(
        `UPDATE document_sequence
         SET last_number = last_number + 1
         WHERE branch_id = $1
           AND document_type = $2
           AND active = TRUE
         RETURNING sequence_id, last_number`,
        [branchId, documentType]
    );

    return result.rows[0] ?? null;
}

export async function createCustomer(
    client,
    {
        fullName,
        taxId = null,
        registrationNumber = null,
        businessName = null,
        economicActivity = null,
        taxAddress = null
    }
) {
    const result = await client.query(
        `INSERT INTO customer (
            full_name,
            tax_id,
            registration_number,
            business_name,
            economic_activity,
            tax_address
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING customer_id, full_name, tax_id, registration_number`,
        [
            fullName,
            taxId,
            registrationNumber,
            businessName,
            economicActivity,
            taxAddress
        ]
    );

    return result.rows[0];
}

// Inserta el encabezado de la factura (comprobante fiscal).
export async function createInvoice(
    client,
    {
        customerId,
        branchId,
        employeeId,
        documentType,
        consecutiveNumber,
        controlNumber,
        generationCode,
        receptionStamp,
        subtotal,
        vat,
        total,
        status,
        isDelivery = false,
        deliveryStatus = null,
        deliveryAddress = null,
        deliveryPhone = null
    }
) {
    const result = await client.query(
        `INSERT INTO invoice (
            customer_id,
            branch_id,
            employee_id,
            document_type,
            consecutive_number,
            control_number,
            generation_code,
            reception_stamp,
            subtotal,
            vat,
            total,
            status,
            is_delivery,
            delivery_status,
            delivery_address,
            delivery_phone
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
            customerId,
            branchId,
            employeeId,
            documentType,
            consecutiveNumber,
            controlNumber,
            generationCode,
            receptionStamp,
            subtotal,
            vat,
            total,
            status,
            isDelivery,
            deliveryStatus,
            deliveryAddress,
            deliveryPhone
        ]
    );

    return result.rows[0];
}

// Inserta cada línea de producto vendido en la factura.
export async function createInvoiceDetail(
    client,
    { invoiceId, productId, quantity, unitPrice, subtotal }
) {
    const result = await client.query(
        `INSERT INTO invoice_detail (
            invoice_id,
            product_id,
            quantity,
            unit_price,
            subtotal
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [invoiceId, productId, quantity, unitPrice, subtotal]
    );

    return result.rows[0];
}

// Registra el pago asociado a la factura y al turno de caja.
export async function createSalePayment(
    client,
    { invoiceId, shiftId, paymentMethod, amount, reference }
) {
    const result = await client.query(
        `INSERT INTO sale_payment (
            invoice_id,
            shift_id,
            payment_method,
            amount,
            reference
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [invoiceId, shiftId, paymentMethod, amount, reference]
    );

    return result.rows[0];
}

// Lista el historial de facturas con paginación.
export async function findInvoicesHistory(limit, offset, branchId = null) {
    const params = [limit, offset];
    let whereClause = "";

    if (branchId) {
        params.push(branchId);
        whereClause = `WHERE i.branch_id = $3`;
    }

    const result = await pool.query(
        `SELECT
            i.invoice_id AS "invoiceId",
            i.branch_id AS "branchId",
            i.document_type AS "documentType",
            i.consecutive_number AS "consecutiveNumber",
            i.control_number AS "controlNumber",
            i.issue_date AS "issueDate",
            i.subtotal,
            i.vat,
            i.total,
            i.status,
            i.is_delivery AS "isDelivery",
            i.delivery_status AS "deliveryStatus",
            i.delivery_address AS "deliveryAddress",
            i.delivery_phone AS "deliveryPhone",
            b.name AS "branchName",
            c.full_name AS "customerName",
            e.email AS "cashierEmail",
            sp.payment_method AS "paymentMethod",
            COALESCE((
                SELECT json_agg(
                    json_build_object(
                        'productId', d.product_id,
                        'name', p.name,
                        'quantity', d.quantity,
                        'price', d.unit_price
                    ) ORDER BY d.invoice_detail_id
                )
                FROM invoice_detail d
                INNER JOIN product p
                    ON p.product_id = d.product_id
                WHERE d.invoice_id = i.invoice_id
            ), '[]'::json) AS "items"
         FROM invoice i
         INNER JOIN branch b
            ON b.branch_id = i.branch_id
         INNER JOIN employee e
            ON e.employee_id = i.employee_id
         LEFT JOIN customer c
            ON c.customer_id = i.customer_id
         LEFT JOIN sale_payment sp
            ON sp.invoice_id = i.invoice_id
         ${whereClause}
         ORDER BY i.issue_date DESC
         LIMIT $1 OFFSET $2`,
        params
    );

    return result.rows;
}

// Consulta el encabezado completo de una factura (comprobante).
export async function findInvoiceHeaderById(invoiceId) {
    const result = await pool.query(
        `SELECT
            i.*,
            b.name AS "branchName",
            b.address AS "branchAddress",
            c.full_name AS "customerName",
            c.tax_id AS "customerTaxId",
            c.registration_number AS "customerNrc",
            e.email AS "cashierEmail"
         FROM invoice i
         INNER JOIN branch b
            ON b.branch_id = i.branch_id
         INNER JOIN employee e
             ON e.employee_id = i.employee_id
         LEFT JOIN customer c
            ON c.customer_id = i.customer_id
         WHERE i.invoice_id = $1`,
        [invoiceId]
    );

    return result.rows[0] ?? null;
}

// Consulta los productos vendidos de una factura.
export async function findInvoiceDetailsByInvoiceId(invoiceId) {
    const result = await pool.query(
        `SELECT
            id.invoice_detail_id AS "invoiceDetailId",
            id.product_id AS "productId",
            p.name AS "productName",
            id.quantity,
            id.unit_price AS "unitPrice",
            id.subtotal
         FROM invoice_detail id
         INNER JOIN product p
            ON p.product_id = id.product_id
         WHERE id.invoice_id = $1`,
        [invoiceId]
    );

    return result.rows;
}

// Consulta los pagos realizados a una factura.
export async function findInvoicePaymentsByInvoiceId(invoiceId) {
    const result = await pool.query(
        `SELECT
            payment_id AS "paymentId",
            shift_id AS "shiftId",
            payment_method AS "paymentMethod",
            amount,
            reference,
            payment_date AS "paymentDate"
         FROM sale_payment
         WHERE invoice_id = $1`,
        [invoiceId]
    );

    return result.rows;
}

// Anula una factura cambiando su estado a CANCELLED.
export async function updateInvoiceStatusToCancelled(invoiceId) {
    const result = await pool.query(
        `UPDATE invoice
         SET status = 'CANCELLED'
         WHERE invoice_id = $1
           AND status <> 'CANCELLED'
         RETURNING *`,
        [invoiceId]
    );

    return result.rows[0] ?? null;
}
