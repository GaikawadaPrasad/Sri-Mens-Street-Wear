require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to Database
connectDB().then(() => {
  seedAdminUser();
});

async function seedAdminUser() {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        approved: true
      });
      console.log('Default admin user seeded successfully (admin / admin123)');
    }
  } catch (error) {
    console.error('Error seeding default admin user:', error);
  }
}

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5050',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5050',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    return callback(null, true); // Allow dev and client origins seamlessly
  },
  credentials: true
}));
app.use(express.json());

const { protect } = require('./utils/authMiddleware');

// Routes mapping
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', protect, require('./routes/productRoutes'));
app.use('/api/sales', protect, require('./routes/saleRoutes'));
app.use('/api/dashboard', protect, require('./routes/dashboardRoutes'));
app.use('/api/reports', protect, require('./routes/reportRoutes'));
app.use('/api/expenses', protect, require('./routes/expenseRoutes'));

// For Production: serve static assets from frontend if built
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Sri Mens Street Wear Billing & Retail Management System API is running...');
  });
}

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
