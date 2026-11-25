import { resolveBranchId } from "../../utils/branchAccess.js";
import {getAllBranches, getAllIngredients, getAllProducts, registerIngredient, getStockByBranch, registerStockEntry,
    registerStockExit, getMovementsByBranch, getLowStockByBranch, getProductRecipe,
    saveProductRecipe, checkProductAvailability
} from './inventoryService.js';

export async function getBranchesController(req, res)
{
    const branches = await getAllBranches();

    return res.status(200).json({
        success: true,
        data: branches
    });
}

export async function getIngredientsController(req, res)
{
    const ingredients = await getAllIngredients();

    return res.status(200).json({
        success: true,
        data: ingredients
    });
}

export async function getProductsController(req, res)
{
    const products = await getAllProducts();

    return res.status(200).json({
        success: true,
        data: products
    });
}

export async function createIngredientController(req, res){
    const ingredient = await registerIngredient(req.body);

    return res.status(201).json(
        {
            success: true,
            message: "Ingrediente registrado correctamente.",
            data: ingredient
        }
    );
}

export async function getBranchStockController(req, res)
{
    const branchId = resolveBranchId(req, req.params.branchId);

    const stock = await getStockByBranch(branchId);

    return res.status(200).json({
        success: true,
        data: stock
    });
}

export async function createStockEntryController(req, res) {
    const branchId = resolveBranchId(req, req.params.branchId);

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
}

export async function createStockExitController(req, res) {
    const branchId = resolveBranchId(req, req.params.branchId);

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
}

export async function getMovementsController(req, res) {
    const branchId = resolveBranchId(req, req.params.branchId);

    const movements = await getMovementsByBranch(branchId);

    return res.status(200).json({
        success: true,
        data: movements
    });
}

export async function getLowStockController(req, res) {
    const branchId = resolveBranchId(req, req.params.branchId);

    const alerts = await getLowStockByBranch(branchId);

    return res.status(200).json({
        success: true,
        data: alerts
    });
}

export async function getProductRecipeController(req, res) {
    const { productId } = req.params;

    const recipe = await getProductRecipe(productId);

    return res.status(200).json({
        success: true,
        data: recipe
    });
}

export async function saveProductRecipeController(req, res) {
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
}

export async function getProductAvailabilityController(
    req,
    res
) {
    const branchId = resolveBranchId(req, req.params.branchId);
    const { productId } = req.params;
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
}
