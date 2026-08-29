import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  HeartPulse,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('doctor@demo.com');
  const [password, setPassword] = useState('Demo@123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('phc_doctor');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    const success = login(email, selectedRole);
    if (success) {
      onLoginSuccess(selectedRole);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleQuickDemoLogin = (demoRole: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
    setSelectedRole(demoRole);
    login(demoEmail, demoRole);
    onLoginSuccess(demoRole);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8">
        {/* App Header & Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-700/25 mb-4">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Smart Referral System
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Mobile-First Tele-Triage & Automated Clinical Facility Matching Platform
          </p>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              One-Tap Demo Accounts
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Doctor */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('phc_doctor', 'doctor@demo.com')}
              className="flex items-center justify-between p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-left transition active:scale-[0.99] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Dr. Anjali Rao
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">
                      PHC
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">doctor@demo.com • PHC Kukatpally</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Hospital Desk */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('hospital_staff', 'hospital@demo.com')}
              className="flex items-center justify-between p-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-left transition active:scale-[0.99] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    District Hospital Desk
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 text-blue-800">
                      Hospital
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">hospital@demo.com • Triage & CCU</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin', 'admin@demo.com')}
              className="flex items-center justify-between p-3 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-left transition active:scale-[0.99] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    System Administrator
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-800">
                      Admin
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">admin@demo.com • Command Center</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold">Or Sign In Manually</span>
          </div>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('phc_doctor');
                  setEmail('doctor@demo.com');
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  selectedRole === 'phc_doctor'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PHC Doctor
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('hospital_staff');
                  setEmail('hospital@demo.com');
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  selectedRole === 'hospital_staff'
                    ? 'bg-white text-blue-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hospital
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setEmail('admin@demo.com');
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  selectedRole === 'admin'
                    ? 'bg-white text-purple-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@demo.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md shadow-teal-700/20 transition active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Notes */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          <span>PWA Ready • Offline Caching • 40/20/20/20 Matching</span>
        </div>
      </div>
    </div>
  );
};
