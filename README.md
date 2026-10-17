# Sri Mens Street Wear — Backend API Server

Express + MongoDB backend server for **Sri Mens Street Wear** Billing & Retail Management System.

## Architecture & REST Endpoints
- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/users`
- **Sales**:
  - `GET /api/sales` (query by date, paymentMode, category, search)
  - `POST /api/sales` (create single sale or full bill array of cloth rows)
  - `PUT /api/sales/:id` (edit transaction record)
  - `DELETE /api/sales/:id` (delete transaction record)
- **Dashboard**: `/api/dashboard` (summary statistics, weekly chart, payment breakdown)
- **Reports**: `/api/reports/today`, `/api/reports/date/:date`, `/api/reports/range`
- **Catalog**: `/api/products` (clothing catalog and standard retail prices)
- **Expenses**: `/api/expenses` (monthly store expense tracking)

## Environment Configuration
Configure `.env` file in `server/`:
```env
PORT=5050
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sri_mens_streetwear
JWT_SECRET=sri_mens_streetwear_secret_key_2026
```

## Scripts
```bash
# Start backend server in development mode (hot-reload)
npm run dev

# Start backend server
npm start

# Seed database with sample clothing items, admin user, and sales history
npm run seed
```
