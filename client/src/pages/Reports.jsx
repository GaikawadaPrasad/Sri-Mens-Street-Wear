import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { format, subDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FaCalendarAlt,
  FaFilePdf,
  FaRupeeSign,
  FaShoppingCart,
  FaCoins,
  FaMobileAlt,
  FaCreditCard,
  FaCrown,
  FaTshirt,
  FaTag
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Reports = () => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Filter selection state
  const [filterType, setFilterType] = useState('all'); // all, today, yesterday, custom, range
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Fetch report data based on current inputs
  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = '/reports/all';

      if (filterType === 'today') {
        url = '/reports/today';
      } else if (filterType === 'yesterday') {
        url = `/reports/date/${yesterdayStr}`;
      } else if (filterType === 'custom') {
        url = `/reports/date/${startDate}`;
      } else if (filterType === 'range') {
        url = `/reports/range?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await api.get(url);
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Sales Reports | Sri Mens Street Wear';
    fetchReport();
  }, [filterType, startDate, endDate]);

  const handleFilterSelect = (type) => {
    setFilterType(type);
    if (type === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === 'yesterday') {
      setStartDate(yesterdayStr);
      setEndDate(yesterdayStr);
    }
  };

  const generatePDF = () => {
    if (!reportData || reportData.sales.length === 0) {
      toast.error('No sales data available to download');
      return;
    }

    try {
      const doc = new jsPDF();
      const { summary, sales } = reportData;

      // Color Palette (Dark Theme / Warm Gold Accent)
      const primaryColor = [11, 18, 32]; // #0B1220 darknavy
      const accentColor = [217, 119, 6]; // #D97706 amber gold
      const lightBg = [248, 250, 252];

      const pageWidth = doc.internal.pageSize.width;

      // Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 42, 'F');

      // Accent gold line
      doc.setFillColor(...accentColor);
      doc.rect(0, 42, pageWidth, 2.5, 'F');

      // Title & Branding
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text("SRI MEN'S STREET WEAR", 15, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(220, 220, 220);
      doc.text('Retail Sales & Billing Report Management • Style Begins Here', 15, 26);
      const periodLabel = filterType === 'range'
        ? `Report Period: RANGE (${startDate} to ${endDate})`
        : `Report Period: ${filterType.toUpperCase()} (${startDate})`;
      doc.text(periodLabel, 15, 33);

      // Metadata Info Box (Right Side Header)
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, pageWidth - 15, 20, { align: 'right' });
      doc.text('Store Terminal: #01 (Main Counter)', pageWidth - 15, 26, { align: 'right' });

      // Summary Section Header
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Key Sales Summary Metrics', 15, 54);

      // Card 1: Revenue
      doc.setFillColor(...lightBg);
      doc.rect(15, 60, 55, 26, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 60, 55, 26, 'D');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL REVENUE', 20, 67);
      doc.setFontSize(13);
      doc.setTextColor(...accentColor);
      doc.text(`INR ${summary.totalSales.toLocaleString('en-IN')}`, 20, 78);

      // Card 2: Orders
      doc.setFillColor(...lightBg);
      doc.rect(78, 60, 55, 26, 'F');
      doc.rect(78, 60, 55, 26, 'D');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('ITEMS SOLD', 83, 67);
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text(`${summary.totalItemsSold || summary.totalOrders}`, 83, 78);

      // Card 3: AOV
      doc.setFillColor(...lightBg);
      doc.rect(140, 60, 55, 26, 'F');
      doc.rect(140, 60, 55, 26, 'D');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('AVERAGE TICKET', 145, 67);
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text(`INR ${summary.averageOrderValue.toLocaleString('en-IN')}`, 145, 78);

      // Payment Summary Bar
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const paymentText = `Payment Split: UPI: INR ${summary.paymentBreakdown.UPI.toLocaleString('en-IN')} | Cash: INR ${summary.paymentBreakdown.Cash.toLocaleString('en-IN')} | Card: INR ${summary.paymentBreakdown.Card.toLocaleString('en-IN')} | Other: INR ${summary.paymentBreakdown.Other.toLocaleString('en-IN')}`;
      doc.text(paymentText, 15, 94);

      // Sales Transactions Table
      const tableData = sales.map((sale, idx) => [
        idx + 1,
        sale.cloth || sale.productName,
        `INR ${(sale.price !== undefined ? sale.price : sale.unitPrice).toLocaleString('en-IN')}`,
        sale.discount > 0 ? `INR ${sale.discount.toLocaleString('en-IN')}` : 'INR 0',
        `INR ${sale.totalAmount.toLocaleString('en-IN')}`,
        sale.paymentMode,
        sale.customerName ? `${sale.customerName}${sale.phone ? ` (${sale.phone})` : ''}` : 'Walk-in',
        `${sale.date} ${sale.time}`
      ]);

      autoTable(doc, {
        head: [['#', 'Cloth Item', 'Price', 'Discount', 'Total', 'Payment', 'Customer', 'Date / Time']],
        body: tableData,
        startY: 100,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        styles: {
          fontSize: 8,
          cellPadding: 3.5,
          textColor: [51, 65, 85]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { fontStyle: 'bold' },
          2: { halign: 'right' },
          3: { halign: 'right', textColor: [185, 28, 28] },
          4: { halign: 'right', fontStyle: 'bold' },
          5: { halign: 'center' },
          6: { cellWidth: 35 },
          7: { halign: 'center', cellWidth: 30 }
        },
        didDrawPage: (data) => {
          const str = `Page ${doc.internal.getNumberOfPages()}`;
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(str, pageWidth - 20, doc.internal.pageSize.height - 10);
          doc.text("Sri Mens Street Wear - Wear It. Own It. Live It.", 15, doc.internal.pageSize.height - 10);
        }
      });

      const fileName = `Sri_Mens_Streetwear_Report_${startDate}_to_${endDate}.pdf`;
      doc.save(fileName);
      toast.success('Report PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to generate PDF');
    }
  };

  const summary = reportData?.summary || {
    totalSales: 0,
    totalOrders: 0,
    totalDiscount: 0,
    totalItemsSold: 0,
    averageOrderValue: 0,
    bestSellingProduct: 'None',
    paymentBreakdown: { Cash: 0, UPI: 0, Card: 0, Other: 0 }
  };

  const salesList = reportData?.sales || [];

  return (
    <div className="space-y-6">
      {/* Top Controls Row with Brand Logo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cardBg border border-borderCol rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <img
            src="/logo.png"
            alt="Sri Mens Street Wear Logo"
            className="h-12 sm:h-14 w-auto max-w-[140px] sm:max-w-[170px] object-contain rounded-2xl border border-amber-500/30 shadow-md bg-darknavy p-1"
          />
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-primaryTxt flex items-center gap-2 font-['Montserrat',sans-serif]">
              <FaFilePdf className="text-amber-500" />
              <span>Sales Reports & Invoices</span>
            </h2>
            <p className="text-xs text-secondaryTxt">
              Export and inspect sales figures for Sri Mens Street Wear
            </p>
          </div>
        </div>

        {/* Action: Download PDF */}
        <button
          type="button"
          onClick={generatePDF}
          disabled={salesList.length === 0}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all ${
            salesList.length > 0
              ? 'bg-amber-500 hover:bg-amber-600 text-darknavy shadow-amber-500/20 cursor-pointer font-black'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-borderCol'
          }`}
        >
          <FaFilePdf className="text-sm" />
          <span>DOWNLOAD PDF REPORT</span>
        </button>
      </div>

      {/* Date Filter Tabs */}
      <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-borderCol pb-3">
          {[
            { id: 'all', label: 'All Records (Database)' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'custom', label: 'Specific Day' },
            { id: 'range', label: 'Date Range' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleFilterSelect(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === tab.id
                  ? 'bg-amber-500 text-darknavy shadow-md shadow-amber-500/20 font-black'
                  : 'text-secondaryTxt bg-slate-50 hover:bg-slate-100 border border-borderCol'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Inputs if Custom or Range */}
        {(filterType === 'custom' || filterType === 'range') && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-borderCol">
              <FaCalendarAlt className="text-amber-500 text-xs" />
              <span className="text-[10px] font-bold text-secondaryTxt uppercase">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-primaryTxt focus:ring-0 p-0"
              />
            </div>

            {filterType === 'range' && (
              <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-borderCol">
                <FaCalendarAlt className="text-amber-500 text-xs" />
                <span className="text-[10px] font-bold text-secondaryTxt uppercase">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-0 text-xs font-bold text-primaryTxt focus:ring-0 p-0"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-secondaryTxt">Total Revenue</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            ₹{summary.totalSales.toLocaleString('en-IN')}
          </h3>
        </div>

        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-secondaryTxt">Items Sold</span>
          <h3 className="text-2xl font-black text-primaryTxt mt-1">
            {summary.totalItemsSold || summary.totalOrders}
          </h3>
        </div>

        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-secondaryTxt">Discounts Given</span>
          <h3 className="text-2xl font-black text-red-600 mt-1">
            ₹{(summary.totalDiscount || 0).toLocaleString('en-IN')}
          </h3>
        </div>

        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-secondaryTxt">Top Selling Cloth</span>
          <h3 className="text-sm font-black text-primaryTxt mt-1 truncate" title={summary.bestSellingProduct}>
            {summary.bestSellingProduct}
          </h3>
        </div>
      </div>

      {/* Table of Transactions */}
      <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-borderCol pb-3">
          <h3 className="text-base font-extrabold text-primaryTxt">
            Transaction Details
          </h3>
          <span className="text-xs font-bold text-secondaryTxt">
            {salesList.length} records found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-borderCol bg-slate-50 text-secondaryTxt font-bold">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4">Cloth Item</th>
                <th className="py-3 px-3 text-right">Price</th>
                <th className="py-3 px-3 text-right">Discount</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-center">Payment</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3 text-center">Date / Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderCol/60">
              {salesList.length > 0 ? (
                salesList.map((sale, idx) => (
                  <tr key={sale._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 text-center text-secondaryTxt font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-primaryTxt">
                      {sale.cloth || sale.productName}
                      {sale.billNumber && (
                        <span className="ml-2 text-[10px] text-amber-700">#{sale.billNumber}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      ₹{(sale.price !== undefined ? sale.price : sale.unitPrice).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-red-600">
                      ₹{(sale.discount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      ₹{sale.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {sale.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {sale.customerName ? (
                        <div>
                          <span className="font-bold">{sale.customerName}</span>
                          {sale.phone && (
                            <a
                              href={`tel:${sale.phone}`}
                              className="text-[10px] text-amber-700 hover:underline block"
                            >
                              {sale.phone}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-mutedTxt italic">Walk-in</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-secondaryTxt font-medium">
                      {sale.date} {sale.time}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-mutedTxt">
                    {loading ? 'Loading report data...' : 'No sales records found for this period.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
