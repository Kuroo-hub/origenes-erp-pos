import { Router } from "express";
import {
    registerSaleController,
    getSalesHistoryController,
    getSaleByIdController,
    cancelSaleController
} from "./salesController.js";

const router = Router();

router.post("/", registerSaleController);
router.get("/", getSalesHistoryController);
router.get("/:id", getSaleByIdController);
router.patch("/:id/cancel", cancelSaleController);

export default salesRouter;
