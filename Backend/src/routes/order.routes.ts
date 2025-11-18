import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validator.middleware";
import { apiRateLimiter } from "../middlewares/rateLimiter";
import {
  createOrderSchema,
  getOrderSchema,
  getOrdersSchema,
} from "../validators/order.validator";

const router = Router();
const orderController = new OrderController();

router.post(
  "/",
  authenticate,
  apiRateLimiter,
  validate(createOrderSchema),
  orderController.createOrder
);
router.get(
  "/",
  authenticate,
  apiRateLimiter,
  validate(getOrdersSchema),
  orderController.getUserOrders
);
router.get(
  "/:id",
  authenticate,
  apiRateLimiter,
  validate(getOrderSchema),
  orderController.getOrderById
);

export default router;
