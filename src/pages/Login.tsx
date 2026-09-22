import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, User, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [adminIdInput, setAdminIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = login(adminIdInput, passwordInput);
      setIsLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(result.error || 'Invalid ID or password');
      }
    }, 400);
  };

  const handleDemoFill = () => {
    setAdminIdInput('admin123');
    setPasswordInput('123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden p-8">
          
          {/* Header Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 mb-4 shadow-lg shadow-emerald-500/25">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              FITFLOW
            </h1>
            <p className="text-xs font-semibold tracking-wider text-emerald-600 uppercase mt-1">
              Gym Management System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Admin ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={adminIdInput}
                  onChange={(e) => setAdminIdInput(e.target.value)}
                  placeholder="Enter Admin ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 font-medium transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Demo Credentials (admin123 / 123)</span>
            </button>
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          FITFLOW Single Owner Admin Desk &bull; College Project Demo
        </p>
      </div>
    </div>
  );
};
