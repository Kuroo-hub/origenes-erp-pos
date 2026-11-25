import { Router } from "express";
import authRouter from "../modules/auth/authRoutes.js";
import inventoryRoutes from "../modules/inventory/inventoryRoutes.js";
import cashFlowRouter from "../modules/cash-flow/cashflowRoutes.js";
import salesRouter from "../modules/sales/core/salesRoutes.js";
import rrhhRouter from "../modules/hr/hrRoutes.js";
import purchasesRoutes from "../modules/purchases/core/purchasesRoutes.js";
import payablesRoutes from "../modules/purchases/payables/payablesRoutes.js";
import reportsRoutes from "../modules/sales/reports/reportsRoutes.js";
import ordersRoutes from "../modules/sales/orders/ordersRoutes.js";

const apiGateway = Router();

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
apiGateway.use("/purchases", purchasesRoutes);
apiGateway.use("/payables", payablesRoutes);
apiGateway.use("/reports", reportsRoutes);
apiGateway.use("/orders", ordersRoutes);

export default apiGateway;
