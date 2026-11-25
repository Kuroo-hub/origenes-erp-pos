import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate.js";
import { authorize } from "../../../middlewares/authorize.js";
import { listPurchases, createPurchase } from "./purchasesController.js";

const router = Router();
const purchasesStaff = authorize("ADMINISTRATOR", "MANAGER", "INVENTORY_MANAGER");

router.get("/", authenticate, purchasesStaff, listPurchases);
router.post("/", authenticate, purchasesStaff, createPurchase);

export default router;
