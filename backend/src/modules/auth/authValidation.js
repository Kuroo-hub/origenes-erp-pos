import { AppError } from "../../utils/AppError.js";

export const ALLOWED_ROLES = Object.freeze([
    "ADMINISTRATOR",
    "MANAGER",
    "EMPLOYEE",
    "HR",
    "INVENTORY_MANAGER"
]);

function createError(message, statusCode = 400) {
    return new AppError(message, statusCode);
}

function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateRequiredObject(value) {
    if (!isPlainObject(value)) {
        throw createError("El cuerpo de la solicitud no es válido.");
    }

    return value;
}

function validatePositiveInteger(value, fieldName) {
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw createError(`${fieldName} no es válido.`);
    }

    return parsed;
}

function validateText(value, fieldName, maxLength, minLength = 1) {
    if (typeof value !== "string") {
        throw createError(`${fieldName} no es válido.`);
    }

    const trimmed = value.trim();
    if (trimmed.length < minLength || trimmed.length > maxLength) {
        throw createError(`${fieldName} no es válido.`);
    }

    return trimmed;
}

export function validateEmail(value) {
    const email = validateText(value, "Correo electrónico", 150).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw createError("Correo electrónico no es válido.");
    }

    return email;
}

function validatePassword(value, minLength = 8) {
    if (typeof value !== "string") {
        throw createError("Contraseña no es válida.");
    }

    if (value.length < minLength || Buffer.byteLength(value, "utf8") > 72) {
        throw createError("Contraseña no es válida.");
    }

    return value;
}

function validateRole(value) {
    if (typeof value !== "string" || !ALLOWED_ROLES.includes(value.toUpperCase())) {
        throw createError("Rol no es válido.");
    }

    return value.toUpperCase();
}

function validateHireDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw createError("Fecha de contratación no es válida.");
    }

    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
        throw createError("Fecha de contratación no es válida.");
    }

    return value;
}

function validateBaseSalary(value) {
    const salary = Number(value);
    if (
        !Number.isFinite(salary) ||
        salary <= 0 ||
        salary > 9999999999.99 ||
        Number(salary.toFixed(2)) !== salary
    ) {
        throw createError("Salario base no es válido.");
    }

    return salary;
}

export function validateCredentials(payload) {
    const body = validateRequiredObject(payload);

    return {
        email: validateEmail(body.email),
        password: validatePassword(body.password, 1)
    };
}

export function validateEmployeeId(value) {
    return validatePositiveInteger(value, "ID de empleado");
}

export function validateEmployeeRegistration(payload) {
    const body = validateRequiredObject(payload);

    return {
        branchId: validatePositiveInteger(body.branchId, "ID de sucursal"),
        email: validateEmail(body.email),
        password: validatePassword(body.password),
        role: validateRole(body.role),
        fullName: validateText(body.fullName, "Nombre completo", 100),
        jobTitle: validateText(body.jobTitle, "Puesto", 50),
        hireDate: validateHireDate(body.hireDate),
        baseSalary: validateBaseSalary(body.baseSalary)
    };
}
