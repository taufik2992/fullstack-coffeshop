import argon2 from 'argon2';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../config/jwt';
import { UserRole } from '../types';
import logger from '../utils/logger';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ user: { id: string; name: string; email: string; phone: string; role: UserRole } }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await argon2.hash(data.password);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: UserRole.USER,
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string): Promise<{
    user: { id: string; name: string; email: string; phone: string; role: UserRole; avatar?: string };
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const isValidPassword = await argon2.verify(user.password, password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await this.userRepository.addRefreshToken(user._id.toString(), refreshToken);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = verifyToken(refreshToken);

    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new Error('Invalid token or user not found');
    }

    const userWithTokens = await this.userRepository.findByEmail(user.email);
    if (!userWithTokens || !userWithTokens.refreshTokens.includes(refreshToken)) {
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await this.userRepository.removeRefreshToken(user._id.toString(), refreshToken);
    await this.userRepository.addRefreshToken(user._id.toString(), newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.userRepository.removeRefreshToken(userId, refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.userRepository.clearAllRefreshTokens(userId);
  }

  async forgotPassword(email: string): Promise<{ token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Email not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.setResetPasswordToken(user._id.toString(), resetToken, resetExpires);

    logger.info(`Password reset token generated for user: ${email}`);

    return { token: resetToken };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await argon2.hash(newPassword);

    await this.userRepository.updateById(user._id.toString(), {
      password: hashedPassword,
    });

    await this.userRepository.clearResetToken(user._id.toString());
  }
}

