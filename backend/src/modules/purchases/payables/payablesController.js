import { registerPaymentService } from "./payablesService.js";

export async function registerPayment(req, res) {
    const payment = await registerPaymentService(req.params.payableId, req.body, req.user);

    return res.status(201).json({
        success: true,
        message: "Pago registrado correctamente.",
        data: payment
    });
}
