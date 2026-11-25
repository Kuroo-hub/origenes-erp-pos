import { Router } from "express";
import authRouter from "../modules/auth/authRoutes.js";
import inventoryRoutes from "../modules/inventory/inventoryRoutes.js";
import cashFlowRouter from "../modules/cash-flow/cashflowRoutes.js";
import salesRouter from "../modules/sales/salesRoutes.js";
import rrhhRouter from "../modules/hr/hrRoutes.js";

const apiGateway = Router();

function notImplemented(moduleName) {
  return (req, res) => {
    return res.status(501).json({
      success: false,
      message: `El módulo ${moduleName} aún no está implementado en la API.`
    });
  };
}

// Endpoint general de diagnóstico
apiGateway.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API de Orígenes SV funcionando correctamente.",
  });
});

// Aquí registraremos las rutas de cada módulo:
apiGateway.use("/auth", authRouter);
apiGateway.use("/inventory", inventoryRoutes);
apiGateway.use("/cash-flow", cashFlowRouter);
apiGateway.use("/sales", salesRouter);
apiGateway.use("/hr", rrhhRouter);

apiGateway.get("/purchases", notImplemented("de compras"));
apiGateway.post("/purchases", notImplemented("de compras"));
apiGateway.post("/payables/:payableId/payments", notImplemented("de cuentas por pagar"));
apiGateway.get("/orders/delivery", notImplemented("de entregas"));
apiGateway.patch("/orders/:orderId/delivery-status", notImplemented("de entregas"));
apiGateway.get("/reports/dashboard", notImplemented("de reportes"));

export default apiGateway;
