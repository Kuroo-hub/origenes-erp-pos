import jwt from "jsonwebtoken";
import { environment } from "../../config/environment.js";

export const TOKEN_ISSUER = "origenes-sv-api";
export const TOKEN_AUDIENCE = "origenes-sv-web";

export function signAuthToken(employee) {
    return jwt.sign(
        {
            email: employee.email,
            role: employee.role,
            branchId: employee.branchId,
            fullName: employee.fullName,
            jobTitle: employee.jobTitle ?? null
        },
        environment.jwtSecret,
        {
            subject: String(employee.employeeId),
            expiresIn: environment.jwtExpiresIn,
            issuer: TOKEN_ISSUER,
            audience: TOKEN_AUDIENCE
        }
    );
}

export function verifyAuthToken(token) {
    return jwt.verify(token, environment.jwtSecret, {
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE
    });
}
