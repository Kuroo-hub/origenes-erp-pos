import { pool } from "../../../config/database.js";

export async function findDashboardBranches(branchId) {
    const result = await pool.query(
        `WITH revenue AS (
            SELECT
                i.branch_id,
                COALESCE(SUM(i.total), 0) AS monthly_revenue,
                COUNT(*) AS orders_count
            FROM invoice i
            WHERE i.issue_date >= date_trunc('month', CURRENT_DATE)
              AND i.status <> 'CANCELLED'
              AND ($1::INTEGER IS NULL OR i.branch_id = $1)
            GROUP BY i.branch_id
         ),
         expenses AS (
            SELECT
                p.branch_id,
                COALESCE(SUM(p.total), 0) AS monthly_expenses
            FROM purchase p
            WHERE p.purchase_date >= date_trunc('month', CURRENT_DATE)
              AND p.status <> 'CANCELLED'
              AND ($1::INTEGER IS NULL OR p.branch_id = $1)
            GROUP BY p.branch_id
         ),
         staff AS (
            SELECT
                e.branch_id,
                COUNT(*) AS active_staff
            FROM employee e
            WHERE e.active = TRUE
              AND ($1::INTEGER IS NULL OR e.branch_id = $1)
            GROUP BY e.branch_id
         ),
         alerts AS (
            SELECT
                bi.branch_id,
                COUNT(*) AS low_stock_alerts
            FROM branch_inventory bi
            WHERE bi.quantity <= bi.minimum_stock
              AND ($1::INTEGER IS NULL OR bi.branch_id = $1)
            GROUP BY bi.branch_id
         ),
         cash AS (
            SELECT
                cr.branch_id,
                BOOL_OR(cs.status = 'OPEN') AS cash_open
            FROM cash_register cr
            LEFT JOIN cash_shift cs
                ON cs.cash_register_id = cr.cash_register_id
            WHERE ($1::INTEGER IS NULL OR cr.branch_id = $1)
            GROUP BY cr.branch_id
         )
         SELECT
             b.branch_id,
             b.name,
             b.address,
             COALESCE(r.monthly_revenue, 0) AS monthly_revenue,
             COALESCE(e.monthly_expenses, 0) AS monthly_expenses,
             COALESCE(r.orders_count, 0) AS orders_count,
             COALESCE(s.active_staff, 0) AS active_staff,
             COALESCE(a.low_stock_alerts, 0) AS low_stock_alerts,
             COALESCE(c.cash_open, FALSE) AS cash_open
         FROM branch b
         LEFT JOIN revenue r ON r.branch_id = b.branch_id
         LEFT JOIN expenses e ON e.branch_id = b.branch_id
         LEFT JOIN staff s ON s.branch_id = b.branch_id
         LEFT JOIN alerts a ON a.branch_id = b.branch_id
         LEFT JOIN cash c ON c.branch_id = b.branch_id
         WHERE b.active = TRUE
           AND ($1::INTEGER IS NULL OR b.branch_id = $1)
         ORDER BY b.branch_id`,
        [branchId]
    );

    return result.rows;
}

export async function findTopProducts(branchId) {
    const result = await pool.query(
        `SELECT
             p.product_id,
             p.name,
             p.product_type AS category,
             SUM(d.quantity) AS units_sold,
             COALESCE(SUM(d.subtotal), 0) AS revenue
          FROM invoice_detail d
          INNER JOIN invoice i
              ON i.invoice_id = d.invoice_id
          INNER JOIN product p
              ON p.product_id = d.product_id
          WHERE i.status = 'PAID'
            AND i.issue_date >= date_trunc('month', CURRENT_DATE)
            AND ($1::INTEGER IS NULL OR i.branch_id = $1)
          GROUP BY p.product_id, p.name, p.product_type
          ORDER BY units_sold DESC, revenue DESC, p.product_id ASC
          LIMIT 5`,
        [branchId]
    );

    return result.rows;
}

export async function findPayables(branchId) {
    const result = await pool.query(
        `SELECT
             ap.payable_id,
             p.branch_id,
             b.name AS branch_name,
             s.name AS supplier_name,
             p.invoice_number,
             TO_CHAR(ap.due_date, 'YYYY-MM-DD') AS due_date,
             p.total,
             ap.outstanding_amount,
             ap.status
          FROM accounts_payable ap
          INNER JOIN purchase p
              ON p.purchase_id = ap.purchase_id
          INNER JOIN supplier s
              ON s.supplier_id = p.supplier_id
          INNER JOIN branch b
              ON b.branch_id = p.branch_id
          WHERE ap.status IN ('PENDING', 'PARTIAL')
            AND ($1::INTEGER IS NULL OR p.branch_id = $1)
          ORDER BY ap.due_date NULLS LAST, ap.payable_id ASC`,
        [branchId]
    );

    return result.rows;
}
