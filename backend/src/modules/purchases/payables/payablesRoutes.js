import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate.js";
import { authorize } from "../../../middlewares/authorize.js";
import { registerPayment } from "./payablesController.js";

const router = Router();
const payablesStaff = authorize("ADMINISTRATOR", "MANAGER", "INVENTORY_MANAGER");

router.post("/:payableId/payments", authenticate, payablesStaff, registerPayment);

export default router;
