import {
    getCurrentEmployeeService,
    loginService,
    registerEmployeeService
} from "./authService.js";
import { AUTH_COOKIE_NAME, authCookieOptions } from "../../config/cookies.js";
import { verifyAuthToken } from "./token.js";

export async function loginController(req, res) {
    const { token, user } = await loginService(req.body);
    const { exp } = verifyAuthToken(token);

    res.cookie(AUTH_COOKIE_NAME, token, {
        ...authCookieOptions,
        expires: new Date(exp * 1000)
    });

    return res.status(200).json({
        success: true,
        message: "Sesion iniciada correctamente.",
        data: { user }
    });
}

export function logoutController(req, res)
{
    res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
    return res.status(204).end();
}

export async function registerEmployeeController(req, res) {
    const employee = await registerEmployeeService(req.body, req.user);

    return res.status(201).json({
        success: true,
        message: "Empleado creado correctamente.",
        data: employee
    });
}

export async function getCurrentEmployeeController(req, res) {
    const employee = await getCurrentEmployeeService(req.user.employeeId);

    return res.status(200).json({
        success: true,
        data: employee
    });
}
