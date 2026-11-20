import express from "express";
import cors from "cors";

import { environment } from "./config/environment.js";
import apiGateway from "./gateway/apiGateway.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(cors({
    origin: environment.frontendUrl
}));

app.use(express.json({
    limit: "1mb"
}));

// Entrada central de nuestra API (Ejemplo si quieren le cambian el nombre)
app.use("/api/v1", apiGateway);

// Rutas no encontradas
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "La ruta solicitada no existe."
    });
});

// Manejo centralizado de errores
app.use(errorMiddleware);

export default app;