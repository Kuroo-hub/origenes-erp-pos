import { AppError } from "./AppError.js";

export function createError(message, statusCode = 400) {
    return new AppError(message, statusCode);
}
