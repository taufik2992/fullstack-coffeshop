import { UserRepository } from '../repositories/user.repository';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary';
import { IUser } from '../models/User';

export class ProfileService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    data: Partial<{
      name: string;
      phone: string;
    }>,
    avatarFile?: Express.Multer.File
  ): Promise<IUser> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    let avatarUrl = existingUser.avatar;

    if (avatarFile) {
      if (existingUser.avatar) {
        const publicId = extractPublicId(existingUser.avatar);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (error) {
            console.error('Failed to delete old avatar:', error);
          }
        }
      }
      avatarUrl = await uploadToCloudinary(avatarFile, 'coffeeshop/avatars');
    }

    const updated = await this.userRepository.updateById(userId, {
      ...data,
      avatar: avatarUrl,
    });

    if (!updated) {
      throw new Error('Failed to update profile');
    }

    return updated;
  }
}

