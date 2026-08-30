import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { TypewriterHeader } from '../components/TypewriterHeader';
import {
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  User,
  QrCode,
  UserPlus,
  Phone,
  Calendar,
  MapPin,
  Heart,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { login, signupPatient, patients } = useApp();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign in state
  const [usernameOrEmail, setUsernameOrEmail] = useState('patient@demo.com');
  const [password, setPassword] = useState('Demo@123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [loginError, setLoginError] = useState('');

  // Patient Self-Registration / Signup state
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    email: '',
    date_of_birth: '1995-06-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    blood_group: 'O+',
    address: '',
    emergency_contact: '',
    emergency_relation: 'Spouse',
    allergies: 'None known',
    medical_history: '',
    password: '',
  });
  const [signupError, setSignupError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Login Handler (accepts ANY random username & password)
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!usernameOrEmail.trim()) {
      setLoginError('Please enter a username or email address');
      return;
    }

    // Bypass strict credential validation for prototype
    const success = login(usernameOrEmail, selectedRole);
    if (success) {
      onLoginSuccess(selectedRole);
    } else {
      setLoginError('Could not authenticate. Please try again.');
    }
  };

  // Quick One-Tap Demo Login
  const handleQuickDemoLogin = (demoRole: UserRole, demoEmail: string) => {
    setUsernameOrEmail(demoEmail);
    setPassword('Demo@123');
    setSelectedRole(demoRole);
    login(demoEmail, demoRole);
    onLoginSuccess(demoRole);
  };

  // Patient Self-Registration Handler
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupForm.name.trim()) {
      setSignupError('Please enter your full legal name');
      return;
    }
    if (!signupForm.phone.trim()) {
      setSignupError('Please enter your mobile phone number');
      return;
    }
    if (!signupForm.address.trim()) {
      setSignupError('Please enter your residential address');
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = signupPatient(
        {
          name: signupForm.name.trim(),
          phone: signupForm.phone.trim(),
          date_of_birth: signupForm.date_of_birth,
          gender: signupForm.gender,
          blood_group: signupForm.blood_group,
          address: signupForm.address.trim(),
          emergency_contact: signupForm.emergency_contact.trim()
            ? `${signupForm.emergency_contact} (${signupForm.emergency_relation})`
            : undefined,
          emergency_relation: signupForm.emergency_relation,
          allergies: signupForm.allergies || 'None known',
          medical_history: signupForm.medical_history || 'No prior chronic conditions recorded',
          chronic_conditions: signupForm.medical_history,
          medications: 'None',
        },
        signupForm.email.trim() || undefined
      );

      setIsSubmitting(false);
      onLoginSuccess('patient');
    } catch (err) {
      setIsSubmitting(false);
      setSignupError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-teal-50/40 flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-full overflow-x-hidden box-border">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 p-5 sm:p-8 relative overflow-hidden">
        
        {/* Top App Identity */}
        <div className="flex flex-col items-center text-center mb-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md shadow-teal-700/10 mb-2 border border-teal-100 bg-white p-1 flex items-center justify-center">
            <img
              src="/icon-192.png"
              alt="Smart Referral App Icon"
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart Referral System
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
            Mobile-First Tele-Triage, Patient QR Passes & Hospital Inventory Network
          </p>
        </div>

        {/* Dynamic Typing Animation UI (Blended directly into background) */}
        <TypewriterHeader />

        {/* Tab Toggle: Sign In vs Patient Self-Registration */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-5">
          <button
            type="button"
            id="tab-btn-signin"
            onClick={() => setActiveTab('signin')}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'signin'
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In (Mock Auth)
          </button>
          <button
            type="button"
            id="tab-btn-signup"
            onClick={() => setActiveTab('signup')}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-600" />
            <span>Patient Sign Up</span>
          </button>
        </div>

        {/* TAB 1: SIGN IN FORM WITH VISUAL ROLE CARDS */}
        {activeTab === 'signin' && (
          <div className="space-y-4">
            {/* Visual Role Cards Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  1. Select Your Role
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Click a box to select</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Patient Role Card */}
                <div
                  id="card-role-patient"
                  onClick={() => {
                    setSelectedRole('patient');
                    if (
                      usernameOrEmail === 'doctor@demo.com' ||
                      usernameOrEmail === 'hospital@demo.com' ||
                      usernameOrEmail === 'admin@demo.com'
                    ) {
                      setUsernameOrEmail('patient@demo.com');
                    }
                  }}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between select-none ${
                    selectedRole === 'patient'
                      ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-400/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        selectedRole === 'patient'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    {selectedRole === 'patient' && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <div className="text-sm font-extrabold text-slate-900">Patient</div>
                    <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                      Digital QR pass & referral history
                    </div>
                  </div>
                </div>

                {/* Doctor Role Card */}
                <div
                  id="card-role-doctor"
                  onClick={() => {
                    setSelectedRole('phc_doctor');
                    if (
                      usernameOrEmail === 'patient@demo.com' ||
                      usernameOrEmail === 'hospital@demo.com' ||
                      usernameOrEmail === 'admin@demo.com'
                    ) {
                      setUsernameOrEmail('doctor@demo.com');
                    }
                  }}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between select-none ${
                    selectedRole === 'phc_doctor'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-400/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        selectedRole === 'phc_doctor'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    {selectedRole === 'phc_doctor' && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <div className="text-sm font-extrabold text-slate-900">PHC Doctor</div>
                    <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                      Triage, vitals & smart matching
                    </div>
                  </div>
                </div>

                {/* Hospital Staff Role Card */}
                <div
                  id="card-role-hospital"
                  onClick={() => {
                    setSelectedRole('hospital_staff');
                    if (
                      usernameOrEmail === 'patient@demo.com' ||
                      usernameOrEmail === 'doctor@demo.com' ||
                      usernameOrEmail === 'admin@demo.com'
                    ) {
                      setUsernameOrEmail('hospital@demo.com');
                    }
                  }}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between select-none ${
                    selectedRole === 'hospital_staff'
                      ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-400/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        selectedRole === 'hospital_staff'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <Building className="w-5 h-5" />
                    </div>
                    {selectedRole === 'hospital_staff' && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <div className="text-sm font-extrabold text-slate-900">Hospital Staff</div>
                    <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                      Pass scanner & ward admission
                    </div>
                  </div>
                </div>

                {/* Admin Role Card */}
                <div
                  id="card-role-admin"
                  onClick={() => {
                    setSelectedRole('admin');
                    if (
                      usernameOrEmail === 'patient@demo.com' ||
                      usernameOrEmail === 'doctor@demo.com' ||
                      usernameOrEmail === 'hospital@demo.com'
                    ) {
                      setUsernameOrEmail('admin@demo.com');
                    }
                  }}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between select-none ${
                    selectedRole === 'admin'
                      ? 'border-purple-500 bg-purple-50/70 shadow-sm ring-2 ring-purple-400/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        selectedRole === 'admin'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    {selectedRole === 'admin' && (
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <div className="text-sm font-extrabold text-slate-900">State Command</div>
                    <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                      Grid capacity & analytics
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Credentials Input Form */}
            <form onSubmit={handleSignIn} className="space-y-3 pt-2 border-t border-slate-100">
              <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                2. Enter Credentials
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    id="input-login-username"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="e.g. dr_rao, patient@demo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium"
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
                    id="input-login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Any password combination accepted"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Prototype Mode: Any password and username combination will log in.
                </p>
              </div>

              <button
                type="submit"
                id="btn-submit-login"
                className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md shadow-teal-700/20 transition active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
              >
                <span>
                  Sign In as{' '}
                  {selectedRole === 'phc_doctor'
                    ? 'PHC Doctor'
                    : selectedRole === 'hospital_staff'
                    ? 'Hospital Staff'
                    : selectedRole === 'patient'
                    ? 'Patient'
                    : 'Administrator'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: PATIENT SELF-REGISTRATION (SIGN UP) */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
              <strong>Patient Self-Registration:</strong> Register your digital profile to receive a unique Patient ID, digital QR Pass, and automated emergency triage routing.
            </div>

            {signupError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {signupError}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  id="signup-name"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra Verma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    id="signup-phone"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                    placeholder="98490 12345"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
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
                    id="signup-email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="name@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* DOB, Gender & Blood Group */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="signup-dob"
                  value={signupForm.date_of_birth}
                  onChange={(e) => setSignupForm({ ...signupForm, date_of_birth: e.target.value })}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  id="signup-gender"
                  value={signupForm.gender}
                  onChange={(e) => setSignupForm({ ...signupForm, gender: e.target.value as any })}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  id="signup-blood"
                  value={signupForm.blood_group}
                  onChange={(e) => setSignupForm({ ...signupForm, blood_group: e.target.value })}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-bold text-rose-700"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Residential Address *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  id="signup-address"
                  value={signupForm.address}
                  onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                  placeholder="Street, Locality, City, PIN"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  id="signup-emergency"
                  value={signupForm.emergency_contact}
                  onChange={(e) => setSignupForm({ ...signupForm, emergency_contact: e.target.value })}
                  placeholder="98490 99999"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relationship
                </label>
                <select
                  value={signupForm.emergency_relation}
                  onChange={(e) => setSignupForm({ ...signupForm, emergency_relation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>
            </div>

            {/* Known Allergies & Medical History */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Known Allergies (Drug / Food / Environmental)
              </label>
              <input
                type="text"
                id="signup-allergies"
                value={signupForm.allergies}
                onChange={(e) => setSignupForm({ ...signupForm, allergies: e.target.value })}
                placeholder="e.g. Penicillin, Sulfa drugs, Peanuts (or None known)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Past Medical History / Chronic Conditions
              </label>
              <input
                type="text"
                id="signup-history"
                value={signupForm.medical_history}
                onChange={(e) => setSignupForm({ ...signupForm, medical_history: e.target.value })}
                placeholder="e.g. Hypertension (5 yrs), Type 2 Diabetes, Asthma"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Account Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="password"
                  id="signup-password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  placeholder="Create password (any value accepted)"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-register-submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition active:scale-[0.98] mt-3 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Complete Self-Registration & Open Pass'}</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Offline Service Worker Active • Instant Triage Pass</span>
        </div>
      </div>
    </div>
  );
};
