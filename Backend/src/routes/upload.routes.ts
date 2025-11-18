import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { apiRateLimiter } from '../middlewares/rateLimiter';
import { uploadSingle } from '../utils/multer';

const router = Router();
const uploadController = new UploadController();

router.post('/image', authenticate, apiRateLimiter, uploadSingle, uploadController.uploadImage);

export default router;

