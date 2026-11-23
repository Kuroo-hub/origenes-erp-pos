import { Router } from "express";
import {
    getEmployeeById,
    listEmployees,
    processPayroll
} from "./hrController.js";

const hrRoutes = Router();

hrRoutes.get("/employees", listEmployees);
hrRoutes.get("/employees/:id", getEmployeeById);
hrRoutes.post("/payrolls/run", processPayroll);

export default hrRoutes;
