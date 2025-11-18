import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import branchRoutes from './branch.routes';
import orderRoutes from './order.routes';
import adminRoutes from './admin.routes';
import paymentRoutes from './payment.routes';
import profileRoutes from './profile.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/branches', branchRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
router.use('/profile', profileRoutes);
router.use('/uploads', uploadRoutes);

export default router;

