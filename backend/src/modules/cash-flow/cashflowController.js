
import { resolveBranchId } from "../../utils/branchAccess.js";
import { parseBranchFilter } from "../../utils/validation.js";
import {
  openCashSessionService,
  getCashRegistersByBranchService,
  getActiveCashSessionsService,
  getCashSessionByIdService,
  getCashSessionSummaryService,
  addCashMovementService,
  closeCashSessionService,
  getCashSessionHistoryService
} from "./cashflowService.js";

function scopedBranchId(req) {
  return parseBranchFilter(resolveBranchId(req, req.query.branchId));
}

// 1. Abrir sesión de caja.
export async function openCashSessionController(req, res) {
  const session = await openCashSessionService({
    cashRegisterId: req.body.cashRegisterId,
    employeeId: req.user.employeeId,
    initialAmount: req.body.initialAmount,
    user: req.user
  });

  return res.status(201).json({
    success: true,
    message: "Caja abierta correctamente.",
    data: session
  });
}

export async function getCashRegistersByBranchController(req, res) {
  const registers = await getCashRegistersByBranchService(scopedBranchId(req));

  return res.status(200).json({
    success: true,
    data: registers
  });
}

// 2. Consultar sesiones abiertas.
export async function activeCashSession(req, res) {
  const sessions = await getActiveCashSessionsService({
    user: req.user,
    branchId: scopedBranchId(req)
  });

  return res.status(200).json({
    success: true,
    message: "Sesiones abiertas consultadas correctamente.",
    data: sessions
  });
}

// 3. Consultar sesión por ID.
export async function getCashSessionById(req, res) {
  const session = await getCashSessionByIdService(req.params.id, {
    user: req.user,
    branchId: scopedBranchId(req)
  });

  return res.status(200).json({
    success: true,
    message: "Sesión consultada correctamente.",
    data: session
  });
}

// 4. Consultar resumen financiero.
export async function getCashSessionSummary(req, res) {
  const summary = await getCashSessionSummaryService(req.params.id, {
    user: req.user,
    branchId: scopedBranchId(req)
  });

  return res.status(200).json({
    success: true,
    message: "Resumen de caja consultado correctamente.",
    data: summary
  });
}

// 5. Registrar movimiento manual.
export async function addCashMovementController(req, res) {
  const movement = await addCashMovementService({
    sessionId: req.params.id,
    employeeId: req.user.employeeId,
    type: req.body.type,
    amount: req.body.amount,
    concept: req.body.concept,
    branchId: scopedBranchId(req),
    user: req.user
  });

  return res.status(201).json({
    success: true,
    message: "Movimiento registrado correctamente.",
    data: movement
  });
}

// 6. Cerrar sesión.
export async function closeCashSession(req, res) {
  const result = await closeCashSessionService({
    sessionId: req.params.id,
    employeeId: req.user.employeeId,
    realAmount: req.body.realAmount,
    branchId: scopedBranchId(req),
    user: req.user
  });

  return res.status(200).json({
    success: true,
    message: "Caja cerrada correctamente.",
    data: result
  });
}

// 7. Consultar historial.
export async function getCashSessionHistory(req, res) {
  const sessions = await getCashSessionHistoryService({
    limit: req.query.limit,
    offset: req.query.offset,
    branchId: scopedBranchId(req),
    user: req.user
  });

  return res.status(200).json({
    success: true,
    message: "Historial consultado correctamente.",
    data: sessions
  });
}
