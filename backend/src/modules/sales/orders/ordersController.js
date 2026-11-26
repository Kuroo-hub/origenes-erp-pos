import { resolveBranchId } from "../../../utils/branchAccess.js";
import {
    getDeliveryOrdersService,
    updateDeliveryStatusService,
    updateKitchenStatusService
} from "./ordersService.js";

export async function getDeliveryOrdersController(req, res) {
    const orders = await getDeliveryOrdersService({
        branchId: resolveBranchId(req, req.query.branchId)
    });

    return res.status(200).json({
        success: true,
        data: orders
    });
}

export async function patchDeliveryStatusController(req, res) {
    const order = await updateDeliveryStatusService(
        req.params.orderId,
        req.body,
        req.user
    );

    return res.status(200).json({
        success: true,
        data: order
    });
}

export async function patchKitchenStatusController(req, res) {
    const order = await updateKitchenStatusService(
        req.params.invoiceId,
        req.body,
        req.user
    );

    return res.status(200).json({
        success: true,
        message: "Estado de cocina actualizado.",
        data: order
    });
}
