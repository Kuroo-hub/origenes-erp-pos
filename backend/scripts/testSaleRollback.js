
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";

import { pool } from "../src/config/database.js";
import { validateEnvironment } from "../src/config/environment.js";
import { consumeSaleProduct } from "../src/modules/inventory/inventoryService.js";

async function testSaleRollback() {
    validateEnvironment();

    const client = await pool.connect();
    const testCode = randomUUID().slice(0, 8);

    const ingredientName = `Test Inventory ${testCode}`;
    let transactionStarted = false;

    try {
        await client.query("BEGIN");
        transactionStarted = true;

        // 1. Crear un ingrediente temporal
        const ingredientResult = await client.query(
            `
            INSERT INTO ingredient (name, ingredient_type, unit)
            VALUES ($1, 'RESALE', 'unit')
            RETURNING ingredient_id
            `,
            [ingredientName]
        );

        const ingredientId =
            ingredientResult.rows[0].ingredient_id;

        // 2. Crear dos productos que utilizan el mismo inventario
        const productIds = [];

        for (const productName of [
            `Test Product A ${testCode}`,
            `Test Product B ${testCode}`
        ]) {
            const result = await client.query(
                `
                INSERT INTO product (
                    name,
                    product_type,
                    resale_ingredient_id,
                    price
                )
                VALUES ($1, 'RESELL', $2, 1.50)
                RETURNING product_id
                `,
                [productName, ingredientId]
            );

            productIds.push(result.rows[0].product_id);
        }

        // 3. Inventario inicial: 10 unidades
        await client.query(
            `
            INSERT INTO branch_inventory (
                branch_id,
                ingredient_id,
                quantity,
                minimum_stock
            )
            VALUES (1, $1, 10, 2)
            `,
            [ingredientId]
        );

        console.log("Stock inicial: 10 unidades");

        // 4. Primer producto: descuento exitoso
        await consumeSaleProduct(client, {
            branchId: 1,
            productId: productIds[0],
            quantity: 3,
            userId: null
        });

        const stockResult = await client.query(
            `
            SELECT quantity
            FROM branch_inventory
            WHERE branch_id = 1
              AND ingredient_id = $1
            `,
            [ingredientId]
        );

        assert.equal(
            Number(stockResult.rows[0].quantity),
            7
        );

        console.log("Producto A: descuento exitoso. Stock: 7");

        // 5. Segundo producto: debe fallar
        let failureDetected = false;

        try {
            await consumeSaleProduct(client, {
                branchId: 1,
                productId: productIds[1],
                quantity: 20,
                userId: null
            });
        } catch (error) {
            assert.equal(error.statusCode, 409);
            failureDetected = true;

            console.log(
                "Producto B: error esperado:",
                error.message
            );
        }

        assert.equal(
            failureDetected,
            true,
            "Se esperaba un error de stock insuficiente."
        );

        // 6. Revertir toda la operación
        await client.query("ROLLBACK");
        transactionStarted = false;

        console.log("ROLLBACK ejecutado correctamente.");

        // 7. Verificar que no quedaron datos temporales
        const verification = await client.query(
            `
            SELECT COUNT(*)::INTEGER AS total
            FROM ingredient
            WHERE name = $1
            `,
            [ingredientName]
        );

        assert.equal(verification.rows[0].total, 0);

        console.log(
            "Prueba superada: todos los cambios temporales fueron revertidos."
        );

    } finally {
        if (transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (error) {
                console.error("Error al revertir:", error.message);
            }
        }

        client.release();
    }
}

try {
    await testSaleRollback();
} catch (error) {
    console.error("Prueba fallida:", error);
    process.exitCode = 1;
} finally {
    await pool.end();
}
