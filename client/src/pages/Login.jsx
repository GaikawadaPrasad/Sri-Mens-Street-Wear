import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaUserPlus, FaSignInAlt, FaCrown } from 'react-icons/fa';

const Login = () => {
  const { login, register } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Staff Sign In | Sri Mens Street Wear';
  }, []);

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    if (isLoginTab) {
      const success = await login(username, password);
      setLoading(false);
      if (success) {
        navigate('/');
      }
    } else {
      const success = await register(username, password);
      setLoading(false);
      if (success) {
        setIsLoginTab(true);
        setUsername('');
        setPassword('');
      }
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0B1220] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-fadeIn space-y-6">
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <img
            src="/logo.png"
            alt="Sri Mens Street Wear Logo"
            className="h-20 sm:h-24 w-auto max-w-[280px] object-contain rounded-2xl shadow-2xl shadow-amber-500/20 border border-amber-500/40 p-1.5 bg-black/60 transition-transform hover:scale-105"
          />
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-wider leading-tight font-['Montserrat',sans-serif]">
              SRI MEN'S <span className="text-amber-400">STREET WEAR</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1.5">
              Style Begins Here • Billing & Retail Management
            </p>
          </div>
        </div>

        {/* Glass Card Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-[0_0_80px_-15px_rgba(245,158,11,0.15)] relative overflow-hidden">
          
          {/* Card Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-800 pb-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(true);
                setUsername('');
                setPassword('');
              }}
              className={`w-1/2 py-2 text-xs font-black tracking-widest transition-all duration-300 ${
                isLoginTab
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(false);
                setUsername('');
                setPassword('');
              }}
              className={`w-1/2 py-2 text-xs font-black tracking-widest transition-all duration-300 ${
                !isLoginTab
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              REGISTER
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <FaUser className="text-xs" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter staff username"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <FaLock className="text-xs" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Default Admin Note */}
            

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-darknavy font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-darknavy border-t-transparent rounded-full animate-spin"></div>
              ) : isLoginTab ? (
                <>
                  <FaSignInAlt className="text-xs" />
                  <span>SIGN IN TO BILLING</span>
                </>
              ) : (
                <>
                  <FaUserPlus className="text-xs" />
                  <span>REQUEST REGISTRATION</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Tagline */}
        <p className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-wider">
          Built for Comfort. Designed for Style.
        </p>
      </div>
    </div>
  );
};

export default Login;
