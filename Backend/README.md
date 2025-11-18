# Coffee Shop Backend API

Modern, secure, and scalable backend API for Coffee Shop mobile application built with Node.js, Express 5, TypeScript, MongoDB, and integrated with Cloudinary, Google Maps, and Midtrans payment gateway.

## 🚀 Features

- ✅ **Authentication & Authorization**

  - JWT-based authentication with refresh token rotation
  - Role-based access control (USER, ADMIN)
  - Password reset functionality
  - Secure password hashing with Argon2

- ✅ **Product Management**

  - CRUD operations for products (Admin only)
  - Image upload to Cloudinary
  - Category-based filtering
  - Stock management

- ✅ **Branch Management**

  - CRUD operations for branches (Admin only)
  - Google Maps Geocoding integration
  - Nearby branch search (geolocation-based)
  - Operating hours management

- ✅ **Order System**

  - Create orders with cart functionality
  - Support for multiple payment methods:
    - **Midtrans** (Snap/Core API) with webhook callback
    - **Cash** (instant success)
  - Order status tracking
  - Order history for users

- ✅ **Analytics Dashboard (Admin)**

  - Total sales and revenue
  - Order statistics
  - Top selling products
  - Branch performance metrics

- ✅ **User Profile**

  - Profile management
  - Avatar upload to Cloudinary

- ✅ **Security Features**

  - Helmet.js for security headers
  - CORS configuration
  - Rate limiting (per-IP and per-endpoint)
  - Input validation with Zod
  - SQL injection prevention
  - XSS protection

- ✅ **Documentation**

  - Swagger/OpenAPI 3 documentation
  - Interactive API documentation at `/api/v1/docs`

- ✅ **Infrastructure**

  - Docker & Docker Compose support
  - MongoDB connection pooling
  - Production-ready logging with Pino
  - Environment-based configuration

- ✅ **Testing**
  - Jest + Supertest for integration tests
  - Test coverage reports

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm or yarn
- Docker & Docker Compose (optional)
- Cloudinary account (for image uploads)
- Google Maps API key (for geocoding)
- Midtrans account (for payment gateway)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the `env.example` file to `.env`:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/coffeeshop

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-characters
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Midtrans Configuration
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=false

# Logging
LOG_LEVEL=info
```

### 4. Setup Services

#### Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to your `.env` file

#### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Geocoding API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your APIs (recommended)
6. Add the API key to your `.env` file

#### Midtrans Setup

1. Sign up at [Midtrans](https://midtrans.com/)
2. Get your Server Key and Client Key from the dashboard
3. For development, use the Sandbox credentials
4. Set `MIDTRANS_IS_PRODUCTION=false` for development
5. Configure webhook callback URL: `https://your-domain.com/api/v1/payments/midtrans/callback`
6. Add credentials to your `.env` file

### 5. Start MongoDB

#### Option A: Local MongoDB

```bash
# Install MongoDB locally or use MongoDB Atlas
mongod
```

#### Option B: Docker

```bash
docker-compose up -d mongo
```

### 6. Seed Database

```bash
npm run seed
```

This will create:

- 2 Admin users
- 5 Regular users
- 6 Products
- 3 Branches
- Sample orders

Default credentials:

- Admin: `admin@coffeeshop.com` / `admin123`
- User: `john@example.com` / `user123`

### 7. Build and Run

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 🐳 Docker Setup

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Manual Docker Build

```bash
# Build image
docker build -t coffeeshop-api .

# Run container
docker run -p 3000:3000 --env-file .env coffeeshop-api
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- Swagger UI: `http://localhost:3000/api/v1/docs`
- OpenAPI JSON: `http://localhost:3000/api/v1/docs.json`

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Test Environment

Create a `.env.test` file for test configuration:

```env
NODE_ENV=test
MONGO_URI=mongodb://localhost:27017/coffeeshop-test
JWT_SECRET=test-secret-key
```

## 📁 Project Structure

