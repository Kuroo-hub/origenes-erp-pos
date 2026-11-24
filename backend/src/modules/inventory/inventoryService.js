import {pool} from '../../config/database.js';

import {findAllIngredients, createIngredient, findStockByBranch, 
findBranchById, findIngredientById, increaseStock, insertInventoryMovement, decreaseStock,
findInventoryByBranchAndIngredient, insertStockOutMovement, findMovementsByBranch,
findLowStockByBranch, findProductById, findRecipeByProduct, findProductForRecipeUpdate,
findExistingIngredientIds, replaceRecipeIngredients, findRecipeAvailability, findProductForConsumption,
findRecipeRequirements, consumeIngredientStock, insertConsumptionMovement
} from './inventoryDao.js';

import {AppError} from '../../utils/AppError.js';

export async function registerIngredient(data)
{
    const {name, ingredientType, unit} = data;

    if(typeof name !== "string" || typeof ingredientType !== "string" || typeof unit !== "string")
        {
            throw new AppError("El nombre, tipo y unidad son obligatorios.", 400);
        }

    const cleanName = name.trim();
    const cleanUnit = unit.trim();

    if(!cleanName || !cleanUnit)
        {
            throw new AppError("El nombre y la unidad no pueden estar vacíos.", 400);
        }

    if (cleanName.length > 100 || cleanUnit.length > 30) {
       throw new AppError(
        "El nombre o la unidad exceden la longitud permitida.",
        400
       );
    }
    const allowedTypes = [
        "RAW_MATERIAL",
        "PACKAGING",
        "RESALE"
    ];

    if(!allowedTypes.includes(ingredientType))
        {
            throw new AppError("El tipo de ingrediente no es valido.", 400);
        }

    try{
        return await createIngredient(cleanName, ingredientType, cleanUnit);
    }catch(error)
    {
        if(error.code === "23505")
            {
                throw new AppError("Ya existe un ingrediente con ese nombre.", 409);
            }

        throw error;
    }
}

export async function getAllIngredients()
{
    const ingredients = await findAllIngredients();

    return ingredients;
}

export async function getStockByBranch(branchId)
{
    const id = Number(branchId);

    if(!Number.isSafeInteger(id) || id <= 0)
    {
        throw new AppError("El ID de la sucursal no es valido.", 400);
    }

    const stock = await findStockByBranch(id);

    return stock;
}

