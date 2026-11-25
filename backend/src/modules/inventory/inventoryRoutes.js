import {Router} from "express";

import {authenticate} from '../../middlewares/authenticate.js';
import {authorize} from '../../middlewares/authorize.js';

import {getBranchesController, getIngredientsController, getProductsController, createIngredientController, getBranchStockController,
    createStockEntryController, createStockExitController, getMovementsController,
    getLowStockController, getProductRecipeController, saveProductRecipeController,
    getProductAvailabilityController
} from './inventoryController.js';

const inventoryRoutes = Router();

const inventoryStaff = authorize("ADMINISTRATOR", "MANAGER", "EMPLOYEE", "HR", "INVENTORY_MANAGER");
const inventoryManager = authorize("ADMINISTRATOR", "INVENTORY_MANAGER");

// Rutas inventario
inventoryRoutes.get("/branches", authenticate, inventoryStaff, getBranchesController);
inventoryRoutes.get("/ingredients", authenticate, inventoryStaff, getIngredientsController);
inventoryRoutes.get("/products", authenticate, inventoryStaff, getProductsController);
inventoryRoutes.post("/ingredients", authenticate, inventoryManager, createIngredientController);
inventoryRoutes.get("/branches/:branchId/stock", authenticate, inventoryStaff, getBranchStockController);
inventoryRoutes.post("/branches/:branchId/movements", authenticate, inventoryManager, createStockEntryController);
inventoryRoutes.post("/branches/:branchId/movements/out", authenticate, inventoryManager, createStockExitController);
inventoryRoutes.get("/branches/:branchId/movements", authenticate, inventoryStaff, getMovementsController);
inventoryRoutes.get("/branches/:branchId/alerts", authenticate, inventoryStaff, getLowStockController);
inventoryRoutes.get("/products/:productId/recipe", authenticate, inventoryStaff, getProductRecipeController);
inventoryRoutes.put("/products/:productId/recipe", authenticate, inventoryManager, saveProductRecipeController);
inventoryRoutes.get("/branches/:branchId/products/:productId/availability", authenticate, inventoryStaff, getProductAvailabilityController);

export default inventoryRoutes;
