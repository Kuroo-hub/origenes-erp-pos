// cashflowDao.js
import { pool } from "../../config/database.js";

// Busca una caja y bloquea su registro durante la transacción.
export async function findCashRegisterById(client, cashRegisterId) {
    const result = await client.query(
        `SELECT id, branch_id, nombre, estado
         FROM cash_registers
         WHERE id = $1
         FOR UPDATE`,
        [cashRegisterId]
    );

    return result.rows[0] ?? null;
}

// Busca un cajero activo.
export async function findActiveCashier(client, userId) {
    const result = await client.query(
        `SELECT id, nombre_completo, estado
         FROM users
         WHERE id = $1
         AND estado = 'ACTIVO'`,
        [userId]
    );

    return result.rows[0] ?? null;
}

// Comprueba que el usuario esté asignado a la sucursal.
export async function findUserBranch(client, userId, branchId) {
    const result = await client.query(
        `SELECT user_id, branch_id
         FROM user_branches
         WHERE user_id = $1
         AND branch_id = $2`,
        [userId, branchId]
    );

    return result.rows[0] ?? null;
}

// Busca una sesión abierta para una caja.
export async function findActiveSessionByRegister(client, cashRegisterId) {
    const result = await client.query(
        `SELECT id, cash_register_id, user_id, estado
         FROM cash_sessions
         WHERE cash_register_id = $1
         AND estado = 'ABIERTA'`,
        [cashRegisterId]
    );

    return result.rows[0] ?? null;
}

// Crea una sesión de caja.
export async function createCashSession(
    client,
    { cashRegisterId, userId, initialAmount }
) {
    const result = await client.query(
        `INSERT INTO cash_sessions (
            cash_register_id,
            user_id,
            monto_inicial
         )
         VALUES ($1, $2, $3)
         RETURNING *`,
        [cashRegisterId, userId, initialAmount]
    );

    return result.rows[0];
}

// Obtiene todas las sesiones abiertas.
export async function findAllActiveCashSessions() {
    const result = await pool.query(
        `SELECT
            cs.id,
            cs.cash_register_id AS "cashRegisterId",
            cs.user_id AS "userId",
            cs.fecha_apertura AS "fechaApertura",
            cs.monto_inicial AS "montoInicial",
            cs.estado,
            cr.nombre AS "nombreCaja",
            b.nombre AS "nombreSucursal",
            u.nombre_completo AS "nombreCajero"
         FROM cash_sessions cs
         INNER JOIN cash_registers cr
            ON cr.id = cs.cash_register_id
         INNER JOIN branches b
            ON b.id = cr.branch_id
         INNER JOIN users u
            ON u.id = cs.user_id
         WHERE cs.estado = 'ABIERTA'
         ORDER BY cs.fecha_apertura DESC`
    );

    return result.rows;
}

// Obtiene una sesión por su ID.
export async function findCashSessionById(sessionId) {
    const result = await pool.query(
        `SELECT
            cs.*,
            cr.nombre AS "nombreCaja",
            cr.branch_id AS "branchId",
            b.nombre AS "nombreSucursal",
            u.nombre_completo AS "nombreCajero"
         FROM cash_sessions cs
         INNER JOIN cash_registers cr
            ON cr.id = cs.cash_register_id
         INNER JOIN branches b
            ON b.id = cr.branch_id
         INNER JOIN users u
            ON u.id = cs.user_id
         WHERE cs.id = $1`,
        [sessionId]
    );

    return result.rows[0] ?? null;
}

// Obtiene una sesión y bloquea su registro.
export async function findCashSessionForUpdate(client, sessionId) {
    const result = await client.query(
        `SELECT *
         FROM cash_sessions
         WHERE id = $1
         FOR UPDATE`,
        [sessionId]
    );

    return result.rows[0] ?? null;
}

// Obtiene los datos descriptivos de una sesión dentro de una transacción.
export async function findCashSessionDetails(client, sessionId) {
    const result = await client.query(
        `SELECT
            cs.*,
            cr.nombre AS "nombreCaja",
            cr.branch_id AS "branchId",
            b.nombre AS "nombreSucursal",
            u.nombre_completo AS "nombreCajero"
         FROM cash_sessions cs
         INNER JOIN cash_registers cr
            ON cr.id = cs.cash_register_id
         INNER JOIN branches b
            ON b.id = cr.branch_id
         INNER JOIN users u
            ON u.id = cs.user_id
         WHERE cs.id = $1`,
        [sessionId]
    );

    return result.rows[0] ?? null;
}

