import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validator.middleware';
import { apiRateLimiter } from '../middlewares/rateLimiter';
import {
  createBranchSchema,
  updateBranchSchema,
  getBranchSchema,
  getBranchesSchema,
  nearbyBranchesSchema,
} from '../validators/branch.validator';
import { UserRole } from '../types';

const router = Router();
const branchController = new BranchController();

router.get('/', apiRateLimiter, validate(getBranchesSchema), branchController.getAllBranches);
router.get('/nearby', apiRateLimiter, validate(nearbyBranchesSchema), branchController.getNearbyBranches);
router.get('/:id', apiRateLimiter, validate(getBranchSchema), branchController.getBranchById);
router.post('/', authenticate, authorize(UserRole.ADMIN), validate(createBranchSchema), branchController.createBranch);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateBranchSchema),
  branchController.updateBranch
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(getBranchSchema),
  branchController.deleteBranch
);

export default router;

