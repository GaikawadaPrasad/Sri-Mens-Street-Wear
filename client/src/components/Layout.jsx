import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaChartBar,
  FaCalculator,
  FaTshirt,
  FaFileInvoiceDollar,
  FaUsers,
  FaWallet,
  FaCrown,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaPhoneAlt,
  FaCalendarAlt
} from 'react-icons/fa';
import { useApp } from '../context/AppContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: FaChartBar, label: 'Store Dashboard' },
    { name: 'Billing', path: '/billing', icon: FaCalculator, label: 'Manual Billing Desk' },
    { name: 'Clothing Catalog', path: '/products', icon: FaTshirt, label: 'Apparel & Prices' },
    { name: 'Reports', path: '/reports', icon: FaFileInvoiceDollar, label: 'Sales Reports' },
    { name: 'Expenses', path: '/expenses', icon: FaWallet, label: 'Store Expenses' }
  ];

  if (user?.role === 'admin') {
    navigationItems.push({ name: 'Users', path: '/users', icon: FaUsers, label: 'Staff & Approvals' });
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Support Escape key to dismiss mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-lightgraySec text-primaryTxt flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-darknavy backdrop-blur-md border-b border-slate-800 shadow-md px-3 sm:px-4 md:px-6 py-2.5 md:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Name (Clickable link to Dashboard) */}
          <Link
            to="/"
            aria-label="Sri Mens Street Wear - Home"
            className="flex items-center space-x-2.5 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl p-1 -ml-1 transition-transform active:scale-95"
          >
            <img
              src="/logo.png"
              alt="Sri Mens Street Wear Logo"
              className="h-9 sm:h-10 md:h-11 w-auto max-w-[130px] sm:max-w-[160px] object-contain rounded-xl shadow-md border border-amber-500/30 bg-black/40 p-0.5 transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg md:text-xl font-black tracking-wider text-white flex items-center gap-1 font-['Montserrat',sans-serif] leading-tight">
                <span>SRI MEN'S</span>
                <span className="text-amber-400">STREET WEAR</span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide leading-tight">
                Retail & Billing • <span className="text-amber-400/90 font-bold">Style Begins Here</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    active
                      ? 'bg-amber-500 text-darknavy shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="text-xs" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls (Desktop & Mobile) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop User Info */}
            <div className="hidden lg:flex flex-col text-right font-medium text-slate-350 pr-2 border-r border-slate-800">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wide">
                {user?.username} ({user?.role})
              </span>
              <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                <FaCalendarAlt className="text-[9px]" />
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Logout Button (Desktop) */}
            <button
              onClick={logout}
              aria-label="Log out of application"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold text-slate-300 transition-all duration-150 border border-slate-700/60 shadow-sm"
              type="button"
            >
              <FaSignOutAlt className="text-xs" />
              <span>Logout</span>
            </button>

            {/* Hamburger Button for Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="md:hidden p-2 rounded-xl bg-slate-800 text-amber-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {mobileMenuOpen ? <FaTimes className="text-base" /> : <FaBars className="text-base" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="fixed inset-0 z-50 md:hidden bg-darknavy/80 backdrop-blur-sm flex justify-end animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          {/* Backdrop click to close */}
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>

          {/* Drawer Content */}
          <div className="w-72 max-w-[85vw] bg-darknavy border-l border-slate-800 h-full p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <img
                    src="/logo.png"
                    alt="Sri Mens Street Wear"
                    className="h-9 w-auto max-w-[110px] object-contain rounded-lg border border-amber-500/30 bg-black/40 p-0.5"
                  />
                  <div>
                    <h2 className="text-xs font-black tracking-wider text-white font-['Montserrat',sans-serif]">
                      SRI MEN'S WEAR
                    </h2>
                    <span className="text-[9px] text-amber-400 font-bold uppercase">Navigation Menu</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <FaTimes className="text-base" />
                </button>
              </div>

              {/* User Card in Drawer */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Logged in as:</span>
                  <span className="text-xs font-black text-amber-400 uppercase">{user?.username}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {user?.role}
                </span>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="space-y-1.5">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                        active
                          ? 'bg-amber-500 text-darknavy shadow-md shadow-amber-500/20'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon className="text-sm flex-shrink-0" />
                      <div className="flex flex-col text-left">
                        <span>{item.name}</span>
                        <span className={`text-[10px] font-medium ${active ? 'text-darknavy/80' : 'text-slate-400'}`}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                type="button"
              >
                <FaSignOutAlt className="text-xs" />
                <span>Log Out</span>
              </button>
              <p className="text-[10px] text-center text-slate-500 font-semibold">
                Wear It. Own It. Live It.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
        {children}
      </main>

      {/* Responsive Store Footer */}
      <footer className="bg-darknavy border-t border-slate-800 text-slate-400 py-6 px-4 md:px-6 text-xs mt-auto pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1">
            <div className="flex items-center space-x-2">
              <FaCrown className="text-amber-400 text-sm" />
              <span className="font-extrabold text-white text-sm font-['Montserrat',sans-serif]">
                SRI MEN'S STREET WEAR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Built for Comfort. Designed for Style • Trendy Looks. Everyday Attitude.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <Link to="/billing" className="hover:text-amber-400 font-medium">Quick Billing</Link>
            <Link to="/products" className="hover:text-amber-400 font-medium">Clothing Catalog</Link>
            <Link to="/reports" className="hover:text-amber-400 font-medium">Sales Reports</Link>
            <Link to="/expenses" className="hover:text-amber-400 font-medium">Expenses</Link>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400">
            <p>© {currentYear} Sri Mens Street Wear. All rights reserved.</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              WEAR IT. OWN IT. LIVE IT.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Bar for High-Speed Tap Access */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-darknavy/95 backdrop-blur-md border-t border-slate-800 shadow-2xl px-2 py-1.5 flex items-center justify-around"
      >
        {navigationItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-150 ${
                active
                  ? 'text-amber-400 font-extrabold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`text-base mb-0.5 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-[9px] tracking-tight text-center leading-none">
                {item.name === 'Clothing Catalog' ? 'Catalog' : item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
