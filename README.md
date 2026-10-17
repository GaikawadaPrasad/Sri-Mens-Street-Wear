# Sri Mens Street Wear — Billing & Retail Management System

A production-ready retail web application built for **Sri Mens Street Wear**. Designed with a mobile-first responsive layout for store staff on smartphones, tablets, POS terminals, and desktops.

![Sri Mens Street Wear Logo](client/public/logo.jpg)

> **Motto**: *Built for Comfort. Designed for Style. • Style Begins Here • Wear It. Own It. Live It.*

---

## 🌟 Key Application Features

1. **Manual Item-Entry Billing Table (Main Feature)**:
   - Required Table Columns: **`Sno | Cloth | Price | Discount | Total`**
   - **Automatic Serial Numbers**: Generates consecutive numbering (`1, 2, 3...`) automatically.
   - **Manual Cloth Entry**: Free text input with quick suggestions (e.g. *Cotton Shirt, Slim Jeans, Graphic Tee, Hoodie, Bomber Jacket*).
   - **Accurate Discount Logic**: Fixed currency amount per item (`Item Total = Price - Discount`).
   - **Grand Total Calculation**: Dynamically sums all row totals in real-time.
   - **Validation**: Rejects negative prices, negative discounts, and discounts exceeding item prices.
   - **Add & Remove Rows**: Easily add rows with `(+) Add Item` or delete unwanted rows with auto renumbering.
   - **One-Click Invoice Printing**: Produces beautifully branded receipts with store header, metadata, items table, and thank you footer.

2. **Dashboard & Retail Analytics**:
   - Today's Revenue, Total Bills, Clothes Sold, Average Order Value (AOV), and Top Mover item.
   - 7-Day Revenue trend line chart.
   - Payment method breakdown doughnut chart (UPI, Cash, Card, Other).
   - Top 5 selling clothes of all time.
   - Real-time recent transaction feed.

3. **Clothing Catalog & Price Guide**:
   - Manage standard retail price guides across categories: *Shirts, Jeans, T-Shirts, Hoodies, Footwear, Accessories, Trousers, Jackets*.
   - Manage size and color options.

4. **Comprehensive Reporting & PDF Downloads**:
   - Filter sales by Today, Yesterday, Specific Date, or Custom Date Ranges.
   - High-fidelity PDF report generation using `jsPDF` + `autoTable` with store branding and itemized breakdowns.

5. **Store Expense Tracker**:
   - Categorized logging of store overheads: *Stock/Inventory Purchases, Rent, Utilities, Staff Wages, Packaging & Bags, Maintenance*.
   - Monthly expense summaries and breakdown charts.

6. **Mobile Optimization & Hamburger Navigation**:
   - Responsive layouts tested at 320px, 360px, 375px, 390px, 430px, tablet, and desktop viewports.
   - Touch-friendly drawer navigation with accessible keyboard support (Escape dismiss).
   - Zero horizontal page overflow.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 (Vite), Tailwind CSS 3, React Router v7, Axios, React Icons, Date-Fns, jsPDF + AutoTable, Chart.js + React-Chartjs-2, React Hot Toast.
- **Backend**: Node.js, Express.js (MVC architecture, RESTful API).
- **Database**: MongoDB (via Mongoose models: `Sale`, `Product`, `Expense`, `User`).
- **Authentication**: JWT token authentication with role-based access (`admin` / `staff`) and admin approval workflow.

---

## 🚀 Setup & Running Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended, tested on v22.17)
- [MongoDB Community Server](https://www.mongodb.com/) running on `localhost:27017`

### Step 1: Install Dependencies

1. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

### Step 2: Configure Environment

In the `server/` directory, verify or adjust `.env`:
```env
PORT=5050
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sri_mens_streetwear
JWT_SECRET=sri_mens_streetwear_secret_key_2026
```

### Step 3: Seed Sample Clothing Data

Populate the database with sample garments, default administrator account (`admin` / `admin123`), and 7-day sales activity:
```bash
cd server
npm run seed
```

### Step 4: Run Development Servers

1. **Start Backend Server** (runs on port `5050`):
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend Dev Server** (runs on port `5173`):
   ```bash
   cd ../client
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
   Default Credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

---

## 📦 Production Build

To compile a production bundle:
```bash
cd client
npm run build
```
The optimized bundle will be compiled into `client/dist`.
