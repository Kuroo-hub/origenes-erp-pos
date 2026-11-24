
import { AppError } from "../../utils/AppError.js";
import { pool } from "../../config/database.js";

import {
    findCashRegisterById,
    findActiveCashier,
    findUserBranch,
    findActiveSessionByRegister,
    createCashSession,
    findAllActiveCashSessions,
    findCashSessionById,
    findCashSessionForUpdate,
    findCashSessionDetails,
    findSessionPayments,
    findSessionMovementsSummary,
    findExpectedCash,
    createCashMovement,
    updateCashSessionClose,
    findCashSessionHistory
} from "./cashflowDao.js";

// Crea errores controlados.
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

// Valida identificadores enteros positivos.
function validateId(id, fieldName = "ID") {
    const value = Number(id);

    if (!Number.isSafeInteger(value) || value <= 0) {
        throw createError(`${fieldName} no es válido.`);
    }

    return value;
}

// Valida montos compatibles con NUMERIC(12,2).
function validateAmount(amount, allowZero = false) {
    const value = String(amount ?? "");

    if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) {
        throw createError("El formato del monto no es válido.");
    }

    const numericValue = Number(value);

    if (
        !Number.isFinite(numericValue) ||
        numericValue < 0 ||
        (!allowZero && numericValue === 0)
    ) {
        throw createError("El monto ingresado no es válido.");
    }

    return value;
}

// Convierte un monto decimal a centavos enteros.
function toCents(amount) {
    const value = String(amount);
    const negative = value.startsWith("-");
    const normalized = negative ? value.slice(1) : value;

    const [whole, decimal = ""] = normalized.split(".");

    const cents =
        BigInt(whole) * 100n +
        BigInt(decimal.padEnd(2, "0"));

    return negative ? -cents : cents;
}

// Convierte centavos enteros a formato decimal.
function formatCents(cents) {
    const negative = cents < 0n;
    const absolute = negative ? -cents : cents;

    const whole = absolute / 100n;
    const decimal = String(absolute % 100n).padStart(2, "0");

    return `${negative ? "-" : ""}${whole}.${decimal}`;
}

// 1. Abre una sesión de caja.
export async function openCashSessionService({
    cashRegisterId,
    userId,
    initialAmount
}) {
    const registerId = validateId(cashRegisterId, "ID de caja");
    const cashierId = validateId(userId, "ID de usuario");
    const amount = validateAmount(initialAmount, true);

    return executeTransaction(async (client) => {

        // Bloquea la caja para evitar aperturas simultáneas.
        const cashRegister = await findCashRegisterById(
            client,
            registerId
        );

        if (!cashRegister) {
            throw createError("La caja no existe.", 404);
        }

        if (cashRegister.estado !== "ACTIVO") {
            throw createError("La caja no está activa.", 409);
        }

        // Comprueba que el usuario esté activo.
        const cashier = await findActiveCashier(client, cashierId);

        if (!cashier) {
            throw createError("El usuario no existe o está inactivo.", 404);
        }

        // Comprueba que el cajero pertenezca a la sucursal.
        const userBranch = await findUserBranch(
            client,
            cashierId,
            cashRegister.branch_id
        );

        if (!userBranch) {
            throw createError(
                "El usuario no pertenece a esta sucursal.",
                403
            );
        }

        // Comprueba que no exista otra sesión abierta.
        const activeSession = await findActiveSessionByRegister(
            client,
            registerId
        );

        if (activeSession) {
            throw createError(
                "Esta caja ya tiene una sesión abierta.",
                409
            );
        }

        // Crea la sesión.
        return createCashSession(client, {
            cashRegisterId: registerId,
            userId: cashierId,
            initialAmount: amount
        });
    });
}

// 2. Consulta todas las sesiones abiertas.
export async function getActiveCashSessionsService() {
    return findAllActiveCashSessions();
}

// 3. Consulta una sesión por su ID.
export async function getCashSessionByIdService(sessionId) {
    const id = validateId(sessionId, "ID de sesión");

    const session = await findCashSessionById(id);

    if (!session) {
        throw createError("No se encontró la sesión de caja.", 404);
    }

    return session;
}

