# MongoDB Backend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   # or
   bun install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your MongoDB connection string:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory_db
   JWT_SECRET=your_super_secret_key_here
   CORS_ORIGINS=http://localhost:5173
   ```

3. **Start the Server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

## MongoDB Setup Options

### Option 1: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Replace `<username>`, `<password>`, and `<cluster>` in the URI

### Option 2: Local MongoDB
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community  # macOS
# or follow official MongoDB installation guide

# Start MongoDB
brew services start mongodb/brew/mongodb-community

# Use local connection string
MONGO_URI=mongodb://localhost:27017/inventory_db
```

## Default Admin User

The system will automatically create an admin user on first run:
- **Email**: `admin@system.com`
- **Password**: `admin123`
- **Role**: `admin`

**⚠️ Change these credentials immediately in production!**

## API Endpoints

- Health Check: `GET /api/health`
- Authentication: `POST /api/auth/login`, `POST /api/auth/register`
- Products: `GET|POST|PUT|DELETE /api/products`
- Categories: `GET|POST|PUT|DELETE /api/categories`
- Warehouses: `GET|POST|PUT|DELETE /api/warehouses`
- Transactions: `GET|POST|DELETE /api/transactions`
- Stock: `GET /api/stock`, `GET /api/stock/alerts`

## Frontend Configuration

Your frontend will automatically prompt you to configure the API URL on first visit.
Enter your backend URL (e.g., `https://your-api.herokuapp.com/api` or `http://localhost:4000/api` for local development).

## Deployment

### Deploy to Heroku
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set MONGO_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your-secret"
heroku config:set CORS_ORIGINS="https://your-frontend.com"

# Deploy
git push heroku main
```

### Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

## Production Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret (32+ characters)
- [ ] Configure proper CORS origins
- [ ] Enable MongoDB authentication
- [ ] Set up SSL certificates
- [ ] Configure environment-specific logging
- [ ] Set up database backups