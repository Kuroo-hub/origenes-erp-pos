import { Router } from "express";
import inventoryRoutes from "../modules/inventory/inventoryRoutes.js";
import cashFlowRouter from "../modules/cash-flow/cashflowRoutes.js";

const apiGateway = Router();

// Endpoint general de diagnóstico
apiGateway.get("/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "API de Orígenes SV funcionando correctamente."
    });
});

// Aquí registraremos las rutas de cada módulo:
apiGateway.use("/inventory", inventoryRoutes);
apiGateway.use("/cash-flow", cashFlowRouter);

export default apiGateway;