// 4. Consulta el resumen financiero de una sesión.
export async function getCashSessionSummaryService(sessionId) {
    const id = validateId(sessionId, "ID de sesión");

    return executeTransaction(async (client) => {

        const session = await findCashSessionDetails(client, id);

        if (!session) {
            throw createError("No se encontró la sesión de caja.", 404);
        }

        const payments = await findSessionPayments(client, id);

        const movements = await findSessionMovementsSummary(
            client,
            id
        );

        const expectedCash = await findExpectedCash(client, id);

        if (!expectedCash) {
            throw createError(
                "No fue posible calcular el efectivo esperado.",
                500
            );
        }

        return {
            session,
            payments,
            movements,
            montoEfectivoEsperado: expectedCash.monto_esperado
        };
    });
}

// 5. Registra un ingreso o egreso manual.
export async function addCashMovementService({
    sessionId,
    userId,
    type,
    amount,
    concept
}) {
    const id = validateId(sessionId, "ID de sesión");
    const cashierId = validateId(userId, "ID de usuario");
    const validAmount = validateAmount(amount);

    if (!["INGRESO", "EGRESO"].includes(type)) {
        throw createError(
            "El tipo de movimiento debe ser INGRESO o EGRESO."
        );
    }

    if (typeof concept !== "string" || !concept.trim()) {
        throw createError("Debe proporcionar un concepto.");
    }

    if (concept.trim().length > 150) {
        throw createError("El concepto no puede superar 150 caracteres.");
    }

    return executeTransaction(async (client) => {

        // Bloquea la sesión mientras se registra el movimiento.
        const session = await findCashSessionForUpdate(client, id);

        if (!session) {
            throw createError("La sesión no existe.", 404);
        }

        if (session.estado !== "ABIERTA") {
            throw createError(
                "No se pueden registrar movimientos en una caja cerrada.",
                409
            );
        }

        // Solo el cajero asignado puede registrar movimientos.
        if (Number(session.user_id) !== cashierId) {
            throw createError(
                "El usuario no es el cajero asignado a esta sesión.",
                403
            );
        }

        const cashier = await findActiveCashier(client, cashierId);

        if (!cashier) {
            throw createError("El usuario no está activo.", 403);
        }

        return createCashMovement(client, {
            sessionId: id,
            userId: cashierId,
            type,
            amount: validAmount,
            concept: concept.trim()
        });
    });
}

// 6. Cierra una sesión de caja.
export async function closeCashSessionService({
    sessionId,
    userId,
    realAmount
}) {
    const id = validateId(sessionId, "ID de sesión");
    const cashierId = validateId(userId, "ID de usuario");
    const validRealAmount = validateAmount(realAmount, true);

    return executeTransaction(async (client) => {

        // Bloquea la sesión para evitar operaciones simultáneas.
        const session = await findCashSessionForUpdate(client, id);

        if (!session) {
            throw createError("La sesión no existe.", 404);
        }

        if (session.estado !== "ABIERTA") {
            throw createError("La sesión ya está cerrada.", 409);
        }

        if (Number(session.user_id) !== cashierId) {
            throw createError(
                "Solo el cajero asignado puede cerrar esta sesión.",
                403
            );
        }

        // Calcula el efectivo esperado.
        const expectedCash = await findExpectedCash(client, id);

        if (!expectedCash) {
            throw createError(
                "No fue posible calcular el efectivo esperado.",
                500
            );
        }

        // Calcula la diferencia en centavos enteros.
        const difference =
            toCents(validRealAmount) -
            toCents(expectedCash.monto_esperado);

        const closedSession = await updateCashSessionClose(client, {
            sessionId: id,
            realAmount: validRealAmount
        });

        if (!closedSession) {
            throw createError(
                "No fue posible cerrar la sesión.",
                409
            );
        }

        return {
            session: closedSession,
            efectivoEsperado: expectedCash.monto_esperado,
            efectivoReal: validRealAmount,
            diferencia: formatCents(difference)
        };
    });
}

// 7. Consulta el historial de sesiones.
export async function getCashSessionHistoryService({
    limit = 20,
    offset = 0
} = {}) {
    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
    ) {
        throw createError(
            "El límite debe ser un entero entre 1 y 100."
        );
    }

    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
        throw createError(
            "El desplazamiento debe ser un entero mayor o igual a cero."
        );
    }

    return findCashSessionHistory(parsedLimit, parsedOffset);
}
