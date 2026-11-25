import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import {
    getCurrentEmployeeController,
    loginController,
    registerEmployeeController
} from "./authController.js";

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde."
    }
});

const router = Router();

router.post("/login", loginLimiter, loginController);
router.post("/register", authenticate, authorize("ADMINISTRATOR", "HR"), registerEmployeeController);
router.get("/me", authenticate, getCurrentEmployeeController);

export default router;
