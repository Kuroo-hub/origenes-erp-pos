import { pool } from "../../../config/database.js";

export async function findPayableForUpdate(client, payableId) {
    const result = await client.query(
        `SELECT ap.payable_id, ap.purchase_id, ap.outstanding_amount, ap.status, p.branch_id
         FROM accounts_payable ap
         JOIN purchase p ON p.purchase_id = ap.purchase_id
         WHERE ap.payable_id = $1
         FOR UPDATE`,
        [payableId]
    );

    return result.rows[0] ?? null;
}

export async function insertSupplierPayment(
    client,
    { payableId, amount, paymentMethod, reference }
) {
    const result = await client.query(
        `INSERT INTO supplier_payment (
             payable_id,
             amount,
             payment_method,
             reference
         )
         VALUES ($1, $2, $3, $4)
         RETURNING
             supplier_payment_id AS payment_id,
             amount,
             payment_method,
             reference`,
        [payableId, amount, paymentMethod, reference]
    );

    return result.rows[0];
}

export async function updatePayableAfterPayment(client, { payableId, remainingAmount, status }) {
    const result = await client.query(
        `UPDATE accounts_payable
         SET outstanding_amount = $2,
             status = $3
         WHERE payable_id = $1
         RETURNING
             payable_id,
             outstanding_amount,
             status`,
        [payableId, remainingAmount, status]
    );

    return result.rows[0];
}

export async function updatePurchaseStatus(client, purchaseId, status) {
    const result = await client.query(
        `UPDATE purchase
         SET status = $2
         WHERE purchase_id = $1
         RETURNING
             purchase_id,
             status`,
        [purchaseId, status]
    );

    return result.rows[0];
}

export async function findPurchaseStatusById(client, purchaseId) {
    const result = await client.query(
        `SELECT status
         FROM purchase
         WHERE purchase_id = $1`,
        [purchaseId]
    );

    return result.rows[0] ?? null;
}
