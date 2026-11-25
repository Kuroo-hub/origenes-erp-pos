import { AppError } from "../utils/AppError.js";
import { findActiveEmployeeById } from "../modules/auth/authDao.js";
import { ALLOWED_ROLES } from "../modules/auth/authValidation.js";
import { verifyAuthToken } from "../modules/auth/token.js";

function createError(message, statusCode = 400) {
    return new AppError(message, statusCode);
}

export async function authenticate(req, res, next) {
    let employeeId;
    let payload;

    try {
        const header = req.get("authorization");
        if (!header) {
            throw createError("Token de acceso requerido.", 401);
        }

        const [scheme, token, ...extra] = header.trim().split(/\s+/);
        if (scheme.toLowerCase() !== "bearer" || !token || extra.length > 0) {
            throw createError("Token de acceso inválido.", 401);
        }

        payload = verifyAuthToken(token);
        employeeId = Number(payload.sub);

        if (
            !Number.isSafeInteger(employeeId) ||
            employeeId <= 0 ||
            typeof payload.role !== "string" ||
            !ALLOWED_ROLES.includes(payload.role)
        ) {
            throw createError("Token de acceso inválido.", 401);
        }
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }

        return next(createError("Token de acceso inválido o expirado.", 401));
    }

    try {
        const employee = await findActiveEmployeeById(employeeId);
        const tokenBranchId = Number(payload.branchId);

        if (
            !employee ||
            employee.role !== payload.role ||
            !Number.isSafeInteger(tokenBranchId) ||
            Number(employee.branchId) !== tokenBranchId
        ) {
            return next(createError("Token de acceso inválido o expirado.", 401));
        }

        req.user = {
            employeeId,
            email: employee.email,
            role: employee.role,
            branchId: Number(employee.branchId),
            fullName: employee.fullName,
            jobTitle: employee.jobTitle ?? null
        };

        return next();
    } catch (error) {
        return next(error);
    }
}
