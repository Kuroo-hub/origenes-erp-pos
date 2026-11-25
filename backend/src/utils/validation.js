import { createError } from "./errors.js";

export function validatePositiveInteger(value, fieldName = "ID") {
    if (value === null || value === undefined || value === "") {
        throw createError(`${fieldName} no es válido.`);
    }

    const text = String(value).trim();
    if (!/^\d+$/.test(text)) {
        throw createError(`${fieldName} no es válido.`);
    }

    const parsed = Number(text);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw createError(`${fieldName} no es válido.`);
    }

    return parsed;
}

export function validateId(value, fieldName = "ID") {
    const parsed = Number(value);

    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw createError(`${fieldName} no es válido.`);
    }

    return parsed;
}

export function parseBranchFilter(value) {
    if (value === undefined || value === null || value === "ALL") {
        return null;
    }

    if (typeof value === "number") {
        if (Number.isSafeInteger(value) && value > 0) {
            return value;
        }
        throw createError("ID de sucursal no válido.");
    }

    if (typeof value !== "string") {
        throw createError("ID de sucursal no válido.");
    }

    const text = value.trim();
    if (text === "ALL") {
        return null;
    }
    if (!/^\d+$/.test(text)) {
        throw createError("ID de sucursal no válido.");
    }

    const parsed = Number(text);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw createError("ID de sucursal no válido.");
    }

    return parsed;
}
