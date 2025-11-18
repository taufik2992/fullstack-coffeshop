import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validator.middleware';
import { apiRateLimiter } from '../middlewares/rateLimiter';
import { uploadSingle } from '../utils/multer';
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  getProductsSchema,
} from '../validators/product.validator';
import { UserRole } from '../types';

const router = Router();
const productController = new ProductController();

router.get('/', apiRateLimiter, validate(getProductsSchema), productController.getAllProducts);
router.get('/:id', apiRateLimiter, validate(getProductSchema), productController.getProductById);
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  uploadSingle,
  validate(createProductSchema),
  productController.createProduct
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  uploadSingle,
  validate(updateProductSchema),
  productController.updateProduct
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(getProductSchema),
  productController.deleteProduct
);

export default router;