export async function registerStockEntry(branchId, data) {
    const id = Number(branchId);
    const ingredientId = Number(data?.ingredientId);
    const quantity = Number(data?.quantity);
    const reason = data?.reason;

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError(
            "El ID de la sucursal no es válido.",
            400
        );
    }

    if (!Number.isSafeInteger(ingredientId) || ingredientId <= 0) {
        throw new AppError(
            "El ID del ingrediente no es válido.",
            400
        );
    }

    if (
        data?.quantity === undefined ||
        data?.quantity === null ||
        data?.quantity === "" ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isInteger(quantity * 1000)
    ) {
        throw new AppError(
            "La cantidad debe ser positiva y tener como máximo tres decimales.",
            400
        );
    }

    if (
        reason !== undefined &&
        (typeof reason !== "string" || reason.length > 255)
    ) {
        throw new AppError(
            "El motivo debe ser un texto de máximo 255 caracteres.",
            400
        );
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const branch = await findBranchById(client, id);

        if (!branch) {
            throw new AppError(
                "La sucursal no existe o está inactiva.",
                404
            );
        }

        const ingredient = await findIngredientById(
            client,
            ingredientId
        );

        if (!ingredient) {
            throw new AppError(
                "El ingrediente no existe.",
                404
            );
        }

        const stock = await increaseStock(
            client,
            id,
            ingredientId,
            quantity
        );

        const movement = await insertInventoryMovement(
            client,
            id,
            ingredientId,
            quantity,
            reason?.trim() || null
        );

        await client.query("COMMIT");

        return {
            stock,
            movement
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
}

export async function registerStockExit(branchId, data) {
    const id = Number(branchId);
    const ingredientId = Number(data?.ingredientId);
    const quantity = Number(data?.quantity);
    const reason = data?.reason;

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError(
            "El ID de la sucursal no es válido.",
            400
        );
    }

    if (!Number.isSafeInteger(ingredientId) || ingredientId <= 0) {
        throw new AppError(
            "El ID del ingrediente no es válido.",
            400
        );
    }

    if (
        data?.quantity === undefined ||
        data?.quantity === null ||
        data?.quantity === "" ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        quantity > 999999999.999 ||
        !Number.isInteger(Number(quantity.toFixed(3)) * 1000)
    ) {
        throw new AppError(
            "La cantidad debe ser positiva y tener como máximo tres decimales.",
            400
        );
    }

    if (
        typeof reason !== "string" ||
        !reason.trim() ||
        reason.length > 255
    ) {
        throw new AppError(
            "Debe indicar un motivo válido de máximo 255 caracteres.",
            400
        );
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const branch = await findBranchById(client, id);

        if (!branch) {
            throw new AppError(
                "La sucursal no existe o está inactiva.",
                404
            );
        }

        const ingredient = await findIngredientById(
            client,
            ingredientId
        );

        if (!ingredient) {
            throw new AppError(
                "El ingrediente no existe.",
                404
            );
        }

        const stock = await decreaseStock(
            client,
            id,
            ingredientId,
            quantity
        );

        if (!stock) {
            const inventory = await findInventoryByBranchAndIngredient(
                client,
                id,
                ingredientId
            );

            if (!inventory) {
                throw new AppError(
                    "El ingrediente no tiene existencias registradas en esta sucursal.",
                    404
                );
            }

            throw new AppError(
                "Stock insuficiente para realizar la salida.",
                409
            );
        }

        const movement = await insertStockOutMovement(
            client,
            id,
            ingredientId,
            quantity,
            reason.trim()
        );

        await client.query("COMMIT");

        return {
            stock,
            movement
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
}

export async function getMovementsByBranch(branchId) {
    const id = Number(branchId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError(
            "El ID de la sucursal no es válido.",
            400
        );
    }

    const movements = await findMovementsByBranch(id);

    return movements;
}

export async function getLowStockByBranch(branchId) {
    const id = Number(branchId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError(
            "El ID de la sucursal no es válido.",
            400
        );
    }

    return await findLowStockByBranch(id);
}

export async function getProductRecipe(productId) {
    const id = Number(productId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError(
            "El ID del producto no es válido.",
            400
        );
    }

    const product = await findProductById(id);

    if (!product) {
        throw new AppError(
            "El producto no existe.",
            404
        );
    }

    if (product.product_type !== "PREPARED") {
        throw new AppError(
            "Este producto es de reventa y no utiliza una receta.",
            409
        );
    }

    const ingredients = await findRecipeByProduct(id);

    return {
        product,
        ingredients
    };
}

export async function saveProductRecipe(productId, data) {
    const id = Number(productId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError(
            "El ID del producto no es válido.",
            400
        );
    }

    if (
        !data ||
        !Array.isArray(data.ingredients) ||
        data.ingredients.length === 0
    ) {
        throw new AppError(
            "La receta debe contener al menos un ingrediente.",
            400
        );
    }

    const ingredients = [];
    const uniqueIds = new Set();

    for (const item of data.ingredients) {
        const ingredientId = Number(item?.ingredientId);
        const quantity = String(item?.quantity ?? "");

        if (
            !Number.isSafeInteger(ingredientId) ||
            ingredientId <= 0
        ) {
            throw new AppError(
                "Uno de los IDs de ingredientes no es válido.",
                400
            );
        }

        // Compatible con NUMERIC(12,3) de PostgreSQL
        const validQuantity =
            /^(?:0|[1-9]\d{0,8})(?:\.\d{1,3})?$/.test(quantity);

        if (!validQuantity || Number(quantity) <= 0) {
            throw new AppError(
                "Las cantidades deben ser positivas y tener como máximo tres decimales.",
                400
            );
        }

        if (uniqueIds.has(ingredientId)) {
            throw new AppError(
                "No se puede repetir un ingrediente en la misma receta.",
                400
            );
        }

        uniqueIds.add(ingredientId);

        ingredients.push({
            ingredientId,
            quantity
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const product = await findProductForRecipeUpdate(
            client,
            id
        );

        if (!product) {
            throw new AppError(
                "El producto no existe.",
                404
            );
        }

        if (product.product_type !== "PREPARED") {
            throw new AppError(
                "Solo los productos preparados pueden tener recetas.",
                409
            );
        }

        const ingredientIds = ingredients.map(
            item => item.ingredientId
        );

        const existingIds = await findExistingIngredientIds(
            client,
            ingredientIds
        );

        if (existingIds.length !== ingredientIds.length) {
            throw new AppError(
                "Uno o más ingredientes no existen.",
                404
            );
        }

        await replaceRecipeIngredients(
            client,
            id,
            ingredients
        );

        // Leer la receta actualizada usando la misma transacción
        const query = `
            SELECT
                pi.product_id,
                pi.ingredient_id,
                i.name AS ingredient_name,
                i.unit,
                pi.quantity
            FROM product_ingredient pi
            INNER JOIN ingredient i
                ON pi.ingredient_id = i.ingredient_id
            WHERE pi.product_id = $1
            ORDER BY i.name ASC
        `;

        const result = await client.query(query, [id]);

        await client.query("COMMIT");

        return {
            product,
            ingredients: result.rows
        };

    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("Recipe rollback failed:", rollbackError);
        }

        throw error;

    } finally {
        client.release();
    }
}

export async function checkProductAvailability(branchId,productId, requestedQuantity) {
    const id = Number(branchId);
    const productIdNumber = Number(productId);
    const quantity = Number(requestedQuantity);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError(
            "El ID de la sucursal no es válido.",
            400
        );
    }

    if (
        !Number.isSafeInteger(productIdNumber) ||
        productIdNumber <= 0
    ) {
        throw new AppError(
            "El ID del producto no es válido.",
            400
        );
    }

    if (
        requestedQuantity === undefined ||
        requestedQuantity === null ||
        requestedQuantity === "" ||
        !Number.isSafeInteger(quantity) ||
        quantity <= 0
    ) {
        throw new AppError(
            "La cantidad debe ser un número entero positivo.",
            400
        );
    }

    // La función existente acepta un objeto con .query().
    // pool también cumple esa interfaz.
    const branch = await findBranchById(pool, id);

    if (!branch) {
        throw new AppError(
            "La sucursal no existe o está inactiva.",
            404
        );
    }

    const product = await findProductById(productIdNumber);

    if (!product) {
        throw new AppError(
            "El producto no existe.",
            404
        );
    }

    if (!product.active) {
        throw new AppError(
            "El producto se encuentra inactivo.",
            409
        );
    }

    if (product.product_type !== "PREPARED") {
        throw new AppError(
            "La disponibilidad de productos de reventa se consulta por separado.",
            409
        );
    }

    const ingredients = await findRecipeAvailability(
        id,
        productIdNumber,
        quantity
    );

    if (ingredients.length === 0) {
        throw new AppError(
            "El producto no tiene una receta registrada.",
            409
        );
    }

    const available = ingredients.every(
        ingredient => ingredient.sufficient === true
    );

    return {
        branchId: id,
        productId: productIdNumber,
        productName: product.name,
        requestedQuantity: quantity,
        available,
        ingredients
    };
}

export async function consumePreparedProduct(client,
    { branchId, productId, quantity, userId = null }) {
    const parsedBranchId = Number(branchId);
    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (
        !Number.isSafeInteger(parsedBranchId) ||
        parsedBranchId <= 0
    ) {
        throw new AppError(
            "El ID de la sucursal no es válido.",
            400
        );
    }

    if (
        !Number.isSafeInteger(parsedProductId) ||
        parsedProductId <= 0
    ) {
        throw new AppError(
            "El ID del producto no es válido.",
            400
        );
    }

    if (
        quantity === undefined ||
        quantity === null ||
        quantity === "" ||
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity <= 0 ||
        parsedQuantity > 2147483647
    ) {
        throw new AppError(
            "La cantidad debe ser un entero positivo válido.",
            400
        );
    }

    if (
        userId !== null &&
        (!Number.isSafeInteger(userId) || userId <= 0)
    ) {
        throw new AppError(
            "El ID del usuario no es válido.",
            400
        );
    }

    // El cliente debe pertenecer a una transacción activa.
    const branch = await findBranchById(
        client,
        parsedBranchId
    );

    if (!branch) {
        throw new AppError(
            "La sucursal no existe o está inactiva.",
            404
        );
    }

    const product = await findProductForConsumption(
        client,
        parsedProductId
    );

    if (!product) {
        throw new AppError(
            "El producto no existe.",
            404
        );
    }

    if (!product.active) {
        throw new AppError(
            "El producto está inactivo.",
            409
        );
    }

    if (product.product_type !== "PREPARED") {
        throw new AppError(
            "Este producto no utiliza una receta preparada.",
            409
        );
    }

    const ingredients = await findRecipeRequirements(
        client,
        parsedProductId,
        parsedQuantity
    );

    if (ingredients.length === 0) {
        throw new AppError(
            "El producto no tiene una receta registrada.",
            409
        );
    }

    const movements = [];

    for (const ingredient of ingredients) {
        const stock = await consumeIngredientStock(
            client,
            parsedBranchId,
            ingredient.ingredient_id,
            ingredient.required_quantity
        );

        if (!stock) {
            throw new AppError(
                `Stock insuficiente o inexistente para ${ingredient.ingredient_name}.`,
                409
            );
        }

        const movement = await insertConsumptionMovement(
            client,
            parsedBranchId,
            ingredient.ingredient_id,
            ingredient.required_quantity,
            userId
        );

        movements.push({
            ingredientId: ingredient.ingredient_id,
            ingredientName: ingredient.ingredient_name,
            unit: ingredient.unit,
            consumedQuantity: ingredient.required_quantity,
            remainingQuantity: stock.quantity,
            movementId: movement.movement_id
        });
    }

    return {
        branchId: parsedBranchId,
        productId: parsedProductId,
        productName: product.name,
        quantity: parsedQuantity,
        movements
    };
}

export async function consumeResaleProduct(
    client,
    { branchId, productId, quantity, userId = null }
) {
    const parsedBranchId = Number(branchId);
    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (
        !Number.isSafeInteger(parsedBranchId) ||
        parsedBranchId <= 0
    ) {
        throw new AppError(
            "El ID de la sucursal no es válido.",
            400
        );
    }

    if (
        !Number.isSafeInteger(parsedProductId) ||
        parsedProductId <= 0
    ) {
        throw new AppError(
            "El ID del producto no es válido.",
            400
        );
    }

    if (
        quantity === undefined ||
        quantity === null ||
        quantity === "" ||
        !Number.isSafeInteger(parsedQuantity) ||
        parsedQuantity <= 0 ||
        parsedQuantity > 2147483647
    ) {
        throw new AppError(
            "La cantidad debe ser un entero positivo válido.",
            400
        );
    }

    if (
        userId !== null &&
        (!Number.isSafeInteger(userId) || userId <= 0)
    ) {
        throw new AppError(
            "El ID del usuario no es válido.",
            400
        );
    }

    const branch = await findBranchById(
        client,
        parsedBranchId
    );

    if (!branch) {
        throw new AppError(
            "La sucursal no existe o está inactiva.",
            404
        );
    }

    const product = await findProductForConsumption(
        client,
        parsedProductId
    );

    if (!product) {
        throw new AppError(
            "El producto no existe.",
            404
        );
    }

    if (!product.active) {
        throw new AppError(
            "El producto está inactivo.",
            409
        );
    }

    if (product.product_type !== "RESELL") {
        throw new AppError(
            "Este producto no es de reventa.",
            409
        );
    }

    const ingredientId = product.resale_ingredient_id;

    if (!ingredientId) {
        throw new AppError(
            "El producto no tiene un artículo de inventario asociado.",
            409
        );
    }

    const stock = await consumeIngredientStock(
        client,
        parsedBranchId,
        ingredientId,
        parsedQuantity
    );

    if (!stock) {
        throw new AppError(
            "Stock insuficiente para vender este producto.",
            409
        );
    }

    const movement = await insertConsumptionMovement(
        client,
        parsedBranchId,
        ingredientId,
        parsedQuantity,
        userId
    );

    return {
        branchId: parsedBranchId,
        productId: parsedProductId,
        productName: product.name,
        quantity: parsedQuantity,
        movements: [
            {
                ingredientId,
                consumedQuantity: parsedQuantity,
                remainingQuantity: stock.quantity,
                movementId: movement.movement_id
            }
        ]
    };
}

export async function consumeSaleProduct(
    client,
    { branchId, productId, quantity, userId = null }
) {
    const parsedBranchId = Number(branchId);
    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (
        !Number.isSafeInteger(parsedBranchId) ||
        parsedBranchId <= 0
    ) {
        throw new AppError(
            "El ID de la sucursal no es válido.",
            400
        );
    }

    if (
        !Number.isSafeInteger(parsedProductId) ||
        parsedProductId <= 0
    ) {
        throw new AppError(
            "El ID del producto no es válido.",
            400
        );
    }

    if (
        quantity === undefined ||
        quantity === null ||
        quantity === "" ||
        !Number.isSafeInteger(parsedQuantity) ||
        parsedQuantity <= 0 ||
        parsedQuantity > 2147483647
    ) {
        throw new AppError(
            "La cantidad debe ser un entero positivo válido.",
            400
        );
    }

    if (
        userId !== null &&
        (!Number.isSafeInteger(userId) || userId <= 0)
    ) {
        throw new AppError(
            "El ID del usuario no es válido.",
            400
        );
    }

    // La conexión debe pertenecer a una transacción activa.
    const product = await findProductForConsumption(
        client,
        parsedProductId
    );

    if (!product) {
        throw new AppError(
            "El producto no existe.",
            404
        );
    }

    if (!product.active) {
        throw new AppError(
            "El producto está inactivo.",
            409
        );
    }

    const consumptionData = {
        branchId: parsedBranchId,
        productId: parsedProductId,
        quantity: parsedQuantity,
        userId
    };

    switch (product.product_type) {
        case "PREPARED":
            return await consumePreparedProduct(
                client,
                consumptionData
            );

        case "RESELL":
            return await consumeResaleProduct(
                client,
                consumptionData
            );

        default:
            throw new AppError(
                "El tipo de producto no es válido.",
                409
            );
    }
}
