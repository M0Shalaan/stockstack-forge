# IMS MongoDB Backend API

A robust REST API for Inventory Management System built with Express.js, MongoDB, and TypeScript.

## Features

- **Authentication**: JWT-based auth with role-based access control (admin, manager, staff)
- **CRUD Operations**: Full CRUD for products, warehouses, categories, parties, and transactions
- **Stock Management**: Real-time stock tracking with automatic adjustments
- **Validation**: Comprehensive input validation using Zod
- **Error Handling**: Centralized error handling with detailed responses
- **Security**: CORS, Helmet, and JWT token validation
- **Pagination**: Built-in pagination for all list endpoints

## Quick Start

1. **Install dependencies:**
```bash
cd backend
npm install
npm install zod@^3.25.76
```

2. **Environment Setup:**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
```

3. **Start Development Server:**
```bash
npm run dev
```

## Environment Variables

```env
PORT=4000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/ims
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/profile` - Get user profile

### Products, Warehouses, Categories, Parties, Transactions
- Standard CRUD operations with role-based permissions
- Pagination and search support
- Input validation

### Stock Management
- `GET /api/stock` - Get stock levels across warehouses
- `GET /api/stock/alerts` - Get low stock alerts

## Response Format

```json
{
  "success": true,
  "data": "...",
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

## Features

- Automatic stock adjustments for transactions
- Database transactions for data consistency
- Comprehensive error handling
- Role-based access control
- Input validation with Zod
- MongoDB connection with retry logic
- Graceful shutdown handling

See `openapi.yaml` for detailed API specification.
