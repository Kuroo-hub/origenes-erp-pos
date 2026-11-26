import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate.js";
import { authorize } from "../../../middlewares/authorize.js";
import {
    getDeliveryOrdersController,
    patchDeliveryStatusController,
    patchKitchenStatusController
} from "./ordersController.js";

const router = Router();
const deliveryStaff = authorize("ADMINISTRATOR", "MANAGER", "EMPLOYEE");

router.get("/delivery", authenticate, deliveryStaff, getDeliveryOrdersController);
router.patch(
    "/:orderId/delivery-status",
    authenticate,
    deliveryStaff,
    patchDeliveryStatusController
);
router.patch(
    "/:invoiceId/kitchen-status",
    authenticate,
    deliveryStaff,
    patchKitchenStatusController
);

export default router;
