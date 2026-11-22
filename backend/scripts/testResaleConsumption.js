import { randomUUID } from "node:crypto";

import {
    validateEnvironment
} from "../src/config/environment.js";

import {
    pool
} from "../src/config/database.js";

import {
    consumeSaleProduct
} from "../src/modules/inventory/inventoryService.js";

async function testResaleConsumption() {
    validateEnvironment();

    let client;

    try {
        client = await pool.connect();

        await client.query("BEGIN");

        // Identificador único para nuestros datos temporales
        const testId = randomUUID().slice(0, 8);

        // 1. Crear artículo de inventario para reventa
        const ingredientResult = await client.query(
            `
            INSERT INTO ingredient (
                name,
                ingredient_type,
                unit
            )
            VALUES ($1, 'RESALE', 'unit')
            RETURNING ingredient_id
            `,
            [`Test Soda ${testId}`]
        );

        const ingredientId =
            ingredientResult.rows[0].ingredient_id;

        // 2. Crear producto de reventa
        const productResult = await client.query(
            `
            INSERT INTO product (
                name,
                description,
                product_type,
                resale_ingredient_id,
                price
            )
            VALUES ($1, $2, 'RESELL', $3, $4)
            RETURNING product_id
            `,
            [
                `Test Soda Product ${testId}`,
                "Producto temporal de prueba",
                ingredientId,
                1.50
            ]
        );

        const productId =
            productResult.rows[0].product_id;

        // 3. Registrar existencias iniciales
        await client.query(
            `
            INSERT INTO branch_inventory (
                branch_id,
                ingredient_id,
                quantity,
                minimum_stock
            )
            VALUES ($1, $2, $3, $4)
            `,
            [1, ingredientId, 10, 2]
        );

        console.log("Stock inicial: 10 unidades");

        // 4. Simular la venta de 3 unidades
        const result = await consumeSaleProduct(
            client,
            {
                branchId: 1,
                productId,
                quantity: 3,
                userId: null
            }
        );

        console.log(
            "Resultado del consumo:",
            JSON.stringify(result, null, 2)
        );

        // 5. Deshacer TODOS los datos de prueba
        await client.query("ROLLBACK");

        console.log(
            "ROLLBACK completado: no se conservaron los datos temporales."
        );

    } catch (error) {
        console.error("Error:", error.message);

        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Error al revertir:",
                    rollbackError.message
                );
            }
        }

    } finally {
        if (client) {
            client.release();
        }

        await pool.end();
    }
}

testResaleConsumption();