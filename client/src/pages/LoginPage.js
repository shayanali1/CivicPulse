import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function LoginPage() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'official') {
        navigate('/dashboard');
      } else {
        navigate('/map');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-[#0b1326] flex items-center justify-center px-4 transition-colors duration-300">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
        `}</style>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 p-2 rounded-lg border border-gray-200 dark:border-[#424754] bg-white dark:bg-[#171f33] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors"
        >
          <span className="material-symbols-outlined text-gray-600 dark:text-[#c2c6d6] text-[20px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-white text-[24px]">location_city</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#dae2fd]" style={{ fontFamily: 'Hanken Grotesk' }}>
              Welcome back
            </h1>
            <p className="text-gray-500 dark:text-[#c2c6d6] mt-1">Sign in to your CivicPulse account</p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-8 shadow-sm">

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c2c6d6] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-gray-50 dark:bg-[#0b1326] border border-gray-200 dark:border-[#424754] rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-[#dae2fd] placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#c2c6d6]">
                    Password
                  </label>
                  <a href="#" className="text-xs text-blue-500 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="w-full bg-gray-50 dark:bg-[#0b1326] border border-gray-200 dark:border-[#424754] rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-[#dae2fd] placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-base hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-[#424754]"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-[#424754]"></div>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-500 dark:text-[#c2c6d6]">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-gray-400 hover:text-blue-500 flex items-center justify-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}