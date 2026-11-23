import {
    validateEnvironment
} from "../src/config/environment.js";

import {
    pool
} from "../src/config/database.js";

import {
    consumePreparedProduct
} from "../src/modules/inventory/inventoryService.js";

import {
    consumeSaleProduct
} from "../src/modules/inventory/inventoryService.js";

async function testConsumption() {
    validateEnvironment();

    const branchId = 1;
    const productId = 1;
    const quantity = 1;

    let client;
    let transactionStarted = false;

    try {
        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        console.log("Iniciando prueba de consumo...");

        const result = await consumeSaleProduct(
            client,
            {
                branchId,
                productId,
                quantity,
                userId: null
            }
        );

        console.log(
            "Resultado dentro de la transacción:",
            JSON.stringify(result, null, 2)
        );

        // Deshacemos la prueba intencionalmente.
        await client.query("ROLLBACK");
        transactionStarted = false;

        console.log(
            "ROLLBACK ejecutado: los consumos de prueba no se guardaron."
        );

    } catch (error) {
        console.error("Error en la prueba:", error.message);

        if (client && transactionStarted) {
            await client.query("ROLLBACK");
            transactionStarted = false;
        }

    } finally {
        if (client) {
            if (transactionStarted) {
                try {
                    await client.query("ROLLBACK");
                } catch (error) {
                    console.error("Error al revertir:", error.message);
                }
            }

            client.release();
        }

        await pool.end();
    }
}

testConsumption();