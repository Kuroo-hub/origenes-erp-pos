import {getAllIngredients, registerIngredient, getStockByBranch, registerStockEntry,
    registerStockExit, getMovementsByBranch, getLowStockByBranch, getProductRecipe,
    saveProductRecipe, checkProductAvailability
} from './inventoryService.js';

export async function getIngredientsController(req, res, next)
{
    try
    {
        const ingredients = await getAllIngredients();

        return res.status(200).json({
            success: true,
            data: ingredients
        });
    }catch(error)
    {
        next(error);
    }
}

export async function createIngredientController(req, res, next){
    try{
        const ingredient = await registerIngredient(req.body);

        return res.status(201).json(
            {
                success: true,
                message: "Ingrediente registrado correctamente.",
                data: ingredient
            }
        );
    }catch(error)
    {
        next(error);
    }
}

export async function getBranchStockController(req, res, next)
{
    try{
        const {branchId} = req.params;

        const stock = await getStockByBranch(branchId);

        return res.status(200).json({
            success: true,
            data: stock
        });
    }catch(error)
    {
        next(error);
    }
}

export async function createStockEntryController(req, res, next) {
    try {
        const { branchId } = req.params;

        const result = await registerStockEntry(
            branchId,
            req.body,
            req.user.employeeId
        );

        return res.status(201).json({
            success: true,
            message: "Entrada de inventario registrada correctamente.",
            data: result
        });

    } catch (error) {
        next(error);
    }
}

export async function createStockExitController(req, res, next) {
    try {
        const { branchId } = req.params;

        const result = await registerStockExit(
            branchId,
            req.body,
            req.user.employeeId
        );

        return res.status(201).json({
            success: true,
            message: "Salida de inventario registrada correctamente.",
            data: result
        });

    } catch (error) {
        next(error);
    }
}

export async function getMovementsController(req, res, next) {
    try {
        const { branchId } = req.params;

        const movements = await getMovementsByBranch(branchId);

        return res.status(200).json({
            success: true,
            data: movements
        });
    } catch (error) {
        next(error);
    }
}

export async function getLowStockController(req, res, next) {
    try {
        const { branchId } = req.params;

        const alerts = await getLowStockByBranch(branchId);

        return res.status(200).json({
            success: true,
            data: alerts
        });
    } catch (error) {
        next(error);
    }
}

export async function getProductRecipeController(req, res, next) {
    try {
        const { productId } = req.params;

        const recipe = await getProductRecipe(productId);

        return res.status(200).json({
            success: true,
            data: recipe
        });

    } catch (error) {
        next(error);
    }
}

export async function saveProductRecipeController(req, res, next) {
    try {
        const { productId } = req.params;

        const recipe = await saveProductRecipe(
            productId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Receta guardada correctamente.",
            data: recipe
        });

    } catch (error) {
        next(error);
    }
}

export async function getProductAvailabilityController(
    req,
    res,
    next
) {
    try {
        const { branchId, productId } = req.params;
        const { quantity } = req.query;

        const result = await checkProductAvailability(
            branchId,
            productId,
            quantity
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        next(error);
    }
}