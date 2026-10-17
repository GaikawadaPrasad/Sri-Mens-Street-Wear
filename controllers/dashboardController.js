const Sale = require('../models/Sale');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard
// @access  Public
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Find all sales in DB
    const allSales = await Sale.find().sort({ createdAt: -1 });

    // Today's sales
    const todaySales = allSales.filter(sale => sale.date === today);

    // Calculate Today's Stats
    const todayRevenue = todaySales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const todayOrders = todaySales.length;
    const todayAOV = todayOrders > 0 ? Math.round(todayRevenue / todayOrders) : 0;
    const todayItemsSold = todaySales.reduce((acc, sale) => acc + (sale.quantity || 1), 0);
    const todayDiscountGiven = todaySales.reduce((acc, sale) => acc + (sale.discount || 0), 0);

    // Calculate All-Time Stats from Database
    const allTimeRevenue = allSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const allTimeOrders = allSales.length;
    const allTimeAOV = allTimeOrders > 0 ? Math.round(allTimeRevenue / allTimeOrders) : 0;
    const allTimeItemsSold = allSales.reduce((acc, sale) => acc + (sale.quantity || 1), 0);
    const allTimeDiscountGiven = allSales.reduce((acc, sale) => acc + (sale.discount || 0), 0);

    // Payment Method Breakdown (across all sales or today's sales if today has sales)
    const paymentSource = todaySales.length > 0 ? todaySales : allSales;
    const paymentBreakdown = {
      Cash: 0,
      UPI: 0,
      Card: 0,
      Other: 0
    };
    paymentSource.forEach(sale => {
      if (paymentBreakdown[sale.paymentMode] !== undefined) {
        paymentBreakdown[sale.paymentMode] += sale.totalAmount;
      } else {
        paymentBreakdown.Other = (paymentBreakdown.Other || 0) + sale.totalAmount;
      }
    });

    // Best Selling Item (Today vs All-Time)
    const todayItemQuantities = {};
    todaySales.forEach(sale => {
      const key = sale.cloth || sale.productName || 'Unknown Item';
      todayItemQuantities[key] = (todayItemQuantities[key] || 0) + (sale.quantity || 1);
    });

    let bestSellingItem = 'None';
    let maxTodayQty = 0;
    Object.keys(todayItemQuantities).forEach(name => {
      if (todayItemQuantities[name] > maxTodayQty) {
        maxTodayQty = todayItemQuantities[name];
        bestSellingItem = name;
      }
    });

    // Top 5 selling clothing items overall
    const topProductsAgg = await Sale.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$cloth', '$productName'] },
          quantity: { $sum: { $ifNull: ['$quantity', 1] } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);

    const topFiveItems = topProductsAgg.map(item => ({
      name: item._id || 'Clothing Item',
      quantity: item.quantity,
      revenue: item.revenue
    }));

    // If bestSellingItem today is None, fall back to top product from database
    if (bestSellingItem === 'None' && topFiveItems.length > 0) {
      bestSellingItem = topFiveItems[0].name;
    }

    // Recent 10 sales
    const recentSales = allSales.slice(0, 10);

    // Last 7 days sales chart data
    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];

      // Match sales by date string
      const daySales = allSales.filter(s => s.date === dateString);
      const dayRevenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      weeklyChart.push({
        date: dateString,
        displayDate: `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`,
        revenue: dayRevenue,
        orders: daySales.length
      });
    }

    res.status(200).json({
      success: true,
      data: {
        todayStats: {
          revenue: todayRevenue,
          orders: todayOrders,
          totalItemsSold: todayItemsSold,
          totalDiscountGiven: todayDiscountGiven,
          bestSellingItem,
          averageOrderValue: todayAOV
        },
        allTimeStats: {
          revenue: allTimeRevenue,
          orders: allTimeOrders,
          totalItemsSold: allTimeItemsSold,
          totalDiscountGiven: allTimeDiscountGiven,
          averageOrderValue: allTimeAOV
        },
        paymentBreakdown,
        topFiveItems,
        recentSales,
        weeklyChart
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
