import { resolveBranchId } from "../../../utils/branchAccess.js";
import { listPurchasesService, createPurchaseService } from "./purchasesService.js";

export async function listPurchases(req, res) {
    const purchases = await listPurchasesService({
        branchId: resolveBranchId(req, req.query.branchId)
    });

    return res.status(200).json({
        success: true,
        message: "Compras consultadas correctamente.",
        data: purchases
    });
}

export async function createPurchase(req, res) {
    const branchId = resolveBranchId(req, req.body.branchId);
    const purchase = await createPurchaseService(
        { ...req.body, branchId },
        req.user.employeeId
    );

    return res.status(201).json({
        success: true,
        message: "Compra registrada correctamente.",
        data: purchase
    });
}
