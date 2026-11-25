import { pool } from "../../../config/database.js";

export async function findPurchasesByBranch(branchId) {
    const result = await pool.query(
        `SELECT p.purchase_id, ap.payable_id, p.supplier_id, s.name AS supplier_name, p.branch_id, p.invoice_number, TO_CHAR(p.purchase_date,'YYYY-MM-DD HH24:MI') AS purchase_date, p.subtotal, p.vat, p.total, ap.outstanding_amount, ap.status, p.status AS purchase_status, ap.due_date, (SELECT COUNT(*)::int FROM purchase_detail pd WHERE pd.purchase_id=p.purchase_id) AS items_count FROM purchase p JOIN supplier s ON s.supplier_id=p.supplier_id JOIN accounts_payable ap ON ap.purchase_id=p.purchase_id WHERE p.branch_id=$1 ORDER BY p.purchase_date DESC, p.purchase_id DESC`,
        [branchId]
    );

    return result.rows;
}

export async function verifyActiveBranch(client, branchId) {
    const result = await client.query(
        `SELECT 1
         FROM branch
         WHERE branch_id = $1 AND active = TRUE`,
        [branchId]
    );

    return result.rowCount > 0;
}

export async function findSupplierById(client, supplierId) {
    const result = await client.query(
        `SELECT supplier_id, name, active
         FROM supplier
         WHERE supplier_id = $1`,
        [supplierId]
    );

    return result.rows[0] ?? null;
}

export async function findIngredientsByIds(client, ingredientIds) {
    const result = await client.query(
        `SELECT ingredient_id
         FROM ingredient
         WHERE ingredient_id = ANY($1::int[])`,
        [ingredientIds]
    );

    return result.rows;
}

export async function findPurchaseByBranchAndInvoice(client, branchId, invoiceNumber) {
    const result = await client.query(
        `SELECT purchase_id
         FROM purchase
         WHERE branch_id = $1
           AND invoice_number = $2`,
        [branchId, invoiceNumber]
    );

    return result.rows[0] ?? null;
}

export async function insertPurchase(
    client,
    { supplierId, branchId, employeeId, invoiceNumber, subtotal, vat, total, status }
) {
    const result = await client.query(
        `INSERT INTO purchase (
             supplier_id,
             branch_id,
             employee_id,
             invoice_number,
             subtotal,
             vat,
             total,
             status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING
             purchase_id,
             TO_CHAR(purchase_date,'YYYY-MM-DD HH24:MI') AS purchase_date`,
        [
            supplierId,
            branchId,
            employeeId,
            invoiceNumber,
            subtotal,
            vat,
            total,
            status
        ]
    );

    return result.rows[0];
}

export async function insertPurchaseDetail(
    client,
    { purchaseId, ingredientId, quantity, unitCost, subtotal }
) {
    const result = await client.query(
        `INSERT INTO purchase_detail (
             purchase_id,
             ingredient_id,
             quantity,
             unit_cost,
             subtotal
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING
             purchase_detail_id,
             purchase_id,
             ingredient_id,
             quantity,
             unit_cost,
             subtotal`,
        [purchaseId, ingredientId, quantity, unitCost, subtotal]
    );

    return result.rows[0];
}

export async function insertAccountsPayable(
    client,
    { purchaseId, outstandingAmount, dueDate, status }
) {
    const result = await client.query(
        `INSERT INTO accounts_payable (
             purchase_id,
             outstanding_amount,
             due_date,
             status
         )
         VALUES ($1, $2, $3, $4)
         RETURNING
             payable_id,
             outstanding_amount,
             due_date,
             status`,
        [purchaseId, outstandingAmount, dueDate, status]
    );

    return result.rows[0];
}

