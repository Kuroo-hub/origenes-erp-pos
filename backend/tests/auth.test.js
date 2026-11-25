import assert from "node:assert/strict";
import test from "node:test";

process.env.DB_HOST ||= "localhost";
process.env.DB_PORT ||= "5432";
process.env.DB_NAME ||= "origenes_test";
process.env.DB_USER ||= "postgres";
process.env.DB_PASSWORD ||= "dummy";
process.env.JWT_SECRET ||= "test-secret-with-at-least-32-characters";
process.env.JWT_EXPIRES_IN ||= "15m";

const { authorize } = await import("../src/middlewares/authorize.js");
const { registerEmployeeService } = await import("../src/modules/auth/authService.js");
const { signAuthToken, verifyAuthToken } = await import("../src/modules/auth/token.js");
const {
    validateCredentials,
    validateEmployeeRegistration
} = await import("../src/modules/auth/authValidation.js");

const registrationPayload = {
    branchId: 1,
    email: "nuevo@origenessv.com",
    password: "Origenes123!",
    role: "employee",
    fullName: "Nuevo Empleado",
    jobTitle: "Cajero",
    hireDate: "2026-11-25",
    baseSalary: "500.50"
};

test("validateCredentials normaliza el correo", () => {
    const credentials = validateCredentials({
        email: " Admin@OrigenesSV.com ",
        password: "Origenes123!"
    });

    assert.equal(credentials.email, "admin@origenessv.com");
});

test("validateEmployeeRegistration rechaza contraseñas cortas", () => {
    assert.throws(
        () => validateEmployeeRegistration({ ...registrationPayload, password: "corta" }),
        /Contraseña no es válida/
    );
});

test("validateEmployeeRegistration normaliza rol y salario", () => {
    const employee = validateEmployeeRegistration(registrationPayload);

    assert.equal(employee.role, "EMPLOYEE");
    assert.equal(employee.baseSalary, 500.5);
});

test("signAuthToken y verifyAuthToken conservan la identidad", () => {
    const token = signAuthToken({
        employeeId: 1,
        email: "admin@origenessv.com",
        role: "ADMINISTRATOR",
        branchId: 2,
        fullName: "Ana Martínez"
    });

    const payload = verifyAuthToken(token);

    assert.equal(payload.sub, "1");
    assert.equal(payload.role, "ADMINISTRATOR");
    assert.equal(payload.branchId, 2);
});

test("authorize bloquea roles no permitidos", () => {
    let capturedError = null;
    const middleware = authorize("ADMINISTRATOR");

    middleware(
        { user: { role: "EMPLOYEE" } },
        {},
        (error) => {
            capturedError = error;
        }
    );

    assert.equal(capturedError.statusCode, 403);
});

test("registerEmployeeService exige administrador", async () => {
    await assert.rejects(
        () => registerEmployeeService(registrationPayload, { role: "EMPLOYEE" }),
        /No tienes permisos para crear empleados/
    );
});
