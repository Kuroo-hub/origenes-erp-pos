import {
    getCurrentEmployeeService,
    loginService,
    registerEmployeeService
} from "./authService.js";

export async function loginController(req, res, next) {
    try {
        const session = await loginService(req.body);

        return res.status(200).json({
            success: true,
            message: "Sesión iniciada correctamente.",
            data: session
        });
    } catch (error) {
        next(error);
    }
}

export async function registerEmployeeController(req, res, next) {
    try {
        const employee = await registerEmployeeService(req.body, req.user);

        return res.status(201).json({
            success: true,
            message: "Empleado creado correctamente.",
            data: employee
        });
    } catch (error) {
        next(error);
    }
}

export async function getCurrentEmployeeController(req, res, next) {
    try {
        const employee = await getCurrentEmployeeService(req.user.employeeId);

        return res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        next(error);
    }
}
