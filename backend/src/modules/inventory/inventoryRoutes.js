import {Router} from "express";

import {getIngredientsController, createIngredientController, getBranchStockController,
    createStockEntryController, createStockExitController, getMovementsController,
    getLowStockController, getProductRecipeController, saveProductRecipeController,
    getProductAvailabilityController
} from './inventoryController.js';

const inventoryRoutes = Router();

// Rutas inventario
inventoryRoutes.get("/ingredients", getIngredientsController);
inventoryRoutes.post("/ingredients", createIngredientController);
inventoryRoutes.get("/branches/:branchId/stock", getBranchStockController);
inventoryRoutes.post("/branches/:branchId/movements", createStockEntryController);
inventoryRoutes.post("/branches/:branchId/movements/out", createStockExitController);
inventoryRoutes.get("/branches/:branchId/movements", getMovementsController);
inventoryRoutes.get("/branches/:branchId/alerts", getLowStockController);
inventoryRoutes.get("/products/:productId/recipe", getProductRecipeController);
inventoryRoutes.put("/products/:productId/recipe", saveProductRecipeController);
inventoryRoutes.get("/branches/:branchId/products/:productId/availability", getProductAvailabilityController);

export default inventoryRoutes;
