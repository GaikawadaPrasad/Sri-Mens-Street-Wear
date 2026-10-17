import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaHome, FaCalculator } from 'react-icons/fa';

const NotFound = () => {
  useEffect(() => {
    document.title = '404 - Page Not Found | Sri Mens Street Wear';
  }, []);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="bg-cardBg border border-borderCol rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-xl space-y-6 animate-fadeIn">
        
        {/* Crown Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
          <FaCrown className="text-4xl" />
        </div>

        {/* 404 Text */}
        <div className="space-y-2">
          <span className="text-xs font-black tracking-widest uppercase text-amber-600 block">
            Error 404
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-primaryTxt font-['Montserrat',sans-serif]">
            Page Not Found
          </h1>
          <p className="text-xs md:text-sm text-secondaryTxt max-w-sm mx-auto leading-relaxed">
            The page you are looking for does not exist or has been moved. Check the URL or return to the main dashboard.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-darknavy font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            <FaHome className="text-sm" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/billing"
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider border border-borderCol transition-all active:scale-[0.98]"
          >
            <FaCalculator className="text-sm text-amber-600" />
            <span>Go to Billing</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-borderCol text-[11px] text-mutedTxt font-medium">
          Sri Mens Street Wear • Style Begins Here
        </div>
      </div>
    </div>
  );
};

export default NotFound;
