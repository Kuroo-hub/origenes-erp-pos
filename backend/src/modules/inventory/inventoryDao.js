import {pool} from '../../config/database.js';

export async function findAllIngredients()
{
    const result = await pool.query(
        `SELECT id, nombre, unidad, costo_unitario, estado 
        FROM ingredientes 
        ORDER BY nombre ASC` 
    );

    return result.rows;
}