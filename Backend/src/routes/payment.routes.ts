import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { apiRateLimiter, strictRateLimiter } from "../middlewares/rateLimiter";

const router = Router();
const orderController = new OrderController();

// Midtrans callback (webhook)
router.post(
  "/midtrans/callback",
  apiRateLimiter,
  strictRateLimiter,
  orderController.handleMidtransCallback
);

export default router;
