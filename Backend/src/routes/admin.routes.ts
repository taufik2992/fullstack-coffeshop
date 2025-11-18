import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validator.middleware";
import {
  getOrdersSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator";
import { UserRole } from "../types";

const router = Router();
const orderController = new OrderController();
const analyticsController = new AnalyticsController();

// Orders
router.get(
  "/orders",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(getOrdersSchema),
  orderController.getAllOrders
);
router.put(
  "/orders/:id/status",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

// Analytics
router.get(
  "/analytics/sales",
  authenticate,
  authorize(UserRole.ADMIN),
  analyticsController.getSales
);
router.get(
  "/analytics/top-products",
  authenticate,
  authorize(UserRole.ADMIN),
  analyticsController.getTopProducts
);
router.get(
  "/analytics/branches",
  authenticate,
  authorize(UserRole.ADMIN),
  analyticsController.getBranchPerformance
);

export default router;
