import { AppError } from "../utils/AppError.js";

export function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError("Autenticación requerida.", 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError("No tienes permisos para realizar esta acción.", 403));
        }

        return next();
    };
}
