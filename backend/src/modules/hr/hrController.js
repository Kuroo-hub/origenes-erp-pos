import {
    getEmployee,
    getEmployeePerformance,
    getEmployees,
    runPayroll
} from "./hrService.js";

export async function listEmployees(req, res, next) {
    try {
        const employees = await getEmployees();

        return res.status(200).json({
            success: true,
            data: employees
        });
    } catch (error) {
        return next(error);
    }
}

export async function getEmployeeById(req, res, next) {
    try {
        const employee = await getEmployee(req.params.id);

        return res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        return next(error);
    }
}

export async function getPerformanceByEmployeeId(req, res, next) {
    try {
        const performance = await getEmployeePerformance(req.params.id);

        return res.status(200).json({
            success: true,
            data: performance
        });
    } catch (error) {
        return next(error);
    }
}

export async function processPayroll(req, res, next) {
    try {
        const payroll = await runPayroll(req.body);

        return res.status(201).json({
            success: true,
            message: "La planilla fue procesada correctamente.",
            data: payroll
        });
    } catch (error) {
        return next(error);
    }
}
