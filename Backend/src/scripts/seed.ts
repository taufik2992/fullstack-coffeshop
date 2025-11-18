import dotenv from "dotenv";
import argon2 from "argon2";
import { connectDatabase } from "../config/database";
import User from "../models/User";
import Product from "../models/Product";
import Branch from "../models/Branch";
import Order from "../models/Order";
import { UserRole, OrderStatus, PaymentMethod, PaymentStatus } from "../types";
import logger from "../utils/logger";

dotenv.config();

const seedData = async (): Promise<void> => {
  try {
    await connectDatabase();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Branch.deleteMany({});
    await Order.deleteMany({});

    logger.info("🗑️  Cleared existing data");

    // Create Admin Users
    const adminPassword = await argon2.hash("admin123");
    await User.create({
      name: "Admin User",
      email: "admin@coffeeshop.com",
      phone: "+6281234567890",
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await User.create({
      name: "Super Admin",
      email: "superadmin@coffeeshop.com",
      phone: "+6281234567891",
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    logger.info("✅ Created admin users");

    // Create Regular Users
    const userPassword = await argon2.hash("user123");
    const users = await User.insertMany([
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "+6281234567892",
        password: userPassword,
        role: UserRole.USER,
        isActive: true,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+6281234567893",
        password: userPassword,
        role: UserRole.USER,
        isActive: true,
      },
      {
        name: "Bob Johnson",
        email: "bob@example.com",
        phone: "+6281234567894",
        password: userPassword,
        role: UserRole.USER,
        isActive: true,
      },
      {
        name: "Alice Williams",
        email: "alice@example.com",
        phone: "+6281234567895",
        password: userPassword,
        role: UserRole.USER,
        isActive: true,
      },
      {
        name: "Charlie Brown",
        email: "charlie@example.com",
        phone: "+6281234567896",
        password: userPassword,
        role: UserRole.USER,
        isActive: true,
      },
    ]);

    logger.info("✅ Created regular users");

    // Create Products
    const products = await Product.insertMany([
      {
        name: "Espresso",
        description: "Rich and bold espresso shot, perfect for coffee lovers",
        price: 25000,
        image:
          "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800",
        category: "Coffee",
        isAvailable: true,
        stock: 100,
      },
      {
        name: "Cappuccino",
        description:
          "Espresso with steamed milk and foam, topped with cinnamon",
        price: 30000,
        image:
          "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800",
        category: "Coffee",
        isAvailable: true,
        stock: 100,
      },
      {
        name: "Latte",
        description: "Smooth espresso with steamed milk, perfect for any time",
        price: 32000,
        image:
          "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800",
        category: "Coffee",
        isAvailable: true,
        stock: 100,
      },
      {
        name: "Matcha Latte",
        description: "Creamy matcha green tea with steamed milk",
        price: 35000,
        image:
          "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800",
        category: "Non-Coffee",
        isAvailable: true,
        stock: 50,
      },
      {
        name: "Chocolate Croissant",
        description: "Fresh baked buttery croissant filled with rich chocolate",
        price: 25000,
        image:
          "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
        category: "Food",
        isAvailable: true,
        stock: 30,
      },
      {
        name: "Coffee Shop Mug",
        description:
          "Premium ceramic mug with our logo, perfect for coffee at home",
        price: 150000,
        image:
          "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800",
        category: "Merchandise",
        isAvailable: true,
        stock: 20,
      },
    ]);

    logger.info("✅ Created products");

    // Create Branches (using Jakarta coordinates as example)
    const branches = await Branch.insertMany([
      {
        name: "Coffee Shop Central",
        address: "Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta 10220",
        phone: "+622123456789",
        location: {
          lat: -6.2088,
          lng: 106.8456,
        },
        formattedAddress:
          "Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta 10220, Indonesia",
        isActive: true,
        operatingHours: {
          monday: { open: "08:00", close: "22:00" },
          tuesday: { open: "08:00", close: "22:00" },
          wednesday: { open: "08:00", close: "22:00" },
          thursday: { open: "08:00", close: "22:00" },
          friday: { open: "08:00", close: "23:00" },
          saturday: { open: "09:00", close: "23:00" },
          sunday: { open: "09:00", close: "22:00" },
        },
      },
      {
        name: "Coffee Shop Kemang",
        address: "Jl. Kemang Raya No. 10, Jakarta Selatan, DKI Jakarta 12730",
        phone: "+622123456790",
        location: {
          lat: -6.2634,
          lng: 106.8086,
        },
        formattedAddress:
          "Jl. Kemang Raya No. 10, Jakarta Selatan, DKI Jakarta 12730, Indonesia",
        isActive: true,
        operatingHours: {
          monday: { open: "08:00", close: "22:00" },
          tuesday: { open: "08:00", close: "22:00" },
          wednesday: { open: "08:00", close: "22:00" },
          thursday: { open: "08:00", close: "22:00" },
          friday: { open: "08:00", close: "23:00" },
          saturday: { open: "09:00", close: "23:00" },
          sunday: { open: "09:00", close: "22:00" },
        },
      },
      {
        name: "Coffee Shop SCBD",
        address:
          "Jl. Jend. Sudirman No. 52-53, Jakarta Selatan, DKI Jakarta 12190",
        phone: "+622123456791",
        location: {
          lat: -6.2277,
          lng: 106.8087,
        },
        formattedAddress:
          "Jl. Jend. Sudirman No. 52-53, Jakarta Selatan, DKI Jakarta 12190, Indonesia",
        isActive: true,
        operatingHours: {
          monday: { open: "07:00", close: "22:00" },
          tuesday: { open: "07:00", close: "22:00" },
          wednesday: { open: "07:00", close: "22:00" },
          thursday: { open: "07:00", close: "22:00" },
          friday: { open: "07:00", close: "23:00" },
          saturday: { open: "08:00", close: "23:00" },
          sunday: { open: "09:00", close: "21:00" },
        },
      },
    ]);

    logger.info("✅ Created branches");

    // Create Sample Orders
    const now = new Date();
    const orders = await Order.insertMany([
      {
        orderId: `ORDER-${Date.now()}-001`,
        user: users[0]._id,
        branch: branches[0]._id,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            price: products[0].price,
            quantity: 2,
          },
          {
            product: products[4]._id,
            name: products[4].name,
            price: products[4].price,
            quantity: 1,
          },
        ],
        totalAmount: products[0].price * 2 + products[4].price,
        status: OrderStatus.COMPLETED,
        paymentMethod: PaymentMethod.CASH,
        paymentStatus: PaymentStatus.SUCCESS,
        paymentDetails: {
          method: "CASH",
          paidAt: new Date(now.getTime() - 86400000).toISOString(),
        },
        createdAt: new Date(now.getTime() - 86400000),
      },
      {
        orderId: `ORDER-${Date.now()}-002`,
        user: users[1]._id,
        branch: branches[1]._id,
        items: [
          {
            product: products[1]._id,
            name: products[1].name,
            price: products[1].price,
            quantity: 1,
          },
        ],
        totalAmount: products[1].price,
        status: OrderStatus.PROCESSING,
        paymentMethod: PaymentMethod.MIDTRANS,
        paymentStatus: PaymentStatus.SUCCESS,
        paymentDetails: {
          midtransToken: "sample-token-123",
          midtransOrderId: `ORDER-${Date.now()}-002`,
          transactionId: "TXN-123456",
        },
        createdAt: new Date(now.getTime() - 3600000),
      },
      {
        orderId: `ORDER-${Date.now()}-003`,
        user: users[2]._id,
        branch: branches[0]._id,
        items: [
          {
            product: products[2]._id,
            name: products[2].name,
            price: products[2].price,
            quantity: 1,
          },
          {
            product: products[3]._id,
            name: products[3].name,
            price: products[3].price,
            quantity: 1,
          },
        ],
        totalAmount: products[2].price + products[3].price,
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.MIDTRANS,
        paymentStatus: PaymentStatus.PENDING,
        paymentDetails: {
          midtransToken: "sample-token-456",
          midtransOrderId: `ORDER-${Date.now()}-003`,
        },
        createdAt: new Date(now.getTime() - 1800000),
      },
    ]);

    logger.info("✅ Created sample orders");

    logger.info("\n📊 Seed Data Summary:");
    logger.info(`   - Admin Users: 2`);
    logger.info(`   - Regular Users: ${users.length}`);
    logger.info(`   - Products: ${products.length}`);
    logger.info(`   - Branches: ${branches.length}`);
    logger.info(`   - Orders: ${orders.length}`);
    logger.info("\n🔑 Login Credentials:");
    logger.info(`   Admin: admin@coffeeshop.com / admin123`);
    logger.info(`   User: john@example.com / user123`);
    logger.info("\n✅ Seed data created successfully!");

    process.exit(0);
  } catch (error) {
    logger.error("❌ Error seeding data:");
    process.exit(1);
  }
};

seedData();
