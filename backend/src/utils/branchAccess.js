import { createError } from "./errors.js";

export function resolveBranchId(req, requestedBranchId) {
    const userBranchId = Number(req?.user?.branchId);

    if (!Number.isSafeInteger(userBranchId) || userBranchId <= 0) {
        throw createError("No se pudo determinar la sucursal del usuario.", 403);
    }

    if (req?.user?.role === "ADMINISTRATOR") {
        return requestedBranchId;
    }

    if (
        requestedBranchId !== undefined &&
        requestedBranchId !== null &&
        String(requestedBranchId).trim() !== "" &&
        String(requestedBranchId).trim().toUpperCase() !== "ALL"
    ) {
        const requested = Number(requestedBranchId);
        if (!Number.isSafeInteger(requested) || requested <= 0 || requested !== userBranchId) {
            throw createError("No tiene permisos para acceder a otra sucursal.", 403);
        }
    }

    return userBranchId;
}
