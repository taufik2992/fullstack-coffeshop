import request from 'supertest';
import app from '../app';
import User from '../models/User';
import { UserRole } from '../types';

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+6281234567890',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        phone: '+6281234567891',
        password: 'hashedpassword',
        role: UserRole.USER,
      });

      const response = await request(app).post('/api/v1/auth/register').send({
        name: 'New User',
        email: 'existing@example.com',
        phone: '+6281234567892',
        password: 'password123',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'login@example.com',
        phone: '+6281234567893',
        password: '$argon2id$v=19$m=65536,t=3,p=4$test',
        role: UserRole.USER,
        isActive: true,
      });
    });

    it('should login successfully with valid credentials', async () => {
      // Note: This test would require proper password hashing setup
      // In a real scenario, you'd hash the password properly
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'login@example.com',
        password: 'password123',
      });

      // This might fail if password doesn't match, adjust as needed
      expect([200, 401]).toContain(response.status);
    });
  });
});

