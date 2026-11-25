
import { createError } from "../../utils/errors.js";
import { formatCents, toCents } from "../../utils/money.js";
import { withTransaction } from "../../utils/transaction.js";
import { validateId } from "../../utils/validation.js";

import {
    findCashRegisterById,
    findActiveCashier,
    findEmployeeBranch,
    findActiveSessionByRegister,
    createCashSession,
    findCashRegistersByBranch,
    findAllActiveCashSessions,
    findCashSessionById,
    findCashSessionForUpdate,
    findSessionPayments,
    findSessionMovementsSummary,
    findExpectedCash,
    createCashMovement,
    updateCashSessionClose,
    findCashSessionHistory
} from "./cashflowDao.js";

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

// 1. Abre una sesión de caja.
export async function openCashSessionService({
    cashRegisterId,
    employeeId,
    initialAmount,
    user
}) {
    const registerId = validateId(cashRegisterId, "ID de caja");
    const cashierId = validateId(employeeId, "ID de empleado");
    const amount = validateAmount(initialAmount, true);

    return withTransaction(async (client) => {

        // Bloquea la caja para evitar aperturas simultáneas.
        const cashRegister = await findCashRegisterById(
            client,
            registerId
        );

        if (!cashRegister) {
            throw createError("La caja no existe.", 404);
        }

        if (user?.role !== "ADMINISTRATOR" && Number(cashRegister.branch_id) !== Number(user?.branchId)) {
            throw createError("No tiene permisos para acceder a otra sucursal.", 403);
        }

        if (cashRegister.estado !== "ACTIVO") {
            throw createError("La caja no está activa.", 409);
        }

        // Comprueba que el empleado esté activo.
        const cashier = await findActiveCashier(client, cashierId);

        if (!cashier) {
            throw createError("El empleado no existe o está inactivo.", 404);
        }

        // Comprueba que el cajero pertenezca a la sucursal.
        const employeeBranch = await findEmployeeBranch(
            client,
            cashierId,
            cashRegister.branch_id
        );

        if (!employeeBranch) {
            throw createError(
                "El empleado no pertenece a esta sucursal.",
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
            employeeId: cashierId,
            initialAmount: amount
        });
    });
}

export async function getCashRegistersByBranchService(branchId) {
    const id = validateId(branchId, "ID de sucursal");

    return findCashRegistersByBranch(id);
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

    return withTransaction(async (client) => {

        const session = await findCashSessionById(id, client);

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
    employeeId,
    type,
    amount,
    concept
}) {
    const id = validateId(sessionId, "ID de sesión");
    const cashierId = validateId(employeeId, "ID de empleado");
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

    return withTransaction(async (client) => {

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
        if (Number(session.employee_id) !== cashierId) {
            throw createError(
                "El empleado no es el cajero asignado a esta sesión.",
                403
            );
        }

        const cashier = await findActiveCashier(client, cashierId);

        if (!cashier) {
            throw createError("El empleado no está activo.", 403);
        }

        return createCashMovement(client, {
            sessionId: id,
            type,
            amount: validAmount,
            concept: concept.trim()
        });
    });
}

// 6. Cierra una sesión de caja.
export async function closeCashSessionService({
    sessionId,
    employeeId,
    realAmount
}) {
    const id = validateId(sessionId, "ID de sesión");
    const cashierId = validateId(employeeId, "ID de empleado");
    const validRealAmount = validateAmount(realAmount, true);

    return withTransaction(async (client) => {

        // Bloquea la sesión para evitar operaciones simultáneas.
        const session = await findCashSessionForUpdate(client, id);

        if (!session) {
            throw createError("La sesión no existe.", 404);
        }

        if (session.estado !== "ABIERTA") {
            throw createError("La sesión ya está cerrada.", 409);
        }

        if (Number(session.employee_id) !== cashierId) {
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
