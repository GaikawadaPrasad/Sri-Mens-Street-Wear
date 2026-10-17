const Sale = require('../models/Sale');

// Helper function to generate report data for a date range (YYYY-MM-DD) or all time
const generateReportData = async (startDate, endDate) => {
  const query = {};
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.date = { $gte: startDate };
  } else if (endDate) {
    query.date = { $lte: endDate };
  }

  const sales = await Sale.find(query).sort({ date: -1, time: -1, createdAt: -1 });

  // Aggregated calculations
  const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalOrders = sales.length;
  const totalDiscount = sales.reduce((acc, s) => acc + (s.discount || 0), 0);
  const totalItemsSold = sales.reduce((acc, s) => acc + (s.quantity || 1), 0);
  const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // Payment Breakdown
  const paymentBreakdown = { Cash: 0, UPI: 0, Card: 0, Other: 0 };
  
  // Best Selling Item calculation
  const productQuantities = {};

  sales.forEach(s => {
    if (paymentBreakdown[s.paymentMode] !== undefined) {
      paymentBreakdown[s.paymentMode] += s.totalAmount;
    }
    const name = s.cloth || s.productName || 'Clothing Item';
    productQuantities[name] = (productQuantities[name] || 0) + (s.quantity || 1);
  });

  let bestSellingProduct = 'None';
  let maxQty = 0;
  Object.keys(productQuantities).forEach(name => {
    if (productQuantities[name] > maxQty) {
      maxQty = productQuantities[name];
      bestSellingProduct = name;
    }
  });

  return {
    summary: {
      totalSales,
      totalOrders,
      totalDiscount,
      totalItemsSold,
      averageOrderValue,
      paymentBreakdown,
      bestSellingProduct
    },
    sales
  };
};

// @desc    Get all-time report directly from database
// @route   GET /api/reports/all
// @access  Public
exports.getAllReport = async (req, res) => {
  try {
    const report = await generateReportData(null, null);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get today's report
// @route   GET /api/reports/today
// @access  Public
exports.getTodayReport = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const report = await generateReportData(today, today);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get report for a specific date
// @route   GET /api/reports/date/:date
// @access  Public
exports.getDateReport = async (req, res) => {
  try {
    const { date } = req.params;
    const report = await generateReportData(date, date);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get report for a custom date range
// @route   GET /api/reports/range
// @access  Public
exports.getRangeReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both startDate and endDate query parameters (YYYY-MM-DD)'
      });
    }

    const report = await generateReportData(startDate, endDate);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