```
Backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts
│   │   ├── cloudinary.ts
│   │   ├── jwt.ts
│   │   ├── googleMaps.ts
│   │   ├── midtrans.ts
│   │   └── swagger.ts
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── branch.controller.ts
│   │   ├── order.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── profile.controller.ts
│   │   └── upload.controller.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── branch.service.ts
│   │   ├── order.service.ts
│   │   ├── analytics.service.ts
│   │   └── profile.service.ts
│   ├── repositories/    # Data access layer
│   │   ├── user.repository.ts
│   │   ├── product.repository.ts
│   │   ├── branch.repository.ts
│   │   └── order.repository.ts
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Branch.ts
│   │   └── Order.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── branch.routes.ts
│   │   ├── order.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── profile.routes.ts
│   │   ├── upload.routes.ts
│   │   └── index.ts
│   ├── middlewares/     # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── validator.middleware.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── validators/      # Zod schemas
│   │   ├── auth.validator.ts
│   │   ├── product.validator.ts
│   │   ├── branch.validator.ts
│   │   ├── order.validator.ts
│   │   └── profile.validator.ts
│   ├── utils/           # Utility functions
│   │   ├── logger.ts
│   │   └── multer.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── tests/           # Test files
│   │   ├── setup.ts
│   │   ├── auth.test.ts
│   │   └── product.test.ts
│   ├── scripts/         # Utility scripts
│   │   └── seed.ts
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── .env.example         # Environment variables template
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Products

- `GET /api/v1/products` - Get all products (paginated)
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product (Admin only)
- `PUT /api/v1/products/:id` - Update product (Admin only)
- `DELETE /api/v1/products/:id` - Delete product (Admin only)

### Branches

- `GET /api/v1/branches` - Get all branches
- `GET /api/v1/branches/nearby` - Get nearby branches (requires lat, lng, radius)
- `GET /api/v1/branches/:id` - Get branch by ID
- `POST /api/v1/branches` - Create branch (Admin only)
- `PUT /api/v1/branches/:id` - Update branch (Admin only)
- `DELETE /api/v1/branches/:id` - Delete branch (Admin only)

### Orders

- `POST /api/v1/orders` - Create new order (User)
- `GET /api/v1/orders` - Get user's orders (User)
- `GET /api/v1/orders/:id` - Get order by ID (User)

### Admin

- `GET /api/v1/admin/orders` - Get all orders (Admin)
- `PUT /api/v1/admin/orders/:id/status` - Update order status (Admin)
- `GET /api/v1/admin/analytics/sales` - Get sales analytics (Admin)
- `GET /api/v1/admin/analytics/top-products` - Get top products (Admin)
- `GET /api/v1/admin/analytics/branches` - Get branch performance (Admin)

### Payments

- `POST /api/v1/payments/midtrans/callback` - Midtrans webhook callback

### Profile

- `GET /api/v1/profile` - Get user profile (User)
- `PUT /api/v1/profile` - Update user profile (User)

### Upload

- `POST /api/v1/uploads/image` - Upload image (User)

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Refresh Flow

1. Login to get `accessToken` and `refreshToken`
2. Use `accessToken` for API requests
3. When `accessToken` expires (401), use `refreshToken` to get new tokens
4. Token rotation: old `refreshToken` is invalidated, new one is issued

## 💳 Payment Integration

### Midtrans Payment Flow

1. User creates order with `paymentMethod: "MIDTRANS"`
2. Backend creates Midtrans transaction
3. Returns `paymentToken` to mobile client
4. Mobile client uses token to open Midtrans payment UI
5. Midtrans sends callback to `/api/v1/payments/midtrans/callback`
6. Backend updates order status based on callback

### Cash Payment Flow

1. User creates order with `paymentMethod: "CASH"`
2. Order status is immediately set to `SUCCESS`
3. No external payment gateway involved

## 🌍 Nearby Branches

Search branches within a radius:

```
GET /api/v1/branches/nearby?lat=-6.2088&lng=106.8456&radius=10
```

- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Radius in kilometers (default: 10)

## 📊 Analytics

Admin can access analytics endpoints:

- Sales: Total revenue, orders, average order value
- Top Products: Best selling products by quantity and revenue
- Branch Performance: Revenue and order count per branch

All analytics support date filtering with `startDate` and `endDate` query parameters.

## 🚨 Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🔒 Security Best Practices

- ✅ All passwords are hashed with Argon2
- ✅ JWT tokens with expiration
- ✅ Refresh token rotation
- ✅ Rate limiting on sensitive endpoints
- ✅ Input validation with Zod
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ No sensitive data in logs
- ✅ Environment variables for secrets

## 📝 Logging

Logs are structured using Pino logger:

- Development: Pretty formatted logs
- Production: JSON formatted logs

Log levels: `error`, `warn`, `info`, `debug`

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` (minimum 32 characters)
3. Configure `ALLOWED_ORIGINS` with production domains
4. Enable `MIDTRANS_IS_PRODUCTION=true`
5. Set up MongoDB replica set for high availability
6. Configure reverse proxy (Nginx/Traefik)
7. Set up SSL/TLS certificates
8. Configure proper backup strategy
9. Set up monitoring and alerting
10. Review and configure rate limiting limits

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://your-app.com,https://admin.your-app.com
MONGO_URI=mongodb://your-mongo-uri
JWT_SECRET=your-very-secure-secret-key-min-32-characters
# ... other production values
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Check if MongoDB is running
- Verify `MONGO_URI` in `.env`
- Check network connectivity

### Cloudinary Upload Fails

- Verify API credentials in `.env`
- Check internet connectivity
- Verify file size limits (max 5MB)

### Google Maps Geocoding Fails

- Verify API key is valid
- Check if Geocoding API is enabled
- Verify API key restrictions

### Midtrans Callback Not Received

- Check webhook URL configuration in Midtrans dashboard
- Verify server is accessible from internet
- Check logs for callback attempts

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:

- Create an issue in the repository
- Email: support@coffeeshop.com

---

**Built with ❤️ using Node.js, Express, TypeScript, and MongoDB**
