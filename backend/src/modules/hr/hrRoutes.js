import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import {
    getEmployeeById,
    getPerformanceByEmployeeId,
    listEmployees,
    processPayroll
} from "./hrController.js";

const hrRoutes = Router();

const hrStaff = authorize("ADMINISTRATOR", "HR");

hrRoutes.get("/employees", authenticate, hrStaff, listEmployees);
hrRoutes.get("/employees/:id/performance", authenticate, hrStaff, getPerformanceByEmployeeId);
hrRoutes.get("/employees/:id", authenticate, hrStaff, getEmployeeById);
hrRoutes.post("/payrolls/run", authenticate, hrStaff, processPayroll);

export default hrRoutes;
