import { pool } from "../../../config/database.js";

const LATEST_PAYMENT_METHOD = `COALESCE((
    SELECT sp.payment_method
    FROM sale_payment sp
    WHERE sp.invoice_id = i.invoice_id
    ORDER BY sp.payment_id DESC
    LIMIT 1
), 'CASH')`;

export async function findDeliveryOrders(branchId) {
    const result = await pool.query(
        `SELECT
             'ORD-' || i.invoice_id AS order_id,
             i.invoice_id,
             i.branch_id,
             COALESCE(c.full_name, 'Cliente mostrador') AS customer_name,
             i.delivery_phone AS customer_phone,
             'Por llamada' AS origen,
              i.delivery_address,
              NULL AS address_reference,
             COALESCE((
                 SELECT json_agg(
                     json_build_object(
                         'name', p.name,
                         'quantity', d.quantity,
                         'price', d.unit_price
                     ) ORDER BY d.invoice_detail_id
                 )
                 FROM invoice_detail d
                 INNER JOIN product p
                     ON p.product_id = d.product_id
                 WHERE d.invoice_id = i.invoice_id
             ), '[]'::json) AS items,
             i.total AS total_amount,
             ${LATEST_PAYMENT_METHOD} AS payment_method,
             i.delivery_status,
             TO_CHAR(i.issue_date, 'HH24:MI') AS created_at
          FROM invoice i
          LEFT JOIN customer c
              ON c.customer_id = i.customer_id
          WHERE i.is_delivery = TRUE
            AND ($1::INTEGER IS NULL OR i.branch_id = $1)
          ORDER BY i.issue_date DESC, i.invoice_id DESC
          LIMIT 100`,
        [branchId]
    );

    return result.rows;
}

export async function findDeliveryInvoiceForUpdate(invoiceId) {
    const result = await pool.query(
        `SELECT
             i.invoice_id,
             i.branch_id,
             i.delivery_status,
             ${LATEST_PAYMENT_METHOD} AS payment_method
          FROM invoice i
          WHERE i.invoice_id = $1
            AND i.is_delivery = TRUE
          FOR UPDATE OF i`,
        [invoiceId]
    );

    return result.rows[0] ?? null;
}

export async function updateDeliveryStatus(invoiceId, currentStatus, nextStatus) {
    const result = await pool.query(
        `UPDATE invoice i
         SET
             delivery_status = $3,
             status = CASE
                 WHEN $3::VARCHAR = 'DELIVERED' THEN 'COMPLETED'
                 ELSE status
             END
         WHERE i.invoice_id = $1
           AND i.is_delivery = TRUE
           AND i.delivery_status = $2
         RETURNING
             i.invoice_id,
             i.branch_id,
             i.delivery_status,
             i.status,
             ${LATEST_PAYMENT_METHOD} AS payment_method`,
        [invoiceId, currentStatus, nextStatus]
    );

    return result.rows[0] ?? null;
}
export async function findKitchenInvoiceForUpdate(invoiceId) {
    const result = await pool.query(
        `SELECT invoice_id, branch_id, kitchen_status, is_delivery, status
         FROM invoice
         WHERE invoice_id = $1
         FOR UPDATE`,
        [invoiceId]
    );

    return result.rows[0] ?? null;
}

export async function updateKitchenStatus(invoiceId, currentStatus, nextStatus) {
    const result = await pool.query(
        `UPDATE invoice
         SET
             kitchen_status = $3,
             status = CASE
                 WHEN $3::VARCHAR = 'READY' AND is_delivery = FALSE THEN 'COMPLETED'
                 ELSE status
             END
         WHERE invoice_id = $1
           AND kitchen_status = $2
         RETURNING invoice_id, branch_id, kitchen_status, status`,
        [invoiceId, currentStatus, nextStatus]
    );

    return result.rows[0] ?? null;
}