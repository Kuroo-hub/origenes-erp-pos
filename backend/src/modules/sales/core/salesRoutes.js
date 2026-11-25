import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate.js";
import { authorize } from "../../../middlewares/authorize.js";
import {
    registerSaleController,
    getSalesHistoryController,
    getSaleByIdController,
    cancelSaleController
} from "./salesController.js";

const router = Router();

const salesStaff = authorize("ADMINISTRATOR", "MANAGER", "EMPLOYEE", "HR", "INVENTORY_MANAGER");
const salesManager = authorize("ADMINISTRATOR", "MANAGER");

router.post("/", authenticate, salesStaff, registerSaleController);
router.get("/", authenticate, salesStaff, getSalesHistoryController);
router.get("/:id", authenticate, salesStaff, getSaleByIdController);
router.patch("/:id/cancel", authenticate, salesManager, cancelSaleController);

export default router;