// Obtiene las ventas completadas agrupadas por método de pago.
export async function findSessionPayments(client, sessionId) {
    const result = await client.query(
        `SELECT
            sp.metodo,
            COALESCE(SUM(sp.monto), 0) AS total
         FROM sales s
         INNER JOIN sale_payments sp
            ON sp.sale_id = s.id
         WHERE s.cash_session_id = $1
         AND s.estado = 'COMPLETADA'
         GROUP BY sp.metodo
         ORDER BY sp.metodo`,
        [sessionId]
    );

    return result.rows;
}

// Obtiene los ingresos y egresos manuales.
export async function findSessionMovementsSummary(client, sessionId) {
    const result = await client.query(
        `SELECT
            COALESCE(
                SUM(CASE WHEN tipo = 'INGRESO' THEN monto ELSE 0 END),
                0
            ) AS total_ingresos,
            COALESCE(
                SUM(CASE WHEN tipo = 'EGRESO' THEN monto ELSE 0 END),
                0
            ) AS total_egresos
         FROM cash_movements
         WHERE cash_session_id = $1`,
        [sessionId]
    );

    return result.rows[0];
}

// Calcula el efectivo que debería haber en la caja.
export async function findExpectedCash(client, sessionId) {
    const result = await client.query(
        `SELECT
            (
                cs.monto_inicial
                + COALESCE((
                    SELECT SUM(sp.monto)
                    FROM sales s
                    INNER JOIN sale_payments sp
                        ON sp.sale_id = s.id
                    WHERE s.cash_session_id = cs.id
                    AND s.estado = 'COMPLETADA'
                    AND sp.metodo = 'EFECTIVO'
                ), 0)
                + COALESCE((
                    SELECT SUM(cm.monto)
                    FROM cash_movements cm
                    WHERE cm.cash_session_id = cs.id
                    AND cm.tipo = 'INGRESO'
                ), 0)
                - COALESCE((
                    SELECT SUM(cm.monto)
                    FROM cash_movements cm
                    WHERE cm.cash_session_id = cs.id
                    AND cm.tipo = 'EGRESO'
                ), 0)
            ) AS monto_esperado
         FROM cash_sessions cs
         WHERE cs.id = $1`,
        [sessionId]
    );

    return result.rows[0] ?? null;
}

// Registra un ingreso o egreso manual.
export async function createCashMovement(
    client,
    { sessionId, userId, type, amount, concept }
) {
    const result = await client.query(
        `INSERT INTO cash_movements (
            cash_session_id,
            user_id,
            tipo,
            monto,
            concepto
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [sessionId, userId, type, amount, concept]
    );

    return result.rows[0];
}

// Cierra la sesión y guarda los montos de cierre.
export async function updateCashSessionClose(
    client,
    { sessionId, expectedAmount, realAmount }
) {
    const result = await client.query(
        `UPDATE cash_sessions
         SET
            fecha_cierre = CURRENT_TIMESTAMP,
            monto_final_sistema = $2,
            monto_final_real = $3,
            estado = 'CERRADA'
         WHERE id = $1
         AND estado = 'ABIERTA'
         RETURNING *`,
        [sessionId, expectedAmount, realAmount]
    );

    return result.rows[0] ?? null;
}

// Obtiene el historial de sesiones con paginación.
export async function findCashSessionHistory(limit, offset) {
    const result = await pool.query(
        `SELECT
            cs.id,
            cs.fecha_apertura AS "fechaApertura",
            cs.fecha_cierre AS "fechaCierre",
            cs.monto_inicial AS "montoInicial",
            cs.monto_final_sistema AS "montoFinalSistema",
            cs.monto_final_real AS "montoFinalReal",
            cs.estado,
            cr.nombre AS "nombreCaja",
            b.nombre AS "nombreSucursal",
            u.nombre_completo AS "nombreCajero"
         FROM cash_sessions cs
         INNER JOIN cash_registers cr
            ON cr.id = cs.cash_register_id
         INNER JOIN branches b
            ON b.id = cr.branch_id
         INNER JOIN users u
            ON u.id = cs.user_id
         ORDER BY cs.fecha_apertura DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    return result.rows;
}