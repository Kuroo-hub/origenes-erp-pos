import { resolveBranchId } from "../../../utils/branchAccess.js";
import {
    registerSaleService,
    getSalesHistoryService,
    getSaleByIdService,
    cancelSaleService
} from "./salesService.js";

// POST: Registrar venta y emitir comprobante fiscal.
export async function registerSaleController(req, res) {
    const sale = await registerSaleService({
        customerId: req.body.customerId,
        customerData: req.body.customerData,
        branchId: resolveBranchId(req, req.body.branchId),
        employeeId: req.user.employeeId,
        shiftId: req.body.shiftId,
        documentType: req.body.documentType,
        paymentMethod: req.body.paymentMethod,
        paymentReference: req.body.paymentReference,
        isDelivery: req.body.isDelivery,
        deliveryStatus: req.body.deliveryStatus,
        deliveryAddress: req.body.deliveryAddress,
        deliveryPhone: req.body.deliveryPhone,
        items: req.body.items
    });

    return res.status(201).json({
        success: true,
        message: "Venta registrada y comprobante generado correctamente.",
        data: sale
    });
}

// GET: Consultar historial de ventas.
export async function getSalesHistoryController(req, res) {
    const sales = await getSalesHistoryService({
        limit: req.query.limit,
        offset: req.query.offset,
        branchId: resolveBranchId(req, req.query.branchId)
    });

    return res.status(200).json({
        success: true,
        message: "Historial de ventas consultado correctamente.",
        data: sales
    });
}

// GET: Consultar comprobante fiscal por ID de factura.
export async function getSaleByIdController(req, res) {
    const sale = await getSaleByIdService(req.params.id);

    resolveBranchId(req, sale?.branchId);

    return res.status(200).json({
        success: true,
        message: "Comprobante fiscal consultado correctamente.",
        data: sale
    });
}

// PATCH: Anular una factura.
export async function cancelSaleController(req, res) {
    const sale = await getSaleByIdService(req.params.id);
    resolveBranchId(req, sale?.branchId);

    const cancelledSale = await cancelSaleService(req.params.id);

    return res.status(200).json({
        success: true,
        message: "Factura anulada correctamente.",
        data: cancelledSale
    });
}
