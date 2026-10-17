import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FaRupeeSign, FaShoppingCart, FaCrown, FaTshirt, FaTag, FaPercent, FaCoins, FaCreditCard, FaMobileAlt, FaClock } from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { dashboardData, fetchDashboardStats, loading, user } = useApp();
  const [statsPeriod, setStatsPeriod] = React.useState('allTime'); // 'allTime' | 'today'

  useEffect(() => {
    document.title = 'Dashboard | Sri Mens Street Wear';
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const activeStats = (statsPeriod === 'allTime' && dashboardData?.allTimeStats)
    ? {
        revenue: dashboardData.allTimeStats.revenue,
        orders: dashboardData.allTimeStats.orders,
        bestSellingItem: dashboardData.todayStats?.bestSellingItem || (dashboardData?.topFiveItems?.[0]?.name || 'None'),
        totalItemsSold: dashboardData.allTimeStats.totalItemsSold,
        totalDiscountGiven: dashboardData.allTimeStats.totalDiscountGiven,
        averageOrderValue: dashboardData.allTimeStats.averageOrderValue
      }
    : (dashboardData?.todayStats || {
        revenue: 0,
        orders: 0,
        bestSellingItem: 'None',
        totalItemsSold: 0,
        totalDiscountGiven: 0,
        averageOrderValue: 0
      });

  const stats = activeStats;

  const paymentBreakdown = dashboardData?.paymentBreakdown || {
    Cash: 0,
    UPI: 0,
    Card: 0,
    Other: 0
  };

  const topFiveItems = dashboardData?.topFiveItems || [];
  const recentSales = dashboardData?.recentSales || [];
  const weeklyChart = dashboardData?.weeklyChart || [];

  // Line Chart Config
  const lineChartData = {
    labels: weeklyChart.map(day => day.displayDate),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: weeklyChart.map(day => day.revenue),
        borderColor: '#F59E0B', // amber-500
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#D97706',
        pointHoverRadius: 8
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0B1220',
        titleColor: '#fff',
        bodyColor: '#f3f4f6',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ₹${context.parsed.y.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#64748B',
          font: {
            family: 'Outfit'
          },
          callback: (value) => `₹${value}`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748B',
          font: {
            family: 'Outfit'
          }
        }
      }
    }
  };

  // Doughnut Chart Config (Payment methods)
  const doughnutData = {
    labels: ['UPI', 'Cash', 'Card', 'Other'],
    datasets: [
      {
        data: [
          paymentBreakdown.UPI,
          paymentBreakdown.Cash,
          paymentBreakdown.Card,
          paymentBreakdown.Other
        ],
        backgroundColor: [
          '#F59E0B', // UPI - Amber
          '#10B981', // Cash - Emerald
          '#6366F1', // Card - Indigo
          '#94A3B8'  // Other - Slate
        ],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          font: {
            family: 'Outfit',
            size: 11,
            weight: 600
          },
          color: '#64748B'
        }
      },
      tooltip: {
        backgroundColor: '#0B1220',
        callbacks: {
          label: (context) => ` ${context.label}: ₹${context.parsed.toLocaleString('en-IN')}`
        }
      }
    },
    cutout: '72%'
  };

  return (
    <div className="space-y-6">
      {/* Welcome Bar with Store Logo & Motto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cardBg border border-borderCol rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <img
            src="/logo.png"
            alt="Sri Mens Street Wear Logo"
            className="h-12 sm:h-14 w-auto max-w-[140px] sm:max-w-[170px] object-contain rounded-2xl border border-amber-500/30 shadow-md bg-darknavy p-1"
          />
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-primaryTxt flex items-center gap-1.5 font-['Montserrat',sans-serif]">
              <span>Welcome,</span>
              <span className="text-amber-600 capitalize">{user?.username || 'Staff'}</span>
              <span className="text-lg">👑</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-secondaryTxt">
              Sri Mens Street Wear • Style Begins Here • Retail Intelligence
            </p>
          </div>
        </div>

        {/* Database Metric Scope Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => setStatsPeriod('allTime')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statsPeriod === 'allTime'
                  ? 'bg-amber-500 text-darknavy font-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records (Database)
            </button>
            <button
              type="button"
              onClick={() => setStatsPeriod('today')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statsPeriod === 'today'
                  ? 'bg-amber-500 text-darknavy font-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today's Live
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Revenue */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider text-secondaryTxt font-black">
              {statsPeriod === 'allTime' ? 'Total Revenue' : "Today's Sales"}
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl text-sm">
              <FaRupeeSign />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-amber-600 tracking-tight">
              ₹{activeStats.revenue.toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] text-secondaryTxt font-medium">
              {statsPeriod === 'allTime' ? 'Database all-time' : 'Recorded today'}
            </span>
          </div>
        </div>

        {/* Total Orders / Bills */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider text-secondaryTxt font-black">
              Total Bills
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl text-sm">
              <FaShoppingCart />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-primaryTxt tracking-tight">
              {activeStats.orders}
            </h3>
            <span className="text-[10px] text-secondaryTxt font-medium">Transactions</span>
          </div>
        </div>

        {/* Clothes Sold */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider text-secondaryTxt font-black">
              Items Sold
            </span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl text-sm">
              <FaTshirt />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-purple-600 tracking-tight">
              {activeStats.totalItemsSold || activeStats.orders}
            </h3>
            <span className="text-[10px] text-secondaryTxt font-medium">Garments/Accessories</span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider text-secondaryTxt font-black">
              Avg Bill Value
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm">
              <FaPercent />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-emerald-600 tracking-tight">
              ₹{activeStats.averageOrderValue.toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] text-secondaryTxt font-medium">Per customer ticket</span>
          </div>
        </div>

        {/* Discounts Given */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider text-secondaryTxt font-black">
              Discounts Given
            </span>
            <span className="p-2 bg-red-50 text-red-600 rounded-xl text-sm">
              <FaCoins />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-red-600 tracking-tight">
              ₹{(activeStats.totalDiscountGiven || 0).toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] text-secondaryTxt font-medium">Total savings given</span>
          </div>
        </div>

        {/* Best Selling Item */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider text-secondaryTxt font-black">
              Top Mover
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl text-sm">
              <FaCrown />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xs font-black text-primaryTxt tracking-tight truncate" title={activeStats.bestSellingItem}>
              {activeStats.bestSellingItem}
            </h3>
            <span className="text-[10px] text-secondaryTxt font-medium">Highest units</span>
          </div>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Weekly Sales Trend Line Chart (Col 8) */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-extrabold text-primaryTxt">
                Weekly Revenue Trend
              </h3>
              <p className="text-xs text-secondaryTxt">7-day sales progression</p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-secondaryTxt font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Daily Revenue</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Payment Methods Doughnut (Col 4) */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-base font-extrabold text-primaryTxt">
              Payment Methods
            </h3>
            <p className="text-xs text-secondaryTxt">Today's transactions breakdown</p>
          </div>
          <div className="h-56 w-full relative flex items-center justify-center">
            {stats.revenue > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-xs text-secondaryTxt">
                No transactions recorded today yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Lower Row: Top Selling Items & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Selling Clothes (Col 5) */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm lg:col-span-5 space-y-3">
          <div>
            <h3 className="text-base font-extrabold text-primaryTxt">
              Top Selling Clothes
            </h3>
            <p className="text-xs text-secondaryTxt">Overall highest volume items</p>
          </div>
          <div className="divide-y divide-borderCol">
            {topFiveItems.length > 0 ? (
              topFiveItems.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-primaryTxt">{item.name}</div>
                      <div className="text-[10px] text-secondaryTxt">{item.quantity} sold</div>
                    </div>
                  </div>
                  <span className="font-black text-amber-700">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-secondaryTxt text-xs">
                No items sold yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions Panel (Col 7) */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm lg:col-span-7 space-y-3">
          <div>
            <h3 className="text-base font-extrabold text-primaryTxt">
              Recent Transactions
            </h3>
            <p className="text-xs text-secondaryTxt">Latest sales recorded</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderCol text-secondaryTxt font-bold">
                  <th className="py-2">Cloth Item</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Discount</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="py-2 text-center">Mode</th>
                  <th className="py-2 text-center">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderCol/60">
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold text-primaryTxt">
                        {sale.cloth || sale.productName}
                      </td>
                      <td className="py-2.5 text-right font-medium text-secondaryTxt">
                        ₹{(sale.price !== undefined ? sale.price : sale.unitPrice).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 text-right font-medium text-red-600">
                        {sale.discount > 0 ? `₹${sale.discount}` : '₹0'}
                      </td>
                      <td className="py-2.5 text-right font-black text-slate-900">
                        ₹{sale.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {sale.paymentMode}
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-secondaryTxt font-medium">
                        {sale.time}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-secondaryTxt">
                      No recent sales found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
