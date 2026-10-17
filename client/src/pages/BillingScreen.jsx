import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaRupeeSign,
  FaUser,
  FaPhoneAlt,
  FaCheckCircle,
  FaTimes,
  FaCalculator,
  FaCalendarAlt,
  FaPrint,
  FaCrown,
  FaReceipt,
  FaRedo,
  FaExclamationTriangle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const BillingScreen = () => {
  const { sales, products, addSale, updateSale, deleteSale } = useApp();

  // Set Page Title
  useEffect(() => {
    document.title = 'Billing Desk | Sri Mens Street Wear';
  }, []);

  // Clothing suggestions dynamically retrieved from database catalog
  const clothingOptionsFromDb = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.map(p => p.name);
  }, [products]);

  // Manual Billing Table Rows
  // Each row: { id, cloth, price, discount }
  const [rows, setRows] = useState([
    { id: 1, cloth: '', price: '', discount: '' }
  ]);

  // Customer & Bill Metadata
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // UPI, Cash, Card, Other
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transaction history filter & search state (from database)
  const [historyDateFilter, setHistoryDateFilter] = useState('all'); // 'all' | 'today' | 'YYYY-MM-DD'
  const [historySearch, setHistorySearch] = useState('');

  // Editing Sale state (Modal)
  const [editingSale, setEditingSale] = useState(null);

  // Calculator widget state
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcExpression, setCalcExpression] = useState('');
  const [calcResult, setCalcResult] = useState('');

  const handleCalcButtonClick = (val) => {
    if (val === '=') {
      try {
        const sanitized = calcExpression.replace(/[^0-9+\-*/().]/g, '');
        if (sanitized) {
          const res = Function('"use strict";return (' + sanitized + ')')();
          setCalcResult(String(res));
        }
      } catch (e) {
        setCalcResult('Error');
      }
    } else if (val === 'C') {
      setCalcExpression('');
      setCalcResult('');
    } else if (val === '⌫') {
      setCalcExpression(prev => prev.slice(0, -1));
    } else {
      setCalcExpression(prev => prev + val);
    }
  };

  // Add a new row to manual billing table
  const handleAddRow = () => {
    setRows(prev => [
      ...prev,
      { id: Date.now() + Math.random(), cloth: '', price: '', discount: '' }
    ]);
  };

  // Remove a row from manual billing table
  const handleRemoveRow = (id) => {
    if (rows.length === 1) {
      setRows([{ id: Date.now(), cloth: '', price: '', discount: '' }]);
      return;
    }
    setRows(prev => prev.filter(row => row.id !== id));
  };

  // Update row field
  const handleRowChange = (id, field, value) => {
    setRows(prev =>
      prev.map(row => {
        if (row.id !== id) return row;

        if (field === 'price') {
          if (value === '') return { ...row, price: '' };
          const num = Math.max(0, parseFloat(value) || 0);
          return { ...row, price: num };
        }

        if (field === 'discount') {
          if (value === '') return { ...row, discount: '' };
          const num = Math.max(0, parseFloat(value) || 0);
          return { ...row, discount: num };
        }

        if (field === 'cloth') {
          const matched = products?.find(p => p.name.toLowerCase() === value.toLowerCase().trim());
          if (matched && (!row.price || row.price === '' || row.price === 0)) {
            return { ...row, cloth: value, price: matched.price };
          }
          return { ...row, cloth: value };
        }

        return { ...row, [field]: value };
      })
    );
  };

  // Clear entire billing table
  const handleClearTable = () => {
    if (rows.some(r => r.cloth || r.price) && !window.confirm('Clear all entered billing rows?')) {
      return;
    }
    setRows([{ id: Date.now(), cloth: '', price: '', discount: '' }]);
    setCustomerName('');
    setPhone('');
    toast('Billing table reset', { icon: '🔄' });
  };

  // Row validation & calculation helper
  // Accurate numeric rounding to 2 decimals to prevent floating-point errors
  const processedRows = useMemo(() => {
    return rows.map((row, index) => {
      const sno = index + 1;
      const rawPrice = row.price === '' ? 0 : Number(row.price);
      const rawDiscount = row.discount === '' ? 0 : Number(row.discount);

      const priceNum = Math.round((rawPrice || 0) * 100) / 100;
      const discountNum = Math.round((rawDiscount || 0) * 100) / 100;

      const isDiscountExceeded = discountNum > priceNum && priceNum > 0;
      const itemTotal = Math.max(0, Math.round((priceNum - discountNum) * 100) / 100);

      return {
        ...row,
        sno,
        priceNum,
        discountNum,
        isDiscountExceeded,
        itemTotal
      };
    });
  }, [rows]);

  // Aggregate Calculations
  const grossTotal = useMemo(() => {
    return Math.round(processedRows.reduce((sum, r) => sum + r.priceNum, 0) * 100) / 100;
  }, [processedRows]);

  const totalDiscount = useMemo(() => {
    return Math.round(processedRows.reduce((sum, r) => sum + r.discountNum, 0) * 100) / 100;
  }, [processedRows]);

  const grandTotal = useMemo(() => {
    return Math.round(processedRows.reduce((sum, r) => sum + r.itemTotal, 0) * 100) / 100;
  }, [processedRows]);

  const activeRowCount = useMemo(() => {
    return processedRows.filter(r => r.cloth.trim() !== '' || r.priceNum > 0).length;
  }, [processedRows]);

  // Filtered sales history retrieved directly from database
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Date filter
      let matchesDate = true;
      if (historyDateFilter === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        matchesDate = sale.date === todayStr;
      } else if (historyDateFilter !== 'all') {
        matchesDate = sale.date === historyDateFilter;
      }

      // Search filter
      const q = historySearch.toLowerCase().trim();
      const matchesSearch = !q ||
        (sale.cloth && sale.cloth.toLowerCase().includes(q)) ||
        (sale.productName && sale.productName.toLowerCase().includes(q)) ||
        (sale.customerName && sale.customerName.toLowerCase().includes(q)) ||
        (sale.phone && sale.phone.includes(q)) ||
        (sale.billNumber && sale.billNumber.toLowerCase().includes(q));

      return matchesDate && matchesSearch;
    });
  }, [sales, historyDateFilter, historySearch]);

  const filteredSalesRevenue = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  }, [filteredSales]);

  // Submit and Record Sale
  const handleRecordSale = async (e) => {
    if (e) e.preventDefault();

    const validRows = processedRows.filter(
      r => r.cloth.trim() !== '' && r.priceNum > 0
    );

    if (validRows.length === 0) {
      toast.error('Please enter at least one clothing item with a valid price.');
      return false;
    }

    const invalidDiscountRow = validRows.find(r => r.discountNum > r.priceNum);
    if (invalidDiscountRow) {
      toast.error(`Discount (₹${invalidDiscountRow.discountNum}) cannot exceed price (₹${invalidDiscountRow.priceNum}) for "${invalidDiscountRow.cloth}".`);
      return false;
    }

    setIsSubmitting(true);
    const billNumber = `SMSW-${Date.now().toString().slice(-6)}`;

    const payload = validRows.map(r => ({
      billNumber,
      cloth: r.cloth.trim(),
      productName: r.cloth.trim(),
      price: r.priceNum,
      unitPrice: r.priceNum,
      discount: r.discountNum,
      totalAmount: r.itemTotal,
      quantity: 1,
      category: 'Clothing',
      paymentMode,
      customerName: customerName.trim(),
      phone: phone.trim(),
      date: transactionDate
    }));

    try {
      const success = await addSale(payload);
      if (success) {
        setRows([{ id: Date.now(), cloth: '', price: '', discount: '' }]);
        setCustomerName('');
        setPhone('');
        setIsSubmitting(false);
        return true;
      }
    } catch (err) {
      toast.error('An error occurred while saving the bill.');
    }
    setIsSubmitting(false);
    return false;
  };

  // Print Invoice / Receipt
  const handlePrintBill = (customItems = null, billMeta = null) => {
    const itemsToPrint = customItems || processedRows.filter(r => r.cloth.trim() !== '' && r.priceNum > 0);

    if (itemsToPrint.length === 0) {
      toast.error('No items to print. Please enter item details first.');
      return;
    }

    if (!customItems && itemsToPrint.some(r => r.discountNum > r.priceNum)) {
      toast.error('Please fix discount errors before printing.');
      return;
    }

    const printCustomer = billMeta ? billMeta.customerName : customerName;
    const printPhone = billMeta ? billMeta.phone : phone;
    const printDate = billMeta ? billMeta.date : transactionDate;
    const printPayment = billMeta ? billMeta.paymentMode : paymentMode;
    const printBillNo = billMeta?.billNumber || `SMSW-${Date.now().toString().slice(-6)}`;

    const printGross = itemsToPrint.reduce((acc, it) => acc + (it.priceNum !== undefined ? it.priceNum : (it.price || it.unitPrice || 0)), 0);
    const printDisc = itemsToPrint.reduce((acc, it) => acc + (it.discountNum !== undefined ? it.discountNum : (it.discount || 0)), 0);
    const printGrand = itemsToPrint.reduce((acc, it) => acc + (it.itemTotal !== undefined ? it.itemTotal : (it.totalAmount || 0)), 0);

    const now = new Date();
    const formattedPrintTime = billMeta?.time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Invoice #${printBillNo} - Sri Mens Street Wear</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            body {
              padding: 24px;
              color: #111827;
              background: #fff;
              max-width: 650px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 14px;
              margin-bottom: 16px;
            }
            .crown {
              font-size: 26px;
              color: #d97706;
              margin-bottom: 4px;
            }
            .brand-name {
              font-size: 24px;
              font-weight: 900;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #0b1220;
            }
            .tagline {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1.5px;
              color: #4b5563;
              margin-top: 3px;
              text-transform: uppercase;
            }
            .store-features {
              font-size: 10px;
              font-weight: 600;
              color: #6b7280;
              margin-top: 4px;
            }
            .meta-table {
              width: 100%;
              margin-bottom: 16px;
              font-size: 12px;
            }
            .meta-table td {
              padding: 3px 0;
            }
            .meta-right {
              text-align: right;
            }
            .bold {
              font-weight: 700;
            }
            .billing-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 12px;
            }
            .billing-table th {
              background-color: #f3f4f6;
              border-top: 1px solid #111;
              border-bottom: 1px solid #111;
              padding: 8px 6px;
              text-align: left;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            .billing-table td {
              padding: 8px 6px;
              border-bottom: 1px solid #e5e7eb;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .totals-container {
              border-top: 1px solid #111;
              padding-top: 10px;
              margin-bottom: 20px;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 4px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              width: 240px;
              font-size: 12px;
            }
            .grand-total-row {
              display: flex;
              justify-content: space-between;
              width: 240px;
              font-size: 16px;
              font-weight: 900;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              padding: 6px 0;
              margin-top: 4px;
              color: #0b1220;
            }
            .footer {
              text-align: center;
              border-top: 1px dashed #9ca3af;
              padding-top: 14px;
              font-size: 11px;
              color: #4b5563;
              line-height: 1.5;
            }
            .motto {
              font-size: 13px;
              font-weight: 900;
              letter-spacing: 1px;
              margin-bottom: 4px;
              color: #111827;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo.png" alt="Sri Mens Street Wear" style="max-height: 52px; margin: 0 auto 8px; display: block; border-radius: 6px;" />
            <div class="brand-name">SRI MEN'S STREET WEAR</div>
            <div class="tagline">Style Begins Here • Built for Comfort. Designed for Style.</div>
            <div class="store-features">Trendy Looks. Everyday Attitude • Shirts • Jeans • Hoodies • Tees</div>
          </div>

          <table class="meta-table">
            <tr>
              <td><span class="bold">Bill No:</span> #${printBillNo}</td>
              <td class="meta-right"><span class="bold">Date:</span> ${printDate} ${formattedPrintTime}</td>
            </tr>
            <tr>
              <td><span class="bold">Customer:</span> ${printCustomer || 'Walk-in Customer'}</td>
              <td class="meta-right"><span class="bold">Payment Mode:</span> ${printPayment}</td>
            </tr>
            ${printPhone ? `
            <tr>
              <td><span class="bold">Phone:</span> ${printPhone}</td>
              <td class="meta-right"></td>
            </tr>
            ` : ''}
          </table>

          <table class="billing-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 36px;">Sno</th>
                <th>Cloth</th>
                <th class="text-right" style="width: 80px;">Price</th>
                <th class="text-right" style="width: 80px;">Discount</th>
                <th class="text-right" style="width: 90px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsToPrint.map((it, idx) => {
                const itemCloth = it.cloth || it.productName || 'Clothing Item';
                const itemPrice = it.priceNum !== undefined ? it.priceNum : (it.price || it.unitPrice || 0);
                const itemDisc = it.discountNum !== undefined ? it.discountNum : (it.discount || 0);
                const itemTot = it.itemTotal !== undefined ? it.itemTotal : (it.totalAmount || 0);
                return `
                  <tr>
                    <td class="text-center bold">${idx + 1}</td>
                    <td class="bold">${itemCloth}</td>
                    <td class="text-right">₹${itemPrice.toLocaleString('en-IN')}</td>
                    <td class="text-right">₹${itemDisc.toLocaleString('en-IN')}</td>
                    <td class="text-right bold">₹${itemTot.toLocaleString('en-IN')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="totals-container">
            <div class="total-row">
              <span>Gross Total:</span>
              <span>₹${printGross.toLocaleString('en-IN')}</span>
            </div>
            <div class="total-row">
              <span>Total Discount:</span>
              <span style="color: #b91c1c;">- ₹${printDisc.toLocaleString('en-IN')}</span>
            </div>
            <div class="grand-total-row">
              <span>GRAND TOTAL:</span>
              <span>₹${printGrand.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="footer">
            <div class="motto">WEAR IT. OWN IT. LIVE IT.</div>
            <p>Thank you for shopping at Sri Mens Street Wear!</p>
            <p>Goods once sold can be exchanged within 7 days with original invoice.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      toast.success('Print window opened');
    } else {
      toast.error('Pop-up blocked. Please allow pop-ups to print the invoice.');
    }
  };

  // Save changes from Edit Modal
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingSale) return;

    const price = Number(editingSale.price !== undefined ? editingSale.price : editingSale.unitPrice) || 0;
    const discount = Number(editingSale.discount) || 0;

    if (discount > price) {
      toast.error('Discount cannot exceed price');
      return;
    }

    const success = await updateSale(editingSale._id, {
      cloth: (editingSale.cloth || editingSale.productName || '').trim(),
      productName: (editingSale.cloth || editingSale.productName || '').trim(),
      price,
      unitPrice: price,
      discount,
      paymentMode: editingSale.paymentMode,
      customerName: (editingSale.customerName || '').trim(),
      phone: (editingSale.phone || '').trim()
    });

    if (success) {
      setEditingSale(null);
    }
  };

  return (
    <div className="w-full space-y-5 md:space-y-6">
      {/* Suggestions datalist for Cloth text inputs retrieved dynamically from database */}
      <datalist id="clothing-suggestions">
        {clothingOptionsFromDb.map((item, idx) => (
          <option key={idx} value={item} />
        ))}
      </datalist>

      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-darknavy via-slate-900 to-darknavy border border-slate-800 rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center space-x-3.5">
            <img
              src="/logo.png"
              alt="Sri Mens Street Wear Logo"
              className="h-12 sm:h-14 w-auto max-w-[140px] sm:max-w-[170px] object-contain rounded-2xl border border-amber-500/30 shadow-md bg-darknavy p-1"
            />
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-wide text-white font-['Montserrat',sans-serif] leading-tight">
                SRI MEN'S <span className="text-amber-400">STREET WEAR</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
                Manual Item-Entry Billing Table • Sno | Cloth | Price | Discount | Total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 md:py-2.5 bg-amber-500 hover:bg-amber-600 text-darknavy font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <FaPlus className="text-[10px]" />
              <span>ADD ROW</span>
            </button>
            <button
              type="button"
              onClick={handleClearTable}
              className="flex items-center justify-center space-x-1 px-3 py-2 md:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
              title="Reset billing table"
            >
              <FaRedo className="text-[10px]" />
              <span>CLEAR</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN BILLING SECTION: Table (Left/Top) & Checkout Controls (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
        
        {/* Left / Main Table Card (Col-Span 8) */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 sm:p-5 shadow-sm lg:col-span-8 space-y-4 w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-borderCol pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-primaryTxt flex items-center gap-2">
                <span>Billing Table</span>
                <span className="text-[11px] px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold">
                  {rows.length} {rows.length === 1 ? 'Row' : 'Rows'}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-secondaryTxt">
                Enter clothing item details. Calculations update automatically per row and grand total.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-all self-start sm:self-auto"
            >
              <FaPlus className="text-[10px]" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Table Container with Controlled Local Horizontal Scrolling */}
          <div className="overflow-x-auto w-full border border-borderCol/80 rounded-2xl">
            <table className="w-full text-left border-collapse min-w-[560px] text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-100/90 text-slate-800 font-extrabold uppercase text-[10px] sm:text-[11px] tracking-wider">
                  <th className="py-2.5 px-2.5 w-12 text-center">Sno</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Cloth</th>
                  <th className="py-2.5 px-2.5 w-28 text-right">Price (₹)</th>
                  <th className="py-2.5 px-2.5 w-28 text-right">Discount (₹)</th>
                  <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                  <th className="py-2.5 px-2 w-14 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderCol/70 bg-white">
                {processedRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      row.isDiscountExceeded
                        ? 'bg-red-50/60 hover:bg-red-50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Sno */}
                    <td className="py-2.5 px-2.5 text-center font-black text-slate-700 bg-slate-50/60">
                      {row.sno}
                    </td>

                    {/* Cloth Manual Input */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        list="clothing-suggestions"
                        value={row.cloth}
                        onChange={(e) => handleRowChange(row.id, 'cloth', e.target.value)}
                        placeholder="e.g. Shirt, Jeans, Hoodie..."
                        className="w-full bg-slate-50/60 border border-borderCol focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-primaryTxt placeholder-slate-400 transition-all"
                      />
                    </td>

                    {/* Price Manual Input */}
                    <td className="py-2 px-2.5">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 font-bold text-xs pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.price}
                          onChange={(e) => handleRowChange(row.id, 'price', e.target.value)}
                          placeholder="0"
                          className="w-full bg-slate-50/60 border border-borderCol focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded-xl pl-5 pr-2 py-1.5 text-xs font-black text-right text-primaryTxt placeholder-slate-400 transition-all"
                        />
                      </div>
                    </td>

                    {/* Discount Manual Input */}
                    <td className="py-2 px-2.5">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 font-bold text-xs pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.discount}
                          onChange={(e) => handleRowChange(row.id, 'discount', e.target.value)}
                          placeholder="0"
                          className={`w-full bg-slate-50/60 border rounded-xl pl-5 pr-2 py-1.5 text-xs font-black text-right text-red-600 placeholder-slate-400 transition-all ${
                            row.isDiscountExceeded
                              ? 'border-red-500 ring-1 ring-red-400 bg-red-50/40'
                              : 'border-borderCol focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                      {row.isDiscountExceeded && (
                        <p className="text-[9px] text-red-600 font-bold mt-0.5 text-right flex items-center justify-end gap-1">
                          <FaExclamationTriangle className="text-[8px]" />
                          <span>Exceeds price</span>
                        </p>
                      )}
                    </td>

                    {/* Item Total */}
                    <td className="py-2 px-3 text-right">
                      <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        ₹{row.itemTotal.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Remove Action */}
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove row"
                        aria-label={`Remove row ${row.sno}`}
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button under table */}
          <div>
            <button
              type="button"
              onClick={handleAddRow}
              className="w-full py-2.5 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 text-amber-800 font-extrabold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
            >
              <FaPlus className="text-xs" />
              <span>Add Another Clothing Item</span>
            </button>
          </div>

          {/* Calculation Breakdown Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 items-center">
              
              {/* Gross Price */}
              <div className="space-y-0.5 sm:px-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Items Gross Price
                </span>
                <span className="text-base font-extrabold text-slate-200">
                  ₹{grossTotal.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {activeRowCount} active {activeRowCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Total Discount */}
              <div className="space-y-0.5 pt-3 sm:pt-0 sm:px-4">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Total Discount (₹)
                </span>
                <span className="text-base font-extrabold text-amber-400">
                  ₹{totalDiscount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Fixed item deductions
                </span>
              </div>

              {/* Grand Total */}
              <div className="space-y-0.5 pt-3 sm:pt-0 sm:px-4 flex flex-col sm:items-end text-left sm:text-right">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-amber-400 font-black block">
                  GRAND TOTAL
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight font-['Montserrat',sans-serif]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Sum of all Item Totals
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Details, Payment & Checkout (Col-Span 4) */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-4 sm:p-5 shadow-sm lg:col-span-4 space-y-4 w-full">
          <div className="border-b border-borderCol pb-3">
            <h2 className="text-sm sm:text-base font-extrabold text-primaryTxt flex items-center gap-2">
              <FaReceipt className="text-amber-500 text-sm" />
              <span>Checkout & Payment</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-secondaryTxt">Finalize customer details and record bill</p>
          </div>

          <form onSubmit={handleRecordSale} className="space-y-4">
            
            {/* Customer Details */}
            <div className="space-y-2">
              <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                Customer Details (Optional)
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-mutedTxt">
                    <FaUser className="text-xs" />
                  </span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-borderCol focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-primaryTxt font-medium"
                  />
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-mutedTxt">
                    <FaPhoneAlt className="text-xs" />
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number (e.g. 9840123456)"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-borderCol focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-primaryTxt font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Transaction Date */}
            <div className="space-y-1.5 pt-2 border-t border-borderCol">
              <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                Billing Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-mutedTxt">
                  <FaCalendarAlt className="text-xs" />
                </span>
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-borderCol focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-primaryTxt font-bold"
                />
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-1.5 pt-2 border-t border-borderCol">
              <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {['UPI', 'Cash', 'Card', 'Other'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      paymentMode === mode
                        ? 'bg-amber-500 text-darknavy shadow-md font-black shadow-amber-500/20'
                        : 'text-secondaryTxt bg-slate-50 hover:bg-slate-100 border border-borderCol'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-secondaryTxt">
                <span>Items Count:</span>
                <span className="font-bold text-primaryTxt">{activeRowCount}</span>
              </div>
              <div className="flex justify-between text-secondaryTxt">
                <span>Gross Total:</span>
                <span className="font-bold text-primaryTxt">₹{grossTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-secondaryTxt">
                <span>Discount:</span>
                <span className="font-bold text-red-600">-₹{totalDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 uppercase text-[10px]">Grand Total:</span>
                <span className="text-lg font-black text-amber-600">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={activeRowCount === 0 || isSubmitting}
                className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                  activeRowCount > 0 && !isSubmitting
                    ? 'bg-amber-500 hover:bg-amber-600 text-darknavy shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-borderCol'
                }`}
              >
                <FaCheckCircle className="text-sm" />
                <span>{isSubmitting ? 'RECORDING...' : 'RECORD SALE'}</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrintBill()}
                disabled={activeRowCount === 0}
                className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                  activeRowCount > 0
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-[0.99] cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-borderCol'
                }`}
              >
                <FaPrint className="text-sm text-amber-400" />
                <span>PRINT INVOICE</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* TRANSACTION & BILLING RECORDS (FROM DATABASE) */}
      <div className="bg-cardBg border border-borderCol rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 text-primaryTxt w-full overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-borderCol pb-4">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-primaryTxt flex items-center gap-2">
              <FaReceipt className="text-amber-500" />
              <span>Store Transaction & Billing Records</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full uppercase">Database</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-secondaryTxt">
              Inspect all transactions saved in database. Tap phone to call customer.
            </p>
          </div>

          {/* Quick Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search item, customer, phone, bill..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-borderCol rounded-xl focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-primaryTxt w-full sm:w-56"
            />

            {/* Scope Buttons */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-xs font-bold border border-slate-200">
              <button
                type="button"
                onClick={() => setHistoryDateFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                  historyDateFilter === 'all'
                    ? 'bg-amber-500 text-darknavy font-black shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Records
              </button>
              <button
                type="button"
                onClick={() => setHistoryDateFilter('today')}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                  historyDateFilter === 'today'
                    ? 'bg-amber-500 text-darknavy font-black shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
            </div>

            {/* Specific Date input */}
            <input
              type="date"
              value={historyDateFilter === 'all' || historyDateFilter === 'today' ? '' : historyDateFilter}
              onChange={(e) => setHistoryDateFilter(e.target.value || 'all')}
              title="Filter by specific date"
              className="px-2 py-1 text-xs bg-slate-50 border border-borderCol rounded-xl text-primaryTxt cursor-pointer"
            />

            <div className="text-xs font-bold text-slate-500 whitespace-nowrap ml-auto sm:ml-0">
              Total: <span className="text-amber-600 font-extrabold">{filteredSales.length} items</span>{' '}
              <span className="text-slate-400 font-normal">|</span>{' '}
              <span className="text-slate-900 font-extrabold">₹{filteredSalesRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Responsive Table with Local Horizontal Scroll */}
        <div className="overflow-x-auto w-full border border-borderCol/70 rounded-2xl">
          <table className="w-full text-left border-collapse min-w-[760px] text-xs">
            <thead>
              <tr className="border-b border-borderCol text-secondaryTxt font-bold bg-slate-50 text-[10px] sm:text-[11px]">
                <th className="py-2.5 px-3 w-12 text-center">S.No</th>
                <th className="py-2.5 px-3 min-w-[150px]">Cloth Item</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">Discount</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Payment</th>
                <th className="py-2.5 px-4 min-w-[140px]">Customer Details</th>
                <th className="py-2.5 px-3 text-center min-w-[110px]">Date & Time</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderCol/60 bg-white">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale, idx) => (
                  <tr key={sale._id} className="hover:bg-slate-50/70 text-primaryTxt">
                    <td className="py-2.5 px-3 text-center text-secondaryTxt font-bold">{idx + 1}</td>
                    
                    <td className="py-2.5 px-3">
                      <div className="font-extrabold text-primaryTxt">
                        {sale.cloth || sale.productName}
                      </div>
                      {sale.billNumber && (
                        <div className="text-[10px] text-amber-700 font-semibold">
                          #{sale.billNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                      ₹{(sale.price !== undefined ? sale.price : sale.unitPrice).toLocaleString('en-IN')}
                    </td>

                    <td className="py-2.5 px-3 text-right font-medium text-red-600">
                      {sale.discount > 0 ? `₹${sale.discount.toLocaleString('en-IN')}` : '₹0'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      ₹{sale.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-borderCol text-slate-700 shadow-sm">
                        {sale.paymentMode}
                      </span>
                    </td>

                    <td className="py-2.5 px-4">
                      {sale.customerName ? (
                        <div>
                          <div className="font-bold text-slate-800">{sale.customerName}</div>
                          {sale.phone && (
                            <a
                              href={`tel:${sale.phone}`}
                              className="text-[10px] text-amber-700 hover:underline flex items-center gap-1"
                            >
                              <FaPhoneAlt className="text-[8px]" />
                              <span>{sale.phone}</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-mutedTxt font-medium italic">Walk-in</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-medium text-secondaryTxt">
                      <div className="font-bold text-slate-700 text-[11px]">{sale.date || '—'}</div>
                      <div className="text-[10px] text-slate-400">{sale.time || ''}</div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handlePrintBill([sale], sale)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-800 hover:text-white rounded-lg text-slate-600 transition-colors border border-borderCol/50"
                          title="Print Receipt"
                          aria-label="Print Receipt"
                        >
                          <FaPrint className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSale(sale)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-500 hover:text-darknavy rounded-lg text-slate-600 transition-colors border border-borderCol/50"
                          title="Edit Record"
                          aria-label="Edit Record"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete record for "${sale.cloth || sale.productName}"?`)) {
                              deleteSale(sale._id);
                            }
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-red-500 hover:text-white rounded-lg text-slate-600 transition-colors border border-borderCol/50"
                          title="Delete Record"
                          aria-label="Delete Record"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-mutedTxt text-xs">
                    No matching sales records found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT SALE MODAL */}
      {editingSale && (
        <div className="fixed inset-0 z-50 bg-darknavy/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-cardBg border border-borderCol rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative text-primaryTxt max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingSale(null)}
              className="absolute top-4 right-4 text-secondaryTxt hover:text-primaryTxt p-1 rounded-lg"
              aria-label="Close edit modal"
            >
              <FaTimes />
            </button>

            <h3 className="text-sm sm:text-base font-extrabold text-primaryTxt border-b border-borderCol pb-3 mb-4 flex items-center gap-2">
              <FaEdit className="text-amber-500" />
              <span>Edit Transaction Record</span>
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                  Cloth Item
                </label>
                <input
                  type="text"
                  required
                  value={editingSale.cloth || editingSale.productName || ''}
                  onChange={(e) =>
                    setEditingSale(prev => ({
                      ...prev,
                      cloth: e.target.value,
                      productName: e.target.value
                    }))
                  }
                  className="w-full bg-slate-50 border border-borderCol focus:bg-white rounded-xl text-xs py-2 px-3 text-primaryTxt font-bold focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editingSale.price !== undefined ? editingSale.price : editingSale.unitPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingSale(prev => ({ ...prev, price: val, unitPrice: val }));
                    }}
                    className="w-full bg-slate-50 border border-borderCol focus:bg-white rounded-xl text-xs py-2 px-3 text-primaryTxt font-bold focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingSale.discount || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingSale(prev => ({ ...prev, discount: val }));
                    }}
                    className="w-full bg-slate-50 border border-borderCol focus:bg-white rounded-xl text-xs py-2 px-3 text-primaryTxt font-bold focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-secondaryTxt uppercase text-[10px]">Calculated Total:</span>
                <span className="font-black text-amber-600 text-sm">
                  ₹{Math.max(
                    0,
                    (Number(editingSale.price !== undefined ? editingSale.price : editingSale.unitPrice) || 0) -
                    (Number(editingSale.discount) || 0)
                  ).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editingSale.customerName || ''}
                  onChange={(e) =>
                    setEditingSale(prev => ({ ...prev, customerName: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-borderCol focus:bg-white rounded-xl text-xs py-2 px-3 text-primaryTxt focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editingSale.phone || ''}
                  onChange={(e) =>
                    setEditingSale(prev => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-borderCol focus:bg-white rounded-xl text-xs py-2 px-3 text-primaryTxt focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                  Payment Mode
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['UPI', 'Cash', 'Card', 'Other'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setEditingSale(prev => ({ ...prev, paymentMode: mode }))}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        editingSale.paymentMode === mode
                          ? 'bg-amber-500 text-darknavy shadow-md font-black'
                          : 'text-secondaryTxt bg-white border border-borderCol hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSale(null)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl text-secondaryTxt border border-borderCol"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-black rounded-xl text-darknavy shadow-md shadow-amber-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING QUICK POS CALCULATOR */}
      <button
        type="button"
        onClick={() => setShowCalculator(!showCalculator)}
        className="fixed bottom-20 right-4 sm:right-6 md:bottom-6 md:right-6 z-30 bg-amber-500 hover:bg-amber-600 text-darknavy p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 border-2 border-amber-300 font-black focus:outline-none focus:ring-2 focus:ring-amber-400"
        title="Open POS Calculator"
        aria-label="Open POS Calculator"
      >
        <FaCalculator className="text-lg sm:text-xl text-darknavy" />
      </button>

      {/* Calculator Card */}
      {showCalculator && (
        <div className="fixed bottom-36 right-4 sm:right-6 md:bottom-22 md:right-6 z-50 bg-darknavy/95 border border-slate-800 rounded-3xl p-4 shadow-2xl w-64 text-white animate-scaleIn backdrop-blur-md">
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-800">
            <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
              <FaCalculator className="text-[10px]" /> Quick POS Calculator
            </span>
            <button
              type="button"
              onClick={() => setShowCalculator(false)}
              className="text-xs text-slate-400 hover:text-white"
              aria-label="Close calculator"
            >
              Close
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl mb-3 text-right">
            <div className="text-[10px] text-slate-400 font-bold min-h-[14px] overflow-hidden whitespace-nowrap overflow-ellipsis">
              {calcExpression || '0'}
            </div>
            <div className="text-lg font-black text-amber-400 min-h-[28px] overflow-hidden whitespace-nowrap overflow-ellipsis">
              {calcResult || '0'}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-xs font-extrabold">
            {[
              'C', '⌫', '.', '/',
              '7', '8', '9', '*',
              '4', '5', '6', '-',
              '1', '2', '3', '+',
              '0', '(', ')', '='
            ].map((btn) => {
              const isOperator = ['/', '*', '-', '+', '='].includes(btn);
              const isClear = ['C', '⌫'].includes(btn);
              return (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleCalcButtonClick(btn)}
                  className={`p-2.5 rounded-xl transition-all ${
                    btn === '='
                      ? 'bg-amber-500 text-darknavy hover:bg-amber-400 font-black text-sm'
                      : isOperator
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                      : isClear
                      ? 'bg-slate-850 hover:bg-slate-800 text-red-400'
                      : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white'
                  }`}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingScreen;
