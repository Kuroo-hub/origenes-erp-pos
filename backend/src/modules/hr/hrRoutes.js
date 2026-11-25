import { Router } from "express";
import {
    getEmployeeById,
    getPerformanceByEmployeeId,
    listEmployees,
    processPayroll
} from "./hrController.js";

const hrRoutes = Router();

hrRoutes.get("/employees", listEmployees);
hrRoutes.get("/employees/:id/performance", getPerformanceByEmployeeId);
hrRoutes.get("/employees/:id", getEmployeeById);
hrRoutes.post("/payrolls/run", processPayroll);

export default hrRoutes;
