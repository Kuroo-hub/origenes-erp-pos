import "dotenv/config";

const requiredVariables = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_SECRET",
    "JWT_EXPIRES_IN"
];

export function validateEnvironment() {
    for (const variable of requiredVariables) {
        if (!process.env[variable]) {
            throw new Error(
                `Missing environment variable: ${variable}`
            );
        }
    }

    const ports = [
        ["PORT", process.env.PORT || "3000"],
        ["DB_PORT", process.env.DB_PORT]
    ];

    for (const [name, value] of ports) {
        const port = Number(value);

        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error(`Invalid port: ${name}`);
        }
    }

    if (process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET debe tener al menos 32 caracteres.");
    }

    if (!/^\d+(?:s|m|h|d|w|y)$/.test(process.env.JWT_EXPIRES_IN)) {
        throw new Error("JWT_EXPIRES_IN debe tener un formato válido.");
    }
}

export const environment = {
    port: Number(process.env.PORT || 3000),
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    database: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    }
};