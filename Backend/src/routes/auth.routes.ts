import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validator.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { authRateLimiter } from "../middlewares/rateLimiter";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  authController.register
);
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  authController.login
);
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken
);
router.post("/logout", authenticate, authController.logout);
router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  authRateLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);

export default router;
