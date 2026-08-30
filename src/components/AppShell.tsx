import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Building2,
  Users,
  LayoutDashboard,
  BarChart3,
  LogOut,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  Stethoscope,
  Building,
  HeartPulse,
  User,
  QrCode,
  FileText,
  MapPin,
} from 'lucide-react';
import { UserRole } from '../types';

interface AppShellProps {
  currentView: string;
  currentParams?: Record<string, any>;
  onNavigate: (view: string, params?: Record<string, any>) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  currentParams,
  onNavigate,
  children,
}) => {
  const { currentUser, logout, resetToDemoData } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const activePatientTab = currentParams?.tab || 'pass';

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'phc_doctor':
        return {
          title: 'PHC Medical Officer',
          tag: 'Doctor',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Stethoscope,
        };
      case 'hospital_staff':
        return {
          title: 'Hospital Triage Desk',
          tag: 'Hospital Staff',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Building,
        };
      case 'admin':
        return {
          title: 'State Health Command',
          tag: 'Administrator',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: ShieldCheck,
        };
      case 'patient':
        return {
          title: 'Patient Portal',
          tag: 'Patient',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: User,
        };
    }
  };

  const roleConfig = currentUser ? getRoleBadge(currentUser.role) : null;
  const RoleIcon = roleConfig?.icon || Stethoscope;
  const isPatientRole = currentUser?.role === 'patient';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start text-slate-900 pb-20 md:pb-6 w-full max-w-full overflow-x-hidden box-border">
      {/* Mobile container wrapper to ensure mobile-first 390px perfection and wide desktop responsive presentation */}
      <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl bg-white min-h-screen shadow-xl flex flex-col md:border-x md:border-slate-200 overflow-x-hidden box-border">
        
        {/* Top Header Bar (Flexbox layout with strict no-overflow boundaries) */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-3 sm:px-4 py-2.5 w-full box-border">
          <div className="flex items-center justify-between gap-2 w-full min-w-0">
            {/* App Logo & Title */}
            <div
              className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none"
              onClick={() => {
                if (currentUser?.role === 'phc_doctor') onNavigate('phc_dashboard');
                else if (currentUser?.role === 'hospital_staff') onNavigate('hospital_dashboard');
                else if (currentUser?.role === 'patient') onNavigate('patient_dashboard');
                else onNavigate('admin_dashboard');
              }}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-xs border border-teal-100 bg-white p-0.5 shrink-0 flex items-center justify-center">
                <img
                  src="/icon-192.png"
                  alt="Smart Referral Icon"
                  className="w-full h-full object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to gradient icon if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h1 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 leading-none truncate">
                    Smart Referral
                  </h1>
                  <span className={`text-[9px] sm:text-[10px] uppercase font-black px-1.5 py-0.5 rounded border shrink-0 ${
                    isPatientRole
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-teal-100 text-teal-800 border-teal-200'
                  }`}>
                    {isPatientRole ? 'Patient' : 'PWA'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-none mt-0.5 truncate max-w-[120px] sm:max-w-[200px]">
                  {isPatientRole
                    ? 'Patient Digital Pass'
                    : currentUser?.role === 'phc_doctor'
                    ? 'Doctor PHC Hub'
                    : currentUser?.facility_name || 'Tele-Triage Grid'}
                </p>
              </div>
            </div>

            {/* User Profile Badge & Logout (Responsive, shrink-0, zero overflow) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border text-xs font-semibold ${
                  isPatientRole
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <RoleIcon className={`w-3.5 h-3.5 shrink-0 ${isPatientRole ? 'text-amber-600' : 'text-teal-600'}`} />
                <span className="hidden sm:inline truncate max-w-[110px]">
                  {currentUser?.name || 'User'}
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider bg-white/90 border border-slate-200/80">
                  {roleConfig?.tag}
                </span>
              </div>

              {/* Quick Reset State Button */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition shrink-0"
                title="Reset Demo Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Logout Button (Fully visible on all mobile screen widths) */}
              <button
                id="btn-logout"
                onClick={logout}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full transition active:scale-95 shadow-xs shrink-0 whitespace-nowrap"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="inline text-[11px] sm:text-xs">Log Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 bg-slate-50">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Fixed on Mobile, 44px touch targets, safe-area inset) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg pb-safe">
          <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-around px-2 py-1.5">
            {isPatientRole ? (
              <>
                {/* Patient Navigation Items: Synced directly with patient views/tabs */}
                <button
                  id="tab-patient-pass"
                  onClick={() => onNavigate('patient_dashboard', { tab: 'pass' })}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'patient_dashboard' && activePatientTab === 'pass'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Digital Pass & QR"
                >
                  <QrCode className={`w-5 h-5 ${currentView === 'patient_dashboard' && activePatientTab === 'pass' ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">Pass</span>
                </button>

                <button
                  id="tab-patient-hospital"
                  onClick={() => onNavigate('patient_dashboard', { tab: 'guidance' })}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'patient_dashboard' && activePatientTab === 'guidance'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Designated Hospital"
                >
                  <Building2 className={`w-5 h-5 ${currentView === 'patient_dashboard' && activePatientTab === 'guidance' ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">Hospital</span>
                </button>

                <button
                  id="tab-patient-summary"
                  onClick={() => onNavigate('patient_dashboard', { tab: 'summary' })}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'patient_dashboard' && activePatientTab === 'summary'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Medical Summary"
                >
                  <FileText className={`w-5 h-5 ${currentView === 'patient_dashboard' && activePatientTab === 'summary' ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">Summary</span>
                </button>

                <button
                  id="tab-patient-journey"
                  onClick={() => onNavigate('patient_dashboard', { tab: 'history' })}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'patient_dashboard' && activePatientTab === 'history'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Referral Journey & Status"
                >
                  <Activity className={`w-5 h-5 ${currentView === 'patient_dashboard' && activePatientTab === 'history' ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">Journey</span>
                </button>

                <button
                  id="tab-patient-profile"
                  onClick={() => onNavigate('patient_dashboard', { tab: 'profile' })}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'patient_dashboard' && activePatientTab === 'profile'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Patient Profile"
                >
                  <User className={`w-5 h-5 ${currentView === 'patient_dashboard' && activePatientTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">Profile</span>
                </button>
              </>
            ) : (
              <>
                {/* Doctor / Staff / Admin Navigation Items */}
                <button
                  id="tab-dashboard"
                  onClick={() => {
                    if (currentUser?.role === 'phc_doctor') onNavigate('phc_dashboard');
                    else if (currentUser?.role === 'hospital_staff') onNavigate('hospital_dashboard');
                    else onNavigate('admin_dashboard');
                  }}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView.includes('dashboard')
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutDashboard className={`w-5 h-5 ${currentView.includes('dashboard') ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">Dashboard</span>
                </button>

                <button
                  id="tab-patients"
                  onClick={() => onNavigate('patients')}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'patients' || currentView === 'patient_profile' || currentView === 'new_patient'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className={`w-5 h-5 ${currentView.includes('patient') ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">Patients</span>
                </button>

                <button
                  id="tab-referrals"
                  onClick={() => onNavigate('referrals')}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'referrals' || currentView === 'create_referral' || currentView === 'referral_detail' || currentView === 'timeline'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Activity className={`w-5 h-5 ${currentView.includes('referral') || currentView === 'timeline' ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">Referrals</span>
                </button>

                <button
                  id="tab-facilities"
                  onClick={() => onNavigate('facilities')}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'facilities'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Facilities Directory"
                >
                  <Building2 className={`w-5 h-5 ${currentView === 'facilities' ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">Directory</span>
                </button>

                <button
                  id="tab-admin"
                  onClick={() => {
                    if (currentUser?.role === 'admin') onNavigate('admin_dashboard');
                    else onNavigate('admin_facilities');
                  }}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'admin_dashboard' || currentView === 'admin_facilities'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BarChart3 className={`w-5 h-5 ${currentView.startsWith('admin') ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">
                    {currentUser?.role === 'admin' ? 'Analytics' : 'Simulator'}
                  </span>
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Reset Demo Data?</h3>
              <p className="text-sm text-slate-600 mt-2">
                This will restore all default facilities, patient records (including Ravi Kumar), sample referrals, and status timelines to clean demo state.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetToDemoData();
                    setShowResetConfirm(false);
                    onNavigate('phc_dashboard');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md transition"
                >
                  Reset Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
