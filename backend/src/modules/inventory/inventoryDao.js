import {pool} from '../../config/database.js';

export async function findAllBranches()
{
    const query = `
        SELECT branch_id, name, address, active
        FROM branch
        WHERE active = TRUE
        ORDER BY branch_id ASC
    `;

    const result = await pool.query(query);

    return result.rows;
}

export async function findAllIngredients()
{
    const query = 
        `SELECT ingredient_id, name, ingredient_type, unit 
        FROM ingredient 
        ORDER BY name ASC`;
    const result = await pool.query(query);

    return result.rows;
}

export async function findAllProducts()
{
    const query =
        `SELECT product_id, name, description, product_type, price, active
        FROM product
        ORDER BY name ASC`;

    const result = await pool.query(query);

    return result.rows;
}

export async function createIngredient(name, ingredientType, unit)
{
    const query = `INSERT INTO ingredient (name, ingredient_type, unit)
    VALUES ($1, $2, $3) RETURNING ingredient_id, name, ingredient_type, unit`;

    const values = [name, ingredientType, unit];

    const result = await pool.query(query, values);

    return result.rows[0];
}

export async function findStockByBranch(branchId)
{
    const query = `
        SELECT
            bi.inventory_id,
            bi.branch_id,
            b.name AS branch_name,
            bi.ingredient_id,
            i.name AS ingredient_name,
            i.ingredient_type,
            i.unit,
            bi.quantity,
            bi.minimum_stock,
            CASE
                WHEN bi.quantity <= bi.minimum_stock
                    THEN TRUE
                ELSE FALSE
            END AS low_stock
        FROM branch_inventory bi
        INNER JOIN branch b
            ON bi.branch_id = b.branch_id
        INNER JOIN ingredient i
            ON bi.ingredient_id = i.ingredient_id
        WHERE bi.branch_id = $1
        ORDER BY i.name ASC
    `;

    const result = await pool.query(query, [branchId]);

    return result.rows;
}

export async function findBranchById(client, branchId) {
    const result = await client.query(
        `SELECT branch_id
         FROM branch
         WHERE branch_id = $1 AND active = TRUE`,
        [branchId]
    );

    return result.rows[0];
}

export async function findIngredientById(client, ingredientId) {
    const result = await client.query(
        `SELECT ingredient_id
         FROM ingredient
         WHERE ingredient_id = $1`,
        [ingredientId]
    );

    return result.rows[0];
}

export async function increaseStock(client, branchId, ingredientId, quantity) {
    const query = `
        INSERT INTO branch_inventory (
            branch_id,
            ingredient_id,
            quantity,
            minimum_stock
        )
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (branch_id, ingredient_id)
        DO UPDATE SET
            quantity = branch_inventory.quantity + EXCLUDED.quantity
        RETURNING
            inventory_id,
            branch_id,
            ingredient_id,
            quantity,
            minimum_stock
    `;

    const result = await client.query(query, [
        branchId,
        ingredientId,
        quantity
    ]);

    return result.rows[0];
}

export async function insertInventoryMovement(client, branchId, ingredientId, quantity, reason, employeeId) {
    const query = `
        INSERT INTO inventory_movement (
            branch_id,
            ingredient_id,
            employee_id,
            movement_type,
            quantity,
            reason
        )
        VALUES ($1, $2, $5, 'IN', $3, $4)
        RETURNING *
    `;

    const result = await client.query(query, [
        branchId,
        ingredientId,
        quantity,
        reason,
        employeeId
    ]);

    return result.rows[0];
}

export async function decreaseStock(
    client,
    branchId,
    ingredientId,
    quantity
) {
    const query = `
        UPDATE branch_inventory
        SET quantity = quantity - $3
        WHERE branch_id = $1
          AND ingredient_id = $2
          AND quantity >= $3
        RETURNING
            inventory_id,
            branch_id,
            ingredient_id,
            quantity,
            minimum_stock
    `;

    const result = await client.query(query, [
        branchId,
        ingredientId,
        quantity
    ]);

    return result.rows[0];
}

export async function findInventoryByBranchAndIngredient(
    client,
    branchId,
    ingredientId
) {
    const query = `
        SELECT inventory_id, quantity
        FROM branch_inventory
        WHERE branch_id = $1
          AND ingredient_id = $2
    `;

    const result = await client.query(query, [
        branchId,
        ingredientId
    ]);

    return result.rows[0];
}

export async function insertStockOutMovement(
    client,
    branchId,
    ingredientId,
    quantity,
    reason,
    employeeId
) {
    const query = `
        INSERT INTO inventory_movement (
            branch_id,
            ingredient_id,
            employee_id,
            movement_type,
            quantity,
            reason
        )
        VALUES ($1, $2, $5, 'OUT', $3, $4)
        RETURNING *
    `;

    const result = await client.query(query, [
        branchId,
        ingredientId,
        quantity,
        reason,
        employeeId
    ]);

    return result.rows[0];
}

export async function findMovementsByBranch(branchId) {
    const query = `
        SELECT
            im.movement_id,
            im.branch_id,
            b.name AS branch_name,
            im.ingredient_id,
            i.name AS ingredient_name,
            i.unit,
            im.employee_id,
            im.movement_type,
            im.quantity,
            im.reason,
            im.created_at
        FROM inventory_movement im
        INNER JOIN branch b
            ON im.branch_id = b.branch_id
        INNER JOIN ingredient i
            ON im.ingredient_id = i.ingredient_id
        WHERE im.branch_id = $1
        ORDER BY im.created_at DESC, im.movement_id DESC
    `;

    const result = await pool.query(query, [branchId]);

    return result.rows;
}

