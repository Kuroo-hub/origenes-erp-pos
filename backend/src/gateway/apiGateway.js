import { Router } from "express";
import inventoryRoutes from "../modules/inventory/inventoryRoutes.js";
import cashFlowRouter from "../modules/cash-flow/cashflowRoutes.js";
import salesRouter from "../modules/sales/salesRoutes.js";
import rrhhRouter from "../modules/hr/hrRoutes.js";

const apiGateway = Router();

// Endpoint general de diagnóstico
apiGateway.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API de Orígenes SV funcionando correctamente.",
  });
});

// Aquí registraremos las rutas de cada módulo:
apiGateway.use("/inventory", inventoryRoutes);
apiGateway.use("/cash-flow", cashFlowRouter);
apiGateway.use("/sales", salesRouter);
apiGateway.use("/hr", rrhhRouter);

export default apiGateway;
