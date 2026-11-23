import { Router } from "express";
import inventoryRoutes from "../modules/inventory/inventoryRoutes.js";

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

export default apiGateway;