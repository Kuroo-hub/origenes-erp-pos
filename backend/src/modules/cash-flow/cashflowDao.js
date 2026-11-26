
import { pool } from "../../config/database.js";

// Busca una caja y la bloquea durante la transacción.
export async function findCashRegisterById(client, cashRegisterId) {
    const result = await client.query(
        `SELECT
            cash_register_id,
            branch_id,
            name,
            active,
            CASE WHEN active THEN 'ACTIVO' ELSE 'INACTIVO' END AS estado
         FROM cash_register
         WHERE cash_register_id = $1
         FOR UPDATE`,
        [cashRegisterId]
    );

    return result.rows[0] ?? null;
}

// Busca un empleado activo.
export async function findActiveCashier(client, employeeId) {
    const result = await client.query(
        `SELECT
            e.employee_id,
            e.email,
            e.active,
            e.full_name AS nombre_completo
         FROM employee e
         WHERE e.employee_id = $1
         AND e.active = TRUE`,
        [employeeId]
    );

    return result.rows[0] ?? null;
}

// Comprueba que el empleado pertenezca a la sucursal.
export async function findEmployeeBranch(client, employeeId, branchId) {
    const result = await client.query(
        `SELECT employee_id, branch_id
         FROM employee
         WHERE employee_id = $1
         AND branch_id = $2`,
        [employeeId, branchId]
    );

    return result.rows[0] ?? null;
}

// Busca una sesión abierta para una caja.
export async function findActiveSessionByRegister(client, cashRegisterId) {
    const result = await client.query(
        `SELECT
            shift_id AS id,
            cash_register_id,
            employee_id,
            status,
            CASE
                WHEN status = 'OPEN' THEN 'ABIERTA'
                ELSE 'CERRADA'
            END AS estado
         FROM cash_shift
         WHERE cash_register_id = $1
         AND status = 'OPEN'`,
        [cashRegisterId]
    );

    return result.rows[0] ?? null;
}

// Crea una sesión de caja.
export async function createCashSession(
    client,
    { cashRegisterId, employeeId, initialAmount }
) {
    const result = await client.query(
        `INSERT INTO cash_shift (
            cash_register_id,
            employee_id,
            opening_amount,
            status
         )
         VALUES ($1, $2, $3, 'OPEN')
         RETURNING
            *,
            shift_id AS id,
            opening_date AS fecha_apertura,
            opening_amount AS monto_inicial,
            CASE
                WHEN status = 'OPEN' THEN 'ABIERTA'
                ELSE 'CERRADA'
            END AS estado`,
        [cashRegisterId, employeeId, initialAmount]
    );

    return result.rows[0];
}

export async function findCashRegistersByBranch(branchId) {
    const result = await pool.query(
        `SELECT
            cr.cash_register_id AS "cashRegisterId",
            cr.branch_id AS "branchId",
            cr.name,
            cr.active,
            b.name AS "branchName",
            CASE WHEN cr.active THEN 'ACTIVO' ELSE 'INACTIVO' END AS estado
         FROM cash_register cr
         INNER JOIN branch b
            ON b.branch_id = cr.branch_id
         WHERE cr.branch_id = $1
         ORDER BY cr.cash_register_id`,
        [branchId]
    );

    return result.rows;
}

// Obtiene todas las sesiones abiertas.
export async function findAllActiveCashSessions(branchId = null) {
    const result = await pool.query(
        `SELECT
            cs.shift_id AS id,
            cs.cash_register_id AS "cashRegisterId",
            cs.employee_id AS "employeeId",
            cs.opening_date AS "fechaApertura",
            cs.opening_amount AS "montoInicial",
            'ABIERTA' AS estado,
            b.branch_id AS "branchId",
            cr.name AS "nombreCaja",
            b.name AS "nombreSucursal",
            e.full_name AS "nombreCajero"
         FROM cash_shift cs
         INNER JOIN cash_register cr
            ON cr.cash_register_id = cs.cash_register_id
         INNER JOIN branch b
            ON b.branch_id = cr.branch_id
         INNER JOIN employee e
             ON e.employee_id = cs.employee_id
          WHERE cs.status = 'OPEN'
            AND ($1::INTEGER IS NULL OR b.branch_id = $1)
          ORDER BY cs.opening_date DESC`,
        [branchId]
    );

    return result.rows;
}

const CASH_SESSION_DETAILS_QUERY = `SELECT
    cs.*,
    cs.shift_id AS id,
    cs.opening_date AS fecha_apertura,
    cs.closing_date AS fecha_cierre,
    cs.opening_amount AS monto_inicial,
    cs.closing_amount AS monto_final_real,
    CASE
        WHEN cs.status = 'OPEN' THEN 'ABIERTA'
        ELSE 'CERRADA'
    END AS estado,
    cr.name AS "nombreCaja",
    cr.branch_id AS "branchId",
    b.name AS "nombreSucursal",
    e.full_name AS "nombreCajero"
 FROM cash_shift cs
 INNER JOIN cash_register cr
    ON cr.cash_register_id = cs.cash_register_id
 INNER JOIN branch b
    ON b.branch_id = cr.branch_id
 INNER JOIN employee e
     ON e.employee_id = cs.employee_id
  WHERE cs.shift_id = $1
    AND ($2::INTEGER IS NULL OR cr.branch_id = $2)`;

// Obtiene una sesión por su ID.
export async function findCashSessionById(sessionId, client = pool, branchId = null) {
    const result = await client.query(CASH_SESSION_DETAILS_QUERY, [sessionId, branchId]);

    return result.rows[0] ?? null;
}

// Obtiene una sesión y bloquea su registro.
export async function findCashSessionForUpdate(client, sessionId) {
    const result = await client.query(
        `SELECT
            cs.*,
            cs.shift_id AS id,
            cr.branch_id AS "branchId",
            CASE
                WHEN cs.status = 'OPEN' THEN 'ABIERTA'
                ELSE 'CERRADA'
            END AS estado
         FROM cash_shift cs
         INNER JOIN cash_register cr
             ON cr.cash_register_id = cs.cash_register_id
         WHERE cs.shift_id = $1
         FOR UPDATE OF cs`,
        [sessionId]
    );

    return result.rows[0] ?? null;
}

// Obtiene los pagos de las ventas completadas.
export async function findSessionPayments(client, sessionId) {
    const result = await client.query(
        `SELECT
            sp.payment_method AS metodo,
            COALESCE(SUM(sp.amount), 0) AS total
         FROM sale_payment sp
         INNER JOIN invoice i
            ON i.invoice_id = sp.invoice_id
         WHERE sp.shift_id = $1
         AND i.status = 'PAID'
         GROUP BY sp.payment_method
         ORDER BY sp.payment_method`,
        [sessionId]
    );

    return result.rows;
}

// Obtiene los ingresos y egresos manuales.
export async function findSessionMovementsSummary(client, sessionId) {
    const result = await client.query(
        `SELECT
            COALESCE(
                SUM(CASE
                    WHEN movement_type = 'INCOME' THEN amount
                    ELSE 0
                END), 0
            ) AS total_ingresos,
            COALESCE(
                SUM(CASE
                    WHEN movement_type = 'EXPENSE' THEN amount
                    ELSE 0
                END), 0
            ) AS total_egresos
         FROM cash_movement
         WHERE shift_id = $1`,
        [sessionId]
    );

    return result.rows[0];
}

// Calcula el efectivo que debería haber en la caja.
export async function findExpectedCash(client, sessionId) {
    const result = await client.query(
        `SELECT
            (
                cs.opening_amount
                + COALESCE((
                    SELECT SUM(sp.amount)
                    FROM sale_payment sp
                    INNER JOIN invoice i
                        ON i.invoice_id = sp.invoice_id
                    WHERE sp.shift_id = cs.shift_id
                    AND i.status = 'PAID'
                    AND sp.payment_method = 'CASH'
                ), 0)
                + COALESCE((
                    SELECT SUM(cm.amount)
                    FROM cash_movement cm
                    WHERE cm.shift_id = cs.shift_id
                    AND cm.movement_type = 'INCOME'
                ), 0)
                - COALESCE((
                    SELECT SUM(cm.amount)
                    FROM cash_movement cm
                    WHERE cm.shift_id = cs.shift_id
                    AND cm.movement_type = 'EXPENSE'
                ), 0)
            ) AS monto_esperado
         FROM cash_shift cs
         WHERE cs.shift_id = $1`,
        [sessionId]
    );

    return result.rows[0] ?? null;
}

// Registra un ingreso o egreso manual.
export async function createCashMovement(
    client,
    { sessionId, type, amount, concept }
) {
    const movementType = type === "INGRESO" ? "INCOME" : "EXPENSE";

    const result = await client.query(
        `INSERT INTO cash_movement (
            shift_id,
            movement_type,
            description,
            amount
         )
         VALUES ($1, $2, $3, $4)
         RETURNING
            *,
            cash_movement_id AS id`,
        [sessionId, movementType, concept, amount]
    );

    return result.rows[0];
}

// Cierra la sesión y guarda el efectivo contado.
export async function updateCashSessionClose(
    client,
    { sessionId, realAmount }
) {
    const result = await client.query(
        `UPDATE cash_shift
         SET
            closing_date = CURRENT_TIMESTAMP,
            closing_amount = $2,
            status = 'CLOSED'
         WHERE shift_id = $1
         AND status = 'OPEN'
         RETURNING
            *,
            shift_id AS id,
            opening_date AS fecha_apertura,
            closing_date AS fecha_cierre,
            opening_amount AS monto_inicial,
            closing_amount AS monto_final_real,
            'CERRADA' AS estado`,
        [sessionId, realAmount]
    );

    return result.rows[0] ?? null;
}

// Obtiene el historial de sesiones con paginación.
export async function findCashSessionHistory(limit, offset, branchId = null) {
    const result = await pool.query(
        `SELECT
            cs.shift_id AS id,
            cs.opening_date AS "fechaApertura",
            cs.closing_date AS "fechaCierre",
            cs.opening_amount AS "montoInicial",
            cs.closing_amount AS "montoFinalReal",
            CASE
                WHEN cs.status = 'OPEN' THEN 'ABIERTA'
                ELSE 'CERRADA'
            END AS estado,
            cr.name AS "nombreCaja",
            b.name AS "nombreSucursal",
            e.full_name AS "nombreCajero"
         FROM cash_shift cs
         INNER JOIN cash_register cr
            ON cr.cash_register_id = cs.cash_register_id
         INNER JOIN branch b
            ON b.branch_id = cr.branch_id
          INNER JOIN employee e
              ON e.employee_id = cs.employee_id
          WHERE ($3::INTEGER IS NULL OR b.branch_id = $3)
          ORDER BY cs.opening_date DESC
          LIMIT $1 OFFSET $2`,
        [limit, offset, branchId]
    );

    return result.rows;
}