export async function findLowStockByBranch(branchId) {
    const query = `
        SELECT
            bi.inventory_id,
            bi.branch_id,
            bi.ingredient_id,
            i.name AS ingredient_name,
            i.unit,
            bi.quantity,
            bi.minimum_stock,
            (bi.minimum_stock - bi.quantity) AS shortage
        FROM branch_inventory bi
        INNER JOIN ingredient i
            ON bi.ingredient_id = i.ingredient_id
        WHERE bi.branch_id = $1
          AND bi.quantity <= bi.minimum_stock
        ORDER BY bi.quantity ASC, i.name ASC
    `;

    const result = await pool.query(query, [branchId]);

    return result.rows;
}

export async function findProductById(productId) {
    const query = `
        SELECT
            product_id,
            name,
            description,
            product_type,
            price,
            active
        FROM product
        WHERE product_id = $1
    `;

    const result = await pool.query(query, [productId]);

    return result.rows[0];
}

export async function findRecipeByProduct(productId) {
    const query = `
        SELECT
            pi.product_id,
            pi.ingredient_id,
            i.name AS ingredient_name,
            i.ingredient_type,
            i.unit,
            pi.quantity
        FROM product_ingredient pi
        INNER JOIN ingredient i
            ON pi.ingredient_id = i.ingredient_id
        WHERE pi.product_id = $1
        ORDER BY i.name ASC
    `;

    const result = await pool.query(query, [productId]);

    return result.rows;
}

export async function findProductForRecipeUpdate(client, productId) {
    const query = `
        SELECT product_id, name, product_type
        FROM product
        WHERE product_id = $1
        FOR UPDATE
    `;

    const result = await client.query(query, [productId]);

    return result.rows[0];
}

export async function findExistingIngredientIds(client, ingredientIds) {
    const query = `
        SELECT ingredient_id
        FROM ingredient
        WHERE ingredient_id = ANY($1::integer[])
    `;

    const result = await client.query(query, [ingredientIds]);

    return result.rows.map(row => row.ingredient_id);
}

export async function replaceRecipeIngredients(
    client,
    productId,
    ingredients
) {
    await client.query(
        "DELETE FROM product_ingredient WHERE product_id = $1",
        [productId]
    );

    const query = `
        INSERT INTO product_ingredient (
            product_id,
            ingredient_id,
            quantity
        )
        VALUES ($1, $2, $3)
    `;

    for (const ingredient of ingredients) {
        await client.query(query, [
            productId,
            ingredient.ingredientId,
            ingredient.quantity
        ]);
    }
}

export async function findRecipeAvailability(
    branchId,
    productId,
    quantity
) {
    const query = `
        SELECT
            pi.ingredient_id,
            i.name AS ingredient_name,
            i.unit,
            pi.quantity AS quantity_per_product,
            pi.quantity * $3::INTEGER AS required_quantity,
            COALESCE(bi.quantity, 0) AS available_quantity,
            COALESCE(bi.quantity, 0) >=
                pi.quantity * $3::INTEGER AS sufficient
        FROM product_ingredient pi
        INNER JOIN ingredient i
            ON pi.ingredient_id = i.ingredient_id
        LEFT JOIN branch_inventory bi
            ON bi.ingredient_id = pi.ingredient_id
            AND bi.branch_id = $1
        WHERE pi.product_id = $2
        ORDER BY i.name ASC
    `;

    const result = await pool.query(query, [
        branchId,
        productId,
        quantity
    ]);

    return result.rows;
}

export async function findProductForConsumption(client, productId) {
    const query = `
        SELECT
            product_id,
            name,
            product_type,
            resale_ingredient_id,
            active
        FROM product
        WHERE product_id = $1
        FOR SHARE
    `;

    const result = await client.query(query, [productId]);

    return result.rows[0];
}

export async function findRecipeRequirements(
    client,
    productId,
    quantity
) {
    const query = `
        SELECT
            pi.ingredient_id,
            i.name AS ingredient_name,
            i.unit,
            pi.quantity AS quantity_per_product,
            pi.quantity * $2::INTEGER AS required_quantity
        FROM product_ingredient pi
        INNER JOIN ingredient i
            ON pi.ingredient_id = i.ingredient_id
        WHERE pi.product_id = $1
        ORDER BY pi.ingredient_id ASC
    `;

    const result = await client.query(query, [
        productId,
        quantity
    ]);

    return result.rows;
}


export async function insertConsumptionMovement(
    client,
    branchId,
    ingredientId,
    quantity,
    employeeId
) {
    const query = `
        INSERT INTO inventory_movement (
            branch_id,
            ingredient_id,
            employee_id,
            movement_type,
            quantity,
            reason
        )
        VALUES (
            $1,
            $2,
            $3,
            'CONSUMPTION',
            $4,
            'Consumo de ingredientes por venta'
        )
        RETURNING *
    `;

    const result = await client.query(query, [
        branchId,
        ingredientId,
        employeeId,
        quantity
    ]);

    return result.rows[0];
}

