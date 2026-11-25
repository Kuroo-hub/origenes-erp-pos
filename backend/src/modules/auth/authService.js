import { AppError } from "../../utils/AppError.js";
import { environment } from "../../config/environment.js";
import {
    authenticateEmployee,
    createEmployee,
    findActiveBranchById,
    findActiveEmployeeById,
    findEmployeeByEmail
} from "./authDao.js";
import { signAuthToken } from "./token.js";
import {
    validateCredentials,
    validateEmployeeId,
    validateEmployeeRegistration
} from "./authValidation.js";

function createError(message, statusCode = 400) {
    return new AppError(message, statusCode);
}

function toAuthUser(employee) {
    return {
        employeeId: Number(employee.employeeId),
        email: employee.email,
        role: employee.role,
        branchId: Number(employee.branchId),
        fullName: employee.fullName
    };
}

function toEmployeeProfile(employee) {
    return {
        ...toAuthUser(employee),
        jobTitle: employee.jobTitle,
        hireDate: employee.hireDate,
        baseSalary: Number(employee.baseSalary),
        active: employee.active,
        createdAt: employee.createdAt
    };
}

export async function loginService(payload) {
    const credentials = validateCredentials(payload);
    const employee = await authenticateEmployee(credentials.email, credentials.password);

    if (!employee) {
        throw createError("Credenciales inválidas.", 401);
    }

    return {
        token: signAuthToken(employee),
        tokenType: "Bearer",
        expiresIn: environment.jwtExpiresIn,
        user: toAuthUser(employee)
    };
}

export async function registerEmployeeService(payload, actor) {
    if (!actor || actor.role !== "ADMINISTRATOR") {
        throw createError("No tienes permisos para crear empleados.", 403);
    }

    const employeeData = validateEmployeeRegistration(payload);
    const branch = await findActiveBranchById(employeeData.branchId);
    if (!branch) {
        throw createError("La sucursal no existe o está inactiva.");
    }

    const existingEmployee = await findEmployeeByEmail(employeeData.email);
    if (existingEmployee) {
        throw createError("El correo electrónico ya está registrado.", 409);
    }

    try {
        const employee = await createEmployee(employeeData);
        return toEmployeeProfile(employee);
    } catch (error) {
        if (error.code === "23505") {
            throw createError("El correo electrónico ya está registrado.", 409);
        }

        throw error;
    }
}

export async function getCurrentEmployeeService(employeeId) {
    const id = validateEmployeeId(employeeId);
    const employee = await findActiveEmployeeById(id);

    if (!employee) {
        throw createError("Credenciales inválidas.", 401);
    }

    return toAuthUser(employee);
}
