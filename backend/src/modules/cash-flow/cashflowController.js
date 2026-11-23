
import {
  openCashSessionService,
  getActiveCashSessionsService,
  getCashSessionByIdService,
  getCashSessionSummaryService,
  addCashMovementService,
  closeCashSessionService,
  getCashSessionHistoryService
} from "./cashflowService.js";

// 1. Abrir sesión de caja.
export async function openCashSessionController(req, res, next) {
  try {
    const session = await openCashSessionService({
      cashRegisterId: req.body.cashRegisterId,
      userId: req.user.id,
      initialAmount: req.body.initialAmount
    });

    return res.status(201).json({
      success: true,
      message: "Caja abierta correctamente.",
      data: session
    });
  } catch (error) {
    next(error);
  }
}

// 2. Consultar sesiones abiertas.
export async function activeCashSession(req, res, next) {
  try {
    const sessions = await getActiveCashSessionsService();

    return res.status(200).json({
      success: true,
      message: "Sesiones abiertas consultadas correctamente.",
      data: sessions
    });
  } catch (error) {
    next(error);
  }
}

// 3. Consultar sesión por ID.
export async function getCashSessionById(req, res, next) {
  try {
    const session = await getCashSessionByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Sesión consultada correctamente.",
      data: session
    });
  } catch (error) {
    next(error);
  }
}

// 4. Consultar resumen financiero.
export async function getCashSessionSummary(req, res, next) {
  try {
    const summary = await getCashSessionSummaryService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Resumen de caja consultado correctamente.",
      data: summary
    });
  } catch (error) {
    next(error);
  }
}

// 5. Registrar movimiento manual.
export async function addCashMovementController(req, res, next) {
  try {
    const movement = await addCashMovementService({
      sessionId: req.params.id,
      userId: req.user.id,
      type: req.body.type,
      amount: req.body.amount,
      concept: req.body.concept
    });

    return res.status(201).json({
      success: true,
      message: "Movimiento registrado correctamente.",
      data: movement
    });
  } catch (error) {
    next(error);
  }
}

// 6. Cerrar sesión.
export async function closeCashSession(req, res, next) {
  try {
    const result = await closeCashSessionService({
      sessionId: req.params.id,
      userId: req.user.id,
      realAmount: req.body.realAmount
    });

    return res.status(200).json({
      success: true,
      message: "Caja cerrada correctamente.",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// 7. Consultar historial.
export async function getCashSessionHistory(req, res, next) {
  try {
    const sessions = await getCashSessionHistoryService({
      limit: req.query.limit,
      offset: req.query.offset
    });

    return res.status(200).json({
      success: true,
      message: "Historial consultado correctamente.",
      data: sessions
    });
  } catch (error) {
    next(error);
  }
}
