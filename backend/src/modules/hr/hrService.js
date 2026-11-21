import { AppError } from "../../utils/AppError.js";
import {
    createPayroll,
    createPayrollDetail,
    findActiveEmployeesForPayroll,
    findAllEmployees,
    findEmployeeById,
    findPayrollByPeriod
} from "./hrDao.js";
import { calculateBiweeklyPayroll } from "./payrollCalculator.js";
import { pool } from "../../config/database.js";

function parseEmployeeId(value) {
    const employeeId = Number(value);

    if (!Number.isInteger(employeeId) || employeeId < 1) {
        throw new AppError("El identificador del empleado no es válido.", 400);
    }

    return employeeId;
}

function validateDate(value, fieldName) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new AppError(`La ${fieldName} debe tener el formato AAAA-MM-DD.`, 400);
    }

    const date = new Date(`${value}T00:00:00Z`);

    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw new AppError(`La ${fieldName} no es válida.`, 400);
    }

    return value;
}

function normalizeEmployee(employee) {
    return {
        ...employee,
        baseSalary: Number(employee.baseSalary),
        active: Boolean(employee.active)
    };
}

export async function getEmployees() {
    const employees = await findAllEmployees();
    return employees.map(normalizeEmployee);
}

export async function getEmployee(employeeIdValue) {
    const employeeId = parseEmployeeId(employeeIdValue);
    const employee = await findEmployeeById(employeeId);

    if (!employee) {
        throw new AppError("No se encontró el empleado solicitado.", 404);
    }

    return normalizeEmployee(employee);
}

export async function runPayroll(payload) {
    const startDate = validateDate(payload?.startDate, "fecha de inicio");
    const endDate = validateDate(payload?.endDate, "fecha de finalización");
    const paymentDate = payload?.paymentDate
        ? validateDate(payload.paymentDate, "fecha de pago")
        : null;

    if (endDate < startDate) {
        throw new AppError("La fecha de finalización no puede ser anterior a la fecha de inicio.", 400);
    }

    const deductionsByUser = new Map();
    const deductions = payload?.otherDeductions ?? [];
    const bonusesByUser = new Map();
    const bonuses = payload?.bonuses ?? [];

    if (!Array.isArray(deductions)) {
        throw new AppError("Las otras deducciones deben enviarse en un arreglo.", 400);
    }

    for (const deduction of deductions) {
        const userId = Number(deduction?.userId);
        const amount = Number(deduction?.amount);

        if (!Number.isInteger(userId) || userId < 1 || !Number.isFinite(amount) || amount < 0) {
            throw new AppError("Cada deducción debe incluir un usuario y monto válidos.", 400);
        }

        if (deductionsByUser.has(userId)) {
            throw new AppError("No se puede repetir la deducción de un empleado.", 400);
        }

        deductionsByUser.set(userId, amount);
    }

    if (!Array.isArray(bonuses)) {
        throw new AppError("Los bonos deben enviarse en un arreglo.", 400);
    }

    for (const bonus of bonuses) {
        const userId = Number(bonus?.userId);
        const amount = Number(bonus?.amount);

        if (!Number.isInteger(userId) || userId < 1 || !Number.isFinite(amount) || amount < 0) {
            throw new AppError("Cada bono debe incluir un usuario y monto válidos.", 400);
        }

        if (bonusesByUser.has(userId)) {
            throw new AppError("No se puede repetir el bono de un empleado.", 400);
        }

        bonusesByUser.set(userId, amount);
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existingPayroll = await findPayrollByPeriod(client, startDate, endDate);
        if (existingPayroll) {
            throw new AppError("Ya existe una planilla para el período indicado.", 409);
        }

        const employees = await findActiveEmployeesForPayroll(client);
        if (employees.length === 0) {
            throw new AppError("No hay empleados activos para procesar la planilla.", 422);
        }

        const activeUserIds = new Set(employees.map((employee) => employee.userId));
        for (const userId of deductionsByUser.keys()) {
            if (!activeUserIds.has(userId)) {
                throw new AppError("Una deducción pertenece a un empleado inexistente o inactivo.", 400);
            }
        }

        for (const userId of bonusesByUser.keys()) {
            if (!activeUserIds.has(userId)) {
                throw new AppError("Un bono pertenece a un empleado inexistente o inactivo.", 400);
            }
        }

        const payroll = await createPayroll(client, { startDate, endDate, paymentDate });
        const details = [];

        for (const employee of employees) {
            const amounts = calculateBiweeklyPayroll(
                employee.baseSalary,
                deductionsByUser.get(employee.userId) ?? 0,
                bonusesByUser.get(employee.userId) ?? 0
            );
            const detail = await createPayrollDetail(client, payroll.payrollId, employee.userId, amounts);

            details.push({
                ...detail,
                employeeId: employee.employeeId,
                userId: employee.userId,
                fullName: employee.fullName,
                ...amounts
            });
        }

        await client.query("COMMIT");

        return {
            ...payroll,
            employeeCount: details.length,
            details
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
