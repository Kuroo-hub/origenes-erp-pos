import {
    registerSaleService,
    getSalesHistoryService,
    getSaleByIdService,
    cancelSaleService
} from "./salesService.js";

// POST: Registrar venta y emitir comprobante fiscal.
export async function registerSaleController(req, res, next) {
    try {
        const sale = await registerSaleService({
            customerId: req.body.customerId,
            branchId: req.body.branchId,
            userId: req.body.userId,
            shiftId: req.body.shiftId,
            documentType: req.body.documentType,
            paymentMethod: req.body.paymentMethod,
            paymentReference: req.body.paymentReference,
            items: req.body.items
        });

        return res.status(201).json({
            success: true,
            message: "Venta registrada y comprobante generado correctamente.",
            data: sale
        });

    } catch (error) {
        next(error);
    }
}

// GET: Consultar historial de ventas.
export async function getSalesHistoryController(req, res, next) {
    try {
        const sales = await getSalesHistoryService({
            limit: req.query.limit,
            offset: req.query.offset,
            branchId: req.query.branchId
        });

        return res.status(200).json({
            success: true,
            message: "Historial de ventas consultado correctamente.",
            data: sales
        });

    } catch (error) {
        next(error);
    }
}

// GET: Consultar comprobante fiscal por ID de factura.
export async function getSaleByIdController(req, res, next) {
    try {
        const sale = await getSaleByIdService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Comprobante fiscal consultado correctamente.",
            data: sale
        });

    } catch (error) {
        next(error);
    }
}

// PATCH: Anular una factura.
export async function cancelSaleController(req, res, next) {
    try {
        const cancelledSale = await cancelSaleService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Factura anulada correctamente.",
            data: cancelledSale
        });

    } catch (error) {
        next(error);
    }
}
