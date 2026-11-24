import pg from "pg";
import { environment } from "./environment.js";

const { Pool } = pg;

export const pool = new Pool({
    host: environment.database.host,
    port: environment.database.port,
    database: environment.database.name,
    user: environment.database.user,
    password: environment.database.password,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

export async function testDatabaseConnection() {
    const result = await pool.query(
        "SELECT current_database() AS database_name"
    );

    console.log(
        `PostgreSQL connected: ${result.rows[0].database_name}`
    );
}