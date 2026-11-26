import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { environment } from "./config/environment.js";
import apiGateway from "./gateway/apiGateway.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();
const readMethods = new Set(["GET", "HEAD", "OPTIONS"]);

app.use(cors({
    origin: environment.frontendUrl,
    credentials: true
}));

app.use(cookieParser());

app.use("/api/v1", (req, res, next) => {
    if (readMethods.has(req.method) || req.get("Origin") === environment.frontendUrl) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Origen de la solicitud no permitido."
    });
});

app.use(express.json({ limit: "1mb" }));

app.use("/api/v1", apiGateway);

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "La ruta solicitada no existe."
    });
});

app.use(errorMiddleware);

export default app;