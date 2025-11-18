import { Response, NextFunction } from 'express';
import { uploadToCloudinary } from '../config/cloudinary';
import { AppError } from '../middlewares/errorHandler';

export class UploadController {
  uploadImage = async (req: Express.Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('No image file provided', 400);
      }

      const imageUrl = await uploadToCloudinary(req.file, 'coffeeshop/uploads');

      res.json({
        success: true,
        data: {
          url: imageUrl,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      next(error);
    }
  };
}

