import { Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middlewares/errorHandler';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const profile = await this.profileService.getProfile(req.user.userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, error.message === 'User not found' ? 404 : 400);
      }
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { name, phone } = req.body;
      const avatarFile = req.file;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;

      const profile = await this.profileService.updateProfile(req.user.userId, updateData, avatarFile);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      next(error);
    }
  };
}

