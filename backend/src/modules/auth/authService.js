import { createError } from "../../utils/errors.js";
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

function toAuthUser(employee) {
    return {
        employeeId: Number(employee.employeeId),
        email: employee.email,
        role: employee.role,
        branchId: Number(employee.branchId),
        fullName: employee.fullName,
        jobTitle: employee.jobTitle ?? null
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
    const existingEmployee = await findEmployeeByEmail(credentials.email);

    if (!existingEmployee) {
        throw createError("Usuario no encontrado.", 404);
    }

    if (!existingEmployee.active) {
        throw createError("Usuario inactivo.", 403);
    }

    const employee = await authenticateEmployee(credentials.email, credentials.password);

    if (!employee) {
        throw createError("Contraseña incorrecta.", 401);
    }

    return {
        token: signAuthToken(employee),
        tokenType: "Bearer",
        expiresIn: environment.jwtExpiresIn,
        user: toAuthUser(employee)
    };
}

export async function registerEmployeeService(payload, actor) {
    if (!actor || !["ADMINISTRATOR", "HR"].includes(actor.role)) {
        throw createError("No tienes permisos para crear empleados.", 403);
    }

    const employeeData = validateEmployeeRegistration(payload);

    if (actor.role === "HR" && !["EMPLOYEE", "MANAGER", "HR", "INVENTORY_MANAGER"].includes(employeeData.role)) {
        throw createError("RRHH solo puede crear empleados con roles operativos.", 403);
    }

    if (actor.role !== "ADMINISTRATOR" && Number(employeeData.branchId) !== Number(actor.branchId)) {
        throw createError("No tiene permisos para crear empleados en otra sucursal.", 403);
    }

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
