import { resolveBranchId } from "../../utils/branchAccess.js";
import {
    getEmployee,
    getEmployeePerformance,
    getEmployees,
    runPayroll
} from "./hrService.js";

export async function listEmployees(req, res) {
    const employees = await getEmployees(resolveBranchId(req, req.query.branchId));

    return res.status(200).json({
        success: true,
        data: employees
    });
}

export async function getEmployeeById(req, res) {
    const employee = await getEmployee(
        req.params.id,
        resolveBranchId(req, req.query.branchId ?? req.body.branchId)
    );

    return res.status(200).json({
        success: true,
        data: employee
    });
}

export async function getPerformanceByEmployeeId(req, res) {
    const performance = await getEmployeePerformance(
        req.params.id,
        resolveBranchId(req, req.query.branchId ?? req.body.branchId)
    );

    return res.status(200).json({
        success: true,
        data: performance
    });
}

export async function processPayroll(req, res) {
    const payroll = await runPayroll(
        req.body,
        resolveBranchId(req, req.query.branchId ?? req.body.branchId)
    );

    return res.status(201).json({
        success: true,
        message: "La planilla fue procesada correctamente.",
        data: payroll
    });
}
