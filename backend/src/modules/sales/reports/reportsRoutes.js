import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate.js";
import { authorize } from "../../../middlewares/authorize.js";
import { getDashboardController } from "./reportsController.js";

const router = Router();
const reportsManager = authorize("ADMINISTRATOR", "MANAGER");

router.get("/dashboard", authenticate, reportsManager, getDashboardController);

export default router;
