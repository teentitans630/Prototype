import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  HeartPulse,
  QrCode,
  Copy,
  Check,
  Printer,
  Download,
  MapPin,
  Clock,
  Phone,
  PhoneCall,
  AlertTriangle,
  FileText,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  Building,
  User,
  Activity,
  Droplet,
  Thermometer,
  Sparkles,
  Maximize2,
  X,
  FileCheck,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { Referral, ReferralStatus } from '../types';

interface PatientDashboardViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const PatientDashboardView: React.FC<PatientDashboardViewProps> = ({ onNavigate }) => {
  const {
    currentUser,
    patients,
    referrals,
    facilities,
    activePatientId,
    setActivePatientId,
    switchDemoUser,
    getReferralHistory,
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedReferralId, setSelectedReferralId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pass' | 'guidance' | 'summary' | 'history'>('pass');
  const [showPatientSelect, setShowPatientSelect] = useState(false);

  // Find active patient (either from currentUser or activePatientId or default to Ravi Kumar)
  const currentPatient =
    patients.find((p) => p.id === activePatientId) ||
    patients.find((p) => p.id === currentUser?.patient_id) ||
    patients.find((p) => p.name.includes('Ravi Kumar')) ||
    patients[0];

  // Get all referrals for this patient, sorted newest first
  const patientReferrals = referrals
    .filter((r) => r.patient_id === currentPatient?.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Active referral (the most recent or currently selected one)
  const activeReferral: Referral | undefined =
    patientReferrals.find((r) => r.id === selectedReferralId) ||
    patientReferrals[0];

  const destFacility = activeReferral
    ? facilities.find((f) => f.id === activeReferral.destination_facility_id)
    : undefined;

  const sourceFacility = activeReferral
    ? facilities.find((f) => f.id === activeReferral.source_facility_id)
    : undefined;

  const referralHistory = activeReferral ? getReferralHistory(activeReferral.id) : [];

  const handleCopyCode = () => {
    if (!activeReferral) return;
    navigator.clipboard?.writeText(activeReferral.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePrintPass = () => {
    window.print();
  };

  const handleSelectPatient = (patientId: string) => {
    setActivePatientId(patientId);
    setShowPatientSelect(false);
    setSelectedReferralId('');
  };

  // QR code payload (JSON payload scanned by reception staff)
  const qrPayload = activeReferral
    ? JSON.stringify({
        referral_code: activeReferral.referral_code,
        patient_code: currentPatient?.patient_code,
        patient_name: currentPatient?.name,
        diagnosis: activeReferral.diagnosis,
        priority: activeReferral.priority,
        hospital: destFacility?.name,
        status: activeReferral.status,
        timestamp: activeReferral.created_at,
      })
    : '';

  // Get status color & badge text
  const getStatusDisplay = (status: ReferralStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Hospital Acceptance',
          shortLabel: 'Pending Triage',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500 animate-ping',
          desc: 'Your referral has been transmitted from the PHC and is being triaged by the hospital desk.',
        };
      case 'accepted':
        return {
          label: 'Approved & Bed / Slot Pre-Allocated',
          shortLabel: 'Approved / Ready',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-500 animate-pulse',
          desc: 'The receiving hospital has accepted your referral. Please proceed directly to the triage gate.',
        };
      case 'patient_arrived':
        return {
          label: 'Checked-in at Hospital Reception',
          shortLabel: 'Checked In',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          dot: 'bg-blue-500',
          desc: 'Hospital staff have scanned your pass. You are queued for initial clinical assessment.',
        };
      case 'under_treatment':
        return {
          label: 'Clinical Treatment in Progress',
          shortLabel: 'In Treatment',
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          dot: 'bg-indigo-500 animate-pulse',
          desc: 'You are currently admitted/under active clinical management by the specialist medical team.',
        };
      case 'completed':
        return {
          label: 'Referral Case Completed',
          shortLabel: 'Completed',
          bg: 'bg-slate-100 text-slate-900 border-slate-300',
          dot: 'bg-slate-500',
          desc: 'Treatment finalized, discharge summary documented, and follow-up sent to your local PHC.',
        };
      case 'rejected':
        return {
          label: 'Rerouted / Secondary Referral',
          shortLabel: 'Rerouted',
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          dot: 'bg-rose-500',
          desc: 'Facility at full capacity; automated secondary hospital rerouting in progress.',
        };
      default:
        return {
          label: 'Active Referral',
          shortLabel: 'Active',
          bg: 'bg-teal-100 text-teal-900 border-teal-300',
          dot: 'bg-teal-500',
          desc: 'Referral is active.',
        };
    }
  };

  const statusInfo = activeReferral ? getStatusDisplay(activeReferral.status) : null;

  return (
    <div className="space-y-4 max-w-full">
      {/* Patient Profile Bar & Switcher */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-teal-700/20 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 leading-none">
                  {currentPatient?.name || 'Patient'}
                </h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {currentPatient?.patient_code}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Blood: {currentPatient?.blood_group || 'B+'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{currentPatient?.gender}</span>
                <span>•</span>
                <span>Phone: {currentPatient?.phone}</span>
                <span>•</span>
                <span className="truncate max-w-[200px]">{currentPatient?.address}</span>
              </p>
            </div>
          </div>

          {/* Switch patient demo profile */}
          <div className="relative">
            <button
              onClick={() => setShowPatientSelect(!showPatientSelect)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition"
            >
              <span>Switch Demo Patient</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-90" />
            </button>

            {showPatientSelect && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPatientSelect(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Patient Account
                  </p>
                  {patients.map((p) => {
                    const isSelected = p.id === currentPatient?.id;
                    const pRefs = referrals.filter((r) => r.patient_id === p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPatient(p.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-teal-50 text-teal-900 border border-teal-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {p.patient_code} • {pRefs.length} referral{pRefs.length === 1 ? '' : 's'}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Referral Selector if Patient has multiple referrals */}
      {patientReferrals.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
            Referrals:
          </span>
          {patientReferrals.map((ref) => {
            const isSelected = ref.id === activeReferral?.id;
            const dest = facilities.find((f) => f.id === ref.destination_facility_id);
            return (
              <button
                key={ref.id}
                onClick={() => setSelectedReferralId(ref.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{ref.referral_code}</span>
                <span className={`text-[10px] font-normal opacity-80 ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                  ({dest?.type || 'Hospital'})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* If No Referrals Exist for this patient */}
      {!activeReferral ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Active Referral Records</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are currently no referrals logged for {currentPatient?.name}. A Primary Health Centre (PHC) doctor can create a referral case.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                switchDemoUser('phc_doctor');
                onNavigate('create_referral', { patientId: currentPatient?.id });
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition"
            >
              Switch to Doctor & Create Referral
            </button>
            <button
              onClick={() => {
                const ravi = patients.find((p) => p.name.includes('Ravi Kumar'));
                if (ravi) setActivePatientId(ravi.id);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
            >
              View Demo Case: Ravi Kumar
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Navigation Sub-Tabs for Patient View */}
          <div className="grid grid-cols-4 gap-1 bg-slate-200/80 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('pass')}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'pass'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Digital Pass</span>
              <span className="sm:hidden">Pass</span>
            </button>

            <button
              onClick={() => setActiveTab('guidance')}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'guidance'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hospital Guidance</span>
              <span className="sm:hidden">Guidance</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Medical Summary</span>
              <span className="sm:hidden">Summary</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Journey</span>
              <span className="sm:hidden">Journey</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: DIGITAL PASS & STATUS CARD (Default View) */}
          {/* ========================================================================= */}
          {activeTab === 'pass' && (
            <div className="space-y-4">
              {/* 1. ACTIVE REFERRAL STATUS CARD */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
                {/* Background ambient gradient */}
                <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-teal-100/40 via-transparent to-transparent pointer-events-none" />

                <div className="flex items-start justify-between gap-3 relative">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
                      Live Referral Status
                    </span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full border ${statusInfo?.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusInfo?.dot}`} />
                        <span>{statusInfo?.label}</span>
                      </span>
                      <PriorityBadge priority={activeReferral.priority} size="md" />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Referral ID
                    </span>
                    <span className="font-mono text-sm font-extrabold text-teal-900">
                      {activeReferral.referral_code}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {statusInfo?.desc}
                </p>

                {/* Destination Hospital Summary Block */}
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                        Destination Hospital & Gate
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {destFacility?.name || 'District Hospital'}
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{destFacility?.address || 'King Koti Road, Hyderabad'}</span>
                      </p>
                    </div>

                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-teal-700 text-white shadow-sm shrink-0">
                      {destFacility?.type || 'Hospital'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-teal-200/50 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Department</span>
                      <strong className="text-slate-800 font-semibold">
                        Emergency & Cardiology
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Reporting Gate</span>
                      <strong className="text-teal-900 font-bold">
                        Emergency Gate 2
                      </strong>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 block font-medium">Created On</span>
                      <strong className="text-slate-800 font-semibold">
                        {new Date(activeReferral.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(activeReferral.created_at).toLocaleDateString()})
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. DIGITAL REFERRAL PASS (QR CODE CARD) */}
              <div
                id="digital-referral-pass"
                className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-teal-600 shadow-lg relative overflow-hidden"
              >
                {/* Official Header Strip */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-tight">
                        Government Health Department
                      </h3>
                      <p className="text-[10px] text-teal-700 font-bold">
                        Smart Tele-Triage Digital Referral Pass
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Official Pass
                  </span>
                </div>

                {/* QR Code & Scan Layout */}
                <div className="py-5 flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
                  {/* QR Code Container */}
                  <div className="p-3 bg-white rounded-2xl border-2 border-slate-800 shadow-md relative group shrink-0">
                    <QRCodeSVG
                      value={qrPayload}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                    <button
                      onClick={() => setShowQrModal(true)}
                      className="absolute inset-0 bg-slate-900/80 text-white font-bold text-xs rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Zoom QR</span>
                    </button>
                  </div>

                  {/* Pass Metadata & Details */}
                  <div className="space-y-2 flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Referral ID (Monospace)
                      </span>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                        <span className="font-mono text-xl sm:text-2xl font-extrabold text-teal-950 tracking-tight">
                          {activeReferral.referral_code}
                        </span>
                        <button
                          onClick={handleCopyCode}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Copy Referral ID"
                        >
                          {copiedCode ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1 pt-1">
                      <div>
                        <span className="text-slate-400">Patient:</span>{' '}
                        <strong>{currentPatient?.name}</strong>{' '}
                        <span className="font-mono text-slate-500">({currentPatient?.patient_code})</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Clinical Diagnosis:</span>{' '}
                        <strong className="text-slate-900">{activeReferral.diagnosis}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Referring Medical Officer:</span>{' '}
                        <span className="font-semibold text-slate-800">Dr. Anjali Rao ({sourceFacility?.name})</span>
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-teal-800 font-semibold flex items-center justify-center sm:justify-start gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Scan at Reception / Emergency Bay for Instant Check-in</span>
                    </div>
                  </div>
                </div>

                {/* Pass Actions: Copy, Print, Fullscreen */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrintPass}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download / Print</span>
                  </button>

                  <button
                    onClick={() => setShowQrModal(true)}
                    className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition active:scale-95"
                    title="Zoom QR Code"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Guidance Alert */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="font-bold block text-sm">Emergency Gate Protocol</strong>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    Show your digital QR code upon arrival at <strong>{destFacility?.name} (Emergency Gate 2)</strong>. The triage duty team has already been notified and pre-allocated admission resources.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ACTIONABLE GUIDANCE & NEXT STEPS */}
          {/* ========================================================================= */}
          {activeTab === 'guidance' && (
            <div className="space-y-4">
              {/* Step-by-Step Action Plan Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Hospital Arrival Guide</h3>
                    <p className="text-xs text-slate-500">
                      Follow these verified instructions upon reaching {destFacility?.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Report to Emergency Gate 2
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Proceed directly to <strong>Emergency Gate 2</strong> (Trauma & CCU Ingress) at {destFacility?.name}, {destFacility?.address}. Do not wait in the general outpatient queue.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Scan Digital Referral QR Pass
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Present the digital pass from this portal or the printed slip to the duty triage nursing desk for instantaneous verification and queue priority.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Direct Handover to Specialist Duty Team
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        The referring doctor’s clinical notes, ECG records, and first-aid treatment summary have already been electronically transferred.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Documents Checklist Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Required Documents Checklist</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/70 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Digital Referral Pass</strong>
                      <span className="text-[11px] text-slate-500">QR code on this phone screen</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/70 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Government Photo ID</strong>
                      <span className="text-[11px] text-slate-500">Aadhaar Card / Voter ID</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/70 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">ABHA Health Card</strong>
                      <span className="text-[11px] text-slate-500">Ayushman Bharat ID (if available)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/70 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Previous Prescriptions</strong>
                      <span className="text-[11px] text-slate-500">Medication list & PHC slip</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>One-Tap Emergency Contacts</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Ambulance */}
                  <a
                    href="tel:108"
                    className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-950 transition flex items-center justify-between group active:scale-95"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-600 block">Emergency</span>
                      <strong className="text-base font-extrabold">108 Ambulance</strong>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                  </a>

                  {/* Destination Hospital Desk */}
                  <a
                    href={`tel:${destFacility?.contact || '040-24600002'}`}
                    className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 transition flex items-center justify-between group active:scale-95"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 block">Hospital Desk</span>
                      <strong className="text-sm font-extrabold truncate block max-w-[130px]">
                        {destFacility?.contact || '040-24600002'}
                      </strong>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                  </a>

                  {/* PHC Medical Officer */}
                  <a
                    href="tel:040-23050001"
                    className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 transition flex items-center justify-between group active:scale-95"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Referring PHC</span>
                      <strong className="text-sm font-extrabold truncate block max-w-[130px]">
                        040-23050001
                      </strong>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: MEDICAL SUMMARY VIEW (Clean Read-Only) */}
          {/* ========================================================================= */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Clinical Medical Summary</h3>
                    <p className="text-xs text-slate-500">Transferred from PHC Kukatpally to Receiving Hospital</p>
                  </div>
                  <PriorityBadge priority={activeReferral.priority} size="md" />
                </div>

                {/* Primary Diagnosis Highlight Box */}
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    Primary Clinical Diagnosis
                  </span>
                  <div className="text-base font-extrabold text-slate-900">
                    {activeReferral.diagnosis}
                  </div>
                  <div className="text-xs text-slate-600 pt-1">
                    <span className="font-semibold text-slate-800">Chief Complaint:</span> {activeReferral.chief_complaint}
                  </div>
                </div>

                {/* Patient Vitals at Referring Facility */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Recorded Vitals at PHC
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Blood Pressure</span>
                      <strong className="text-sm font-bold text-slate-900">{activeReferral.blood_pressure}</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Heart Rate</span>
                      <strong className="text-sm font-bold text-slate-900">{activeReferral.heart_rate}</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">SpO2 Oxygen</span>
                      <strong className="text-sm font-bold text-teal-700">{activeReferral.spo2}</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Temperature</span>
                      <strong className="text-sm font-bold text-slate-900">{activeReferral.temperature}</strong>
                    </div>
                  </div>
                </div>

                {/* Treatment Administered & Notes */}
                <div className="space-y-3 text-xs">
                  {activeReferral.current_treatment && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider mb-1">
                        First-Aid & Emergency Medication Given at PHC
                      </span>
                      <p className="text-slate-700 leading-relaxed">{activeReferral.current_treatment}</p>
                    </div>
                  )}

                  {activeReferral.doctor_notes && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider mb-1">
                        Referring Doctor's Clinical Remarks
                      </span>
                      <p className="text-slate-700 leading-relaxed italic">"{activeReferral.doctor_notes}"</p>
                    </div>
                  )}

                  {activeReferral.relevant_history && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider mb-1">
                        Past Medical History & Comorbidities
                      </span>
                      <p className="text-slate-700 leading-relaxed">{activeReferral.relevant_history}</p>
                    </div>
                  )}
                </div>

                {/* Referring Doctor Info */}
                <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
                  <span>Referring Officer: <strong>Dr. Anjali Rao (PHC Kukatpally)</strong></span>
                  <span>Transmitted: <strong>{new Date(activeReferral.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: LIVE JOURNEY & AUDIT TIMELINE */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Live Referral Journey</h3>
                    <p className="text-xs text-slate-500">Real-time tele-triage progress from PHC to Hospital</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    {activeReferral.referral_code}
                  </span>
                </div>

                {/* Audit Timeline */}
                <div className="space-y-4 pl-2">
                  {referralHistory.map((step, idx) => {
                    const isLast = idx === referralHistory.length - 1;
                    return (
                      <div key={step.id || idx} className="flex items-start gap-3 relative">
                        {/* Connecting Line */}
                        {!isLast && (
                          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-teal-200 -ml-[1px]" />
                        )}

                        {/* Step Marker */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ${
                            isLast
                              ? 'bg-teal-700 text-white ring-4 ring-teal-100'
                              : 'bg-teal-100 text-teal-700'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                              {step.status.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(step.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                            {step.remarks}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200 flex items-center justify-between">
                            <span>By: <strong>{step.updated_by_name}</strong></span>
                            <span className="capitalize">{step.updated_by_role.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN QR CODE ZOOM MODAL */}
      {/* ========================================================================= */}
      {showQrModal && activeReferral && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-2">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Hospital Scanner Mode
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                {currentPatient?.name}
              </h3>
              <p className="font-mono text-xs font-bold text-slate-500">
                {activeReferral.referral_code}
              </p>
            </div>

            {/* Large High Contrast QR Code */}
            <div className="p-4 bg-white rounded-2xl border-4 border-slate-900 shadow-inner flex items-center justify-center max-w-[240px] mx-auto">
              <QRCodeSVG
                value={qrPayload}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                Hold phone screen near hospital triage barcode / QR scanner at <strong>{destFacility?.name} (Emergency Gate 2)</strong>.
              </p>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition"
              >
                Done Scanning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
