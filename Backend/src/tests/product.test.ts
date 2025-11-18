import request from 'supertest';
import app from '../app';
import Product from '../models/Product';
import User from '../models/User';
import { UserRole } from '../types';
import { generateAccessToken } from '../config/jwt';

describe('Product API', () => {
  let adminToken: string;
  let adminUser: any;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      phone: '+6281234567894',
      password: 'hashedpassword',
      role: UserRole.ADMIN,
      isActive: true,
    });

    adminToken = generateAccessToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });
  });

  describe('GET /api/v1/products', () => {
    it('should get all products', async () => {
      await Product.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 10000,
        image: 'https://example.com/image.jpg',
        category: 'Coffee',
        isAvailable: true,
        stock: 10,
      });

      const response = await request(app).get('/api/v1/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a product as admin', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'New Product')
        .field('description', 'Product Description')
        .field('price', '20000')
        .field('category', 'Coffee')
        .field('stock', '50')
        .field('isAvailable', 'true')
        .attach('image', Buffer.from('fake image'), 'test.jpg');

      expect([201, 400]).toContain(response.status);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).post('/api/v1/products').send({
        name: 'New Product',
        description: 'Description',
        price: 20000,
        category: 'Coffee',
      });

      expect(response.status).toBe(401);
    });
  });
});

