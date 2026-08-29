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
  onNavigate: (view: string, params?: Record<string, any>) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  onNavigate,
  children,
}) => {
  const { currentUser, logout, switchDemoUser, resetToDemoData } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const handleRoleSwitch = (role: UserRole) => {
    switchDemoUser(role);
    setShowRoleDropdown(false);
    if (role === 'phc_doctor') {
      onNavigate('phc_dashboard');
    } else if (role === 'hospital_staff') {
      onNavigate('hospital_dashboard');
    } else if (role === 'patient') {
      onNavigate('patient_dashboard');
    } else {
      onNavigate('admin_dashboard');
    }
  };

  const isPatientRole = currentUser?.role === 'patient';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start text-slate-900 pb-20 md:pb-6">
      {/* Mobile container wrapper to ensure mobile-first 390px perfection and wide desktop responsive presentation */}
      <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl bg-white min-h-screen shadow-xl flex flex-col md:border-x md:border-slate-200">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* App Logo & Title */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => {
                if (currentUser?.role === 'phc_doctor') onNavigate('phc_dashboard');
                else if (currentUser?.role === 'hospital_staff') onNavigate('hospital_dashboard');
                else if (currentUser?.role === 'patient') onNavigate('patient_dashboard');
                else onNavigate('admin_dashboard');
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-700/20 shrink-0">
                <HeartPulse className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">
                    Smart Referral
                  </h1>
                  <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${
                    isPatientRole
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-teal-100 text-teal-800 border-teal-200'
                  }`}>
                    {isPatientRole ? 'Patient Pass' : 'PWA'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none mt-1 truncate max-w-[140px] sm:max-w-xs">
                  {isPatientRole
                    ? 'Patient View (My Referrals)'
                    : currentUser?.role === 'phc_doctor'
                    ? 'Doctor View (PHC Hub)'
                    : currentUser?.facility_name || 'Tele-Triage Grid'}
                </p>
              </div>
            </div>

            {/* User Profile & Demo Switcher */}
            <div className="flex items-center gap-1.5 relative">
              <button
                id="role-switch-trigger"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full border text-xs font-semibold transition active:scale-95 ${
                  isPatientRole
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
                title="Switch Demo Role"
              >
                <RoleIcon className={`w-3.5 h-3.5 shrink-0 ${isPatientRole ? 'text-amber-600' : 'text-teal-600'}`} />
                <span className="hidden sm:inline truncate max-w-[110px]">
                  {currentUser?.name || 'User'}
                </span>
                <span className="sm:hidden font-bold">
                  {roleConfig?.tag}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Quick Reset State Button */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                title="Reset Demo Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Role Switcher Dropdown */}
              {showRoleDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleDropdown(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Active Profile
                      </p>
                      <p className="text-sm font-bold text-slate-800">{currentUser?.name}</p>
                      <p className="text-xs text-teal-600 font-medium">{currentUser?.facility_name || 'Tele-Triage System'}</p>
                    </div>

                    <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Demo Role
                    </p>

                    {/* Patient Portal Option */}
                    <button
                      id="switch-role-patient"
                      onClick={() => handleRoleSwitch('patient')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
                        currentUser?.role === 'patient'
                          ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>Ravi Kumar</span>
                          <span className="text-[9px] px-1 rounded bg-amber-200 text-amber-900 font-extrabold">
                            PATIENT
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Patient Portal (Digital Pass & QR)
                        </div>
                      </div>
                    </button>

                    {/* Doctor Option */}
                    <button
                      id="switch-role-doctor"
                      onClick={() => handleRoleSwitch('phc_doctor')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition mt-1 ${
                        currentUser?.role === 'phc_doctor'
                          ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>Dr. Anjali Rao</span>
                          <span className="text-[9px] px-1 rounded bg-emerald-200 text-emerald-900 font-extrabold">
                            DOCTOR
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">PHC Kukatpally (Doctor View)</div>
                      </div>
                    </button>

                    {/* Hospital Staff Option */}
                    <button
                      id="switch-role-hospital"
                      onClick={() => handleRoleSwitch('hospital_staff')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition mt-1 ${
                        currentUser?.role === 'hospital_staff'
                          ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>District Hospital Desk</span>
                          <span className="text-[9px] px-1 rounded bg-blue-200 text-blue-900 font-extrabold">
                            HOSPITAL
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">Hospital Staff (Triage & Beds)</div>
                      </div>
                    </button>

                    {/* Admin Option */}
                    <button
                      id="switch-role-admin"
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition mt-1 ${
                        currentUser?.role === 'admin'
                          ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>System Administrator</span>
                          <span className="text-[9px] px-1 rounded bg-purple-200 text-purple-900 font-extrabold">
                            ADMIN
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">Command Center Analytics</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Demo Fast-Action Banner */}
        <div className="bg-slate-900 text-slate-100 px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-300 font-medium">Active:</span>
            <span className="font-bold text-white truncate">{currentUser?.name}</span>
            <span className="text-slate-400 hidden sm:inline">
              ({currentUser?.role === 'patient' ? 'Patient Portal' : currentUser?.role})
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPatientRole ? (
              <button
                onClick={() => handleRoleSwitch('phc_doctor')}
                className="px-2.5 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-[11px] shadow transition active:scale-95 flex items-center gap-1"
              >
                <Stethoscope className="w-3 h-3" />
                <span>Switch to Doctor View</span>
              </button>
            ) : (
              <button
                onClick={() => handleRoleSwitch('patient')}
                className="px-2.5 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] shadow transition active:scale-95 flex items-center gap-1"
              >
                <User className="w-3 h-3" />
                <span>Patient Portal (Ravi Kumar)</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 bg-slate-50">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Fixed on Mobile, 44px touch targets, safe-area inset) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg pb-safe">
          <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-around px-2 py-1.5">
            {isPatientRole ? (
              <>
                {/* Patient Navigation Items */}
                <button
                  id="tab-patient-pass"
                  onClick={() => onNavigate('patient_dashboard')}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'patient_dashboard'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <QrCode className={`w-5 h-5 ${currentView === 'patient_dashboard' ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">My Pass</span>
                </button>

                <button
                  id="tab-patient-status"
                  onClick={() => onNavigate('patient_dashboard')}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'patient_dashboard'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Status</span>
                </button>

                <button
                  id="tab-patient-facilities"
                  onClick={() => onNavigate('facilities')}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'facilities'
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Building2 className={`w-5 h-5 ${currentView === 'facilities' ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] mt-0.5">Hospitals</span>
                </button>

                <button
                  id="tab-switch-doctor"
                  onClick={() => handleRoleSwitch('phc_doctor')}
                  className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl text-slate-500 hover:text-slate-800 transition"
                >
                  <Stethoscope className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Doctor Hub</span>
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
                  id="tab-patient-portal-quick"
                  onClick={() => handleRoleSwitch('patient')}
                  className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition ${
                    currentView === 'patient_dashboard'
                      ? 'text-amber-700 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Open Patient Portal"
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Patient Pass</span>
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
