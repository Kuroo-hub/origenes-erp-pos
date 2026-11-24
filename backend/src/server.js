import "dotenv/config.js";

import app from "./app.js";
import {validateEnvironment} from "./config/environment.js";
import {pool, testDatabaseConnection} from "./config/database.js";

const PORT = Number(process.env.PORT || 3000);

async function startServer()
{
    try
    {
        validateEnvironment();

        if(!Number.isInteger(PORT) || PORT < 1 || PORT > 65535){
            throw new Error("PORT debe ser un puerto valido");
        }

        await testDatabaseConnection();

        app.listen(PORT, () => {
            console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
        });
    } catch(error)
    {
        console.error("Error al iniciar el servidor:", error.message);

        await pool.end();
        process.exitCode = 1;
    }
}

startServer();