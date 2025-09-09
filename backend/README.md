# Inventory Backend (MongoDB + Express)

This is a minimal, production-ready backend scaffold for your Inventory Management System using MongoDB (Mongoose), Express, and JWT auth.

## Features
- JWT authentication (register/login)
- Role-based access (admin, manager, staff)
- CRUD for products, warehouses, categories, parties (suppliers/customers)
- Transactions (purchase, sale, transfer) with automatic stock adjustments
- CORS, Helmet, request logging, environment-based config

## Quick Start

1. Copy env file
```bash
cd backend
cp .env.example .env
# edit .env to set MONGO_URI, JWT_SECRET, CORS_ORIGINS
```

2. Install deps
```bash
npm i
```

3. Run dev server
```bash
npm run dev
```

The API will run at http://localhost:4000

## Deploy
- Vercel: Prefer a separate server (Railway/Render) for long-running Express. Otherwise convert to serverless functions.
- Railway/Render/Hetzner: Push this folder as a separate project, set env vars, and expose port 4000.

## API Overview
- Auth: POST /api/auth/register, POST /api/auth/login
- Products: /api/products
- Warehouses: /api/warehouses
- Categories: /api/categories
- Parties (suppliers/customers): /api/parties
- Transactions: /api/transactions

See `openapi.yaml` for a starting specification.
