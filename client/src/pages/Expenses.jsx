import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FaPlus, FaTrash, FaCalendarAlt, FaFileInvoiceDollar, FaWallet, FaInfoCircle, FaBoxes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = [
  'Stock/Inventory',
  'Rent',
  'Utilities',
  'Salaries',
  'Packaging',
  'Maintenance',
  'Other'
];

const Expenses = () => {
  const {
    expenses,
    expenseSummary,
    user,
    fetchExpenses,
    addExpense,
    deleteExpense,
    loading
  } = useApp();

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  // Form states
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Stock/Inventory');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  useEffect(() => {
    document.title = 'Store Expenses | Sri Mens Street Wear';
    fetchExpenses(selectedMonth);
  }, [selectedMonth, fetchExpenses]);

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!itemName || !amount || !category || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitLoading(true);
    const payload = {
      itemName: itemName.trim(),
      amount: Number(amount),
      category,
      date,
      notes: notes.trim()
    };

    const success = await addExpense(payload);
    if (success) {
      setItemName('');
      setAmount('');
      setCategory('Stock/Inventory');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
    }
    setIsSubmitLoading(false);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this store expense record?')) {
      await deleteExpense(id, selectedMonth);
    }
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'Stock/Inventory':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Rent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Utilities':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Salaries':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Packaging':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Maintenance':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 text-primaryTxt">
      {/* Top Banner Row */}
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-cardBg border border-borderCol rounded-3xl p-4 sm:p-6 shadow-sm gap-4">
        <div className="flex items-center space-x-3.5">
          <img
            src="/logo.png"
            alt="Sri Mens Street Wear Logo"
            className="h-12 sm:h-14 w-auto max-w-[140px] sm:max-w-[170px] object-contain rounded-2xl border border-amber-500/30 shadow-md bg-darknavy p-1"
          />
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-primaryTxt md:text-2xl flex items-center space-x-2 font-['Montserrat',sans-serif]">
              <FaWallet className="text-amber-500 text-xl md:text-2xl" />
              <span>Store Expenses Management</span>
            </h2>
            <p className="text-xs text-secondaryTxt">
              Log and track garment stock purchases, shop rent, staff wages, utilities, packaging and maintenance.
            </p>
          </div>
        </div>

        {/* Month Selector Filter & All-Time Toggle */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setSelectedMonth(selectedMonth === 'all' ? currentMonthStr : 'all')}
            className={`px-3 py-2 rounded-2xl text-xs font-extrabold border transition-all ${
              selectedMonth === 'all'
                ? 'bg-amber-500 text-darknavy border-amber-500 shadow-sm font-black'
                : 'bg-slate-50 text-slate-700 border-borderCol hover:bg-slate-100'
            }`}
          >
            {selectedMonth === 'all' ? 'All Time (DB)' : 'Show All'}
          </button>
          {selectedMonth !== 'all' && (
            <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-borderCol">
              <FaCalendarAlt className="text-amber-500 text-xs" />
              <span className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-0 font-extrabold text-xs text-primaryTxt focus:ring-0 focus:outline-none py-0 px-0.5 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expense card */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-secondaryTxt font-black tracking-wider uppercase block">Total Spent (Month)</span>
            <span className="text-xl font-black text-amber-600">
              ₹{(expenseSummary?.totalAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="p-3 bg-amber-50 text-amber-600 rounded-2xl text-base"><FaWallet /></span>
        </div>

        {/* Stock / Inventory Purchases */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-secondaryTxt font-black tracking-wider uppercase block">Garment Stocks</span>
            <span className="text-xl font-black text-blue-600">
              ₹{(expenseSummary?.categoryBreakdown?.['Stock/Inventory'] || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl text-base"><FaBoxes /></span>
        </div>

        {/* Rent & Utilities */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-secondaryTxt font-black tracking-wider uppercase block">Rent & Electricity</span>
            <span className="text-xl font-black text-indigo-600">
              ₹{(
                (expenseSummary?.categoryBreakdown?.Rent || 0) +
                (expenseSummary?.categoryBreakdown?.Utilities || 0)
              ).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-base"><FaFileInvoiceDollar /></span>
        </div>

        {/* Salaries & Operations */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-secondaryTxt font-black tracking-wider uppercase block">Staff Salaries & Ops</span>
            <span className="text-xl font-black text-purple-600">
              ₹{(
                (expenseSummary?.categoryBreakdown?.Salaries || 0) +
                (expenseSummary?.categoryBreakdown?.Packaging || 0) +
                (expenseSummary?.categoryBreakdown?.Maintenance || 0) +
                (expenseSummary?.categoryBreakdown?.Other || 0)
              ).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="p-3 bg-purple-50 text-purple-600 rounded-2xl text-base"><FaFileInvoiceDollar /></span>
        </div>
      </div>

      {/* Main Grid: Form (Admin) + Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm lg:col-span-4 space-y-4">
          <div className="border-b border-borderCol pb-3">
            <h3 className="text-base font-extrabold text-primaryTxt flex items-center gap-2">
              <FaPlus className="text-amber-500 text-xs" />
              <span>Record New Expense</span>
            </h3>
            <p className="text-xs text-secondaryTxt">Add purchase or operational overhead</p>
          </div>

          <form onSubmit={handleSubmitExpense} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondaryTxt uppercase">Expense Description *</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Denim Jeans Batch Purchase"
                className="w-full bg-white border border-borderCol rounded-xl py-2 px-3 focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondaryTxt uppercase">Amount (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-borderCol rounded-xl py-2 px-3 font-bold focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondaryTxt uppercase">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-borderCol rounded-xl py-2 px-2.5 focus:border-amber-500 font-semibold"
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondaryTxt uppercase">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-borderCol rounded-xl py-2 px-3 focus:border-amber-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondaryTxt uppercase">Notes / Vendor info</label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Supplier name, bill reference..."
                className="w-full bg-white border border-borderCol rounded-xl py-2 px-3 focus:border-amber-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitLoading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-darknavy font-black rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all mt-2"
            >
              {isSubmitLoading ? 'Saving...' : 'RECORD EXPENSE'}
            </button>
          </form>
        </div>

        {/* Expenses List Column */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center border-b border-borderCol pb-3">
            <h3 className="text-base font-extrabold text-primaryTxt">
              Monthly Expense Entries ({selectedMonth})
            </h3>
            <span className="text-xs font-bold text-secondaryTxt">
              {expenses.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderCol bg-slate-50 text-secondaryTxt font-bold">
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderCol/60">
                {expenses.length > 0 ? (
                  expenses.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-bold text-primaryTxt">{item.itemName}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-secondaryTxt font-medium">{item.date}</td>
                      <td className="py-2.5 px-3 text-mutedTxt italic">{item.notes || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(item._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-mutedTxt">
                      {loading ? 'Loading...' : 'No expenses recorded for this month.'}
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

export default Expenses;
