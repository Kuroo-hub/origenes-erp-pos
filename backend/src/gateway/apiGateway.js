import { Router } from "express";

const apiGateway = Router();

// Endpoint general de diagnóstico
apiGateway.get("/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "API de Orígenes SV funcionando correctamente."
    });
});

// Aquí registraremos las rutas de cada módulo:

// apiGateway.use("/auth", authRoutes);(Ejemplo)

export default apiGateway;