
import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";

import {
  openCashSessionController,
  getCashRegistersByBranchController,
  activeCashSession,
  getCashSessionById,
  getCashSessionSummary,
  closeCashSession,
  addCashMovementController,
  getCashSessionHistory
} from "./cashflowController.js";

const cashFlowRouter = Router();

const cashier = authorize("ADMINISTRATOR", "MANAGER", "EMPLOYEE");
const staff = authorize("ADMINISTRATOR", "MANAGER", "EMPLOYEE", "HR", "INVENTORY_MANAGER");

cashFlowRouter.get("/registers", authenticate, cashier, getCashRegistersByBranchController);

// 1. Abrir caja.
cashFlowRouter.post(
  "/sessions/open",
  authenticate,
  cashier,
  openCashSessionController
);

// 2. Consultar sesiones abiertas.
cashFlowRouter.get(
  "/sessions/active",
  authenticate,
  staff,
  activeCashSession
);

// 3. Consultar historial.
// Debe ir antes de /:id para evitar que "history"
// sea interpretado como un identificador.
cashFlowRouter.get(
  "/sessions/history",
  authenticate,
  staff,
  getCashSessionHistory
);

// 4. Consultar resumen de una sesión.
cashFlowRouter.get(
  "/sessions/:id/summary",
  authenticate,
  staff,
  getCashSessionSummary
);

// 5. Cerrar sesión.
cashFlowRouter.post(
  "/sessions/:id/close",
  authenticate,
  cashier,
  closeCashSession
);

// 6. Registrar movimiento.
cashFlowRouter.post(
  "/sessions/:id/movements",
  authenticate,
  cashier,
  addCashMovementController
);

// 7. Consultar sesión por ID.
cashFlowRouter.get(
  "/sessions/:id",
  authenticate,
  staff,
  getCashSessionById
);

export default cashFlowRouter;
