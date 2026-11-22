
import { Router } from "express";

import {
  openCashSessionController,
  activeCashSession,
  getCashSessionById,
  getCashSessionSummary,
  closeCashSession,
  addCashMovementController,
  getCashSessionHistory
} from "./cashflowController.js";

const cashFlowRouter = Router();

// 1. Abrir caja.
cashFlowRouter.post(
  "/sessions/open",
  openCashSessionController
);

// 2. Consultar sesiones abiertas.
cashFlowRouter.get(
  "/sessions/active",
  activeCashSession
);

// 3. Consultar historial.
// Debe ir antes de /:id para evitar que "history"
// sea interpretado como un identificador.
cashFlowRouter.get(
  "/sessions/history",
  getCashSessionHistory
);

// 4. Consultar resumen de una sesión.
cashFlowRouter.get(
  "/sessions/:id/summary",
  getCashSessionSummary
);

// 5. Cerrar sesión.
cashFlowRouter.post(
  "/sessions/:id/close",
  closeCashSession
);

// 6. Registrar movimiento.
cashFlowRouter.post(
  "/sessions/:id/movements",
  addCashMovementController
);

// 7. Consultar sesión por ID.
cashFlowRouter.get(
  "/sessions/:id",
  getCashSessionById
);

export default cashFlowRouter;
