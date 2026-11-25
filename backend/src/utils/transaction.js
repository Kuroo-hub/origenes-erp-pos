import { pool } from "../config/database.js";

export async function withTransaction(callback) {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
        await client.query("BEGIN");
        transactionStarted = true;

        const result = await callback(client);

        await client.query("COMMIT");
        transactionStarted = false;

        return result;
    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Error al ejecutar ROLLBACK:", rollbackError);
            }
        }

        throw error;
    } finally {
        client.release();
    }
}
