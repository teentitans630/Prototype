import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  HeartHandshake,
  Droplet,
  AlertTriangle,
  Activity,
  Send,
  Calendar,
  Building2,
  FileHeart,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Settings,
  Plus,
  ArrowLeft,
  Share2,
  Download,
  AlertCircle,
  Sliders,
  Truck,
  TestTube,
  Network,
  Stethoscope,
  Snowflake,
} from 'lucide-react';
import { PatientProfileViewProps, Patient } from '../types/patient';
import { usePatientProfile } from '../hooks/usePatientProfile';
import { VitalsWidget } from './subcomponents/VitalsWidget';
import { MedicalHistoryTable } from './subcomponents/MedicalHistoryTable';
import { AppointmentLog } from './subcomponents/AppointmentLog';
import { VitalThresholdsConfigPanel } from './subcomponents/VitalThresholdsConfigPanel';
import {
  DEFAULT_TELE_TRIAGE_RECORDS,
  DEFAULT_POC_DIAGNOSTICS,
  DEFAULT_REFERRAL_REQUESTS,
} from '../services/referralEngine';

type ProfileTab =
  | 'overview'
  | 'medical_records'
  | 'vitals_history'
  | 'appointments'
  | 'field_care'
  | 'settings';

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patientId,
  onNavigate,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    patient,
    patients,
    age,
    latestVitals,
    vitalsHistory,
    medicalHistory,
    activeConditions,
    upcomingAppointments,
    pastAppointments,
    abnormalVitalsCount,
    pendingSyncCount,
    networkStatus,
    isLoading,
    vitalThresholds,
    selectPatient,
    updateThresholds,
    resetThresholds,
    applyPreset,
    recordVitals,
    deleteVitals,
    recordMedicalCondition,
    changeConditionStatus,
    removeCondition,
    scheduleAppointment,
    changeAppointmentStatus,
    removeAppointment,
    updateDemographics,
    syncAll,
    setNetworkStatus,
    resetToDefaults,
  } = usePatientProfile(patientId);

  // Edit Demographics form state
  const [demographicsForm, setDemographicsForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  const handleOpenEdit = () => {
    if (!patient) return;
    setDemographicsForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone,
      email: patient.email || '',
      address: patient.address,
      emergencyName: patient.emergencyContact.name,
      emergencyRelation: patient.emergencyContact.relation,
      emergencyPhone: patient.emergencyContact.phone,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveDemographics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const ok = await updateDemographics({
      firstName: demographicsForm.firstName.trim(),
      lastName: demographicsForm.lastName.trim(),
      phone: demographicsForm.phone.trim(),
      email: demographicsForm.email.trim() || undefined,
      address: demographicsForm.address.trim(),
      emergencyContact: {
        name: demographicsForm.emergencyName.trim(),
        relation: demographicsForm.emergencyRelation.trim(),
        phone: demographicsForm.emergencyPhone.trim(),
      },
    });

    if (ok) {
      setIsEditModalOpen(false);
      showToast('Patient demographics updated successfully.');
    }
  };

  const handleSyncClick = async () => {
    showToast('Synchronizing offline records with central health server...');
    const ok = await syncAll();
    if (ok) {
      showToast('All records synced successfully!');
    }
  };

  const handleNetworkToggle = () => {
    if (networkStatus === 'online') {
      setNetworkStatus('offline');
      showToast('Switched to Offline Mode. Changes are queued locally.');
    } else if (networkStatus === 'offline') {
      setNetworkStatus('simulated-slow');
      showToast('Simulating Rural 2G/3G High Latency Network.');
    } else {
      setNetworkStatus('online');
      showToast('Switched to High-Speed Online Mode.');
    }
  };

  if (!patient) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-base font-bold text-slate-800">Patient Record Not Found</p>
        <p className="text-xs text-slate-400 mt-1">
          Please select an active patient from the registry or reset sample data.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => onNavigate?.('patients')}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition"
          >
            Go to Patients List
          </button>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Reset Default Data
          </button>
        </div>
      </div>
    );
  }

  const nextAppointment = upcomingAppointments[0];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Toast Notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Navigation & Network Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            id="btn-patient-profile-back"
            onClick={() => {
              if (onBack) onBack();
              else if (onNavigate) onNavigate('patients');
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 leading-none">
                Patient EHR Dashboard
              </h2>
              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                {patient.mrn}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Integrated Triage, Vitals & Referral Management
            </p>
          </div>
        </div>

        {/* Action Controls & Sync Pills */}
        <div className="flex items-center gap-2">
          {/* Network Switcher Toggle */}
          <button
            id="btn-network-toggle"
            onClick={handleNetworkToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              networkStatus === 'online'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : networkStatus === 'offline'
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Click to simulate network conditions"
          >
            {networkStatus === 'online' ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            ) : networkStatus === 'offline' ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span className="capitalize">{networkStatus === 'simulated-slow' ? '2G Slow' : networkStatus}</span>
          </button>

          {/* Pending Sync Button */}
          {pendingSyncCount > 0 && (
            <button
              id="btn-sync-pending"
              onClick={handleSyncClick}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-xs transition active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync ({pendingSyncCount})</span>
            </button>
          )}

          {/* Quick Create Referral */}
          {onNavigate && (
            <button
              id="btn-create-referral-top"
              onClick={() => onNavigate('create_referral', { patientId: patient.id })}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Create Referral</span>
            </button>
          )}
        </div>
      </div>

      {/* Master Demographics Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar with Status badge */}
            <div className="relative shrink-0">
              <img
                src={
                  patient.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.firstName}`
                }
                alt={`${patient.firstName} ${patient.lastName}`}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-600/30 bg-slate-100 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  patient.syncStatus === 'Synced' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={`Sync Status: ${patient.syncStatus}`}
              />
            </div>

            {/* Demographics details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className="text-xs font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-red-600 fill-red-600" />
                  {patient.bloodType}
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {patient.gender}, {age} yrs
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[220px]" title={patient.address}>
                    {patient.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demographics Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Demographics</span>
            </button>
          </div>
        </div>

        {/* Allergy & Chronic Condition Highlights banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-red-50/70 p-3 rounded-2xl border border-red-100 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-red-900 uppercase tracking-wide">
                Documented Allergies & Contraindications
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.allergies.length > 0 ? (
                  patient.allergies.map((alg, i) => (
                    <span
                      key={i}
                      className="text-xs font-bold text-red-700 bg-white/90 px-2 py-0.5 rounded-md border border-red-200"
                    >
                      {alg}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No allergies recorded</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-teal-50/70 p-3 rounded-2xl border border-teal-100 flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wide">
                Active Chronic Conditions
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.chronicConditions.length > 0 ? (
                  patient.chronicConditions.map((cond, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold text-teal-800 bg-white/90 px-2 py-0.5 rounded-md border border-teal-200"
                    >
                      {cond}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No chronic diagnoses documented</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <button
          id="tab-btn-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Overview & Triage</span>
        </button>

        <button
          id="tab-btn-medical-records"
          onClick={() => setActiveTab('medical_records')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'medical_records'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Medical History</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'medical_records' ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {medicalHistory.length}
          </span>
        </button>

        <button
          id="tab-btn-vitals-history"
          onClick={() => setActiveTab('vitals_history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'vitals_history'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Vitals Monitor</span>
          {abnormalVitalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
              {abnormalVitalsCount} Alert
            </span>
          )}
        </button>

        <button
          id="tab-btn-appointments"
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'appointments'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Appointments</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'appointments' ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {upcomingAppointments.length}
          </span>
        </button>

        <button
          id="tab-btn-field-care"
          onClick={() => setActiveTab('field_care')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'field_care'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Field Care & Referrals</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'field_care' ? 'bg-teal-800 text-teal-100' : 'bg-teal-100 text-teal-800'
            }`}
          >
            Rural
          </span>
        </button>

        <button
          id="tab-btn-settings"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Settings & Thresholds</span>
        </button>
      </div>

      {/* Tab Content Panes */}
      <div className="space-y-4">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Next Appointment Spotlight */}
            {nextAppointment && (
              <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-teal-200" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
                      Next Scheduled Clinical Encounter
                    </span>
                    <h4 className="text-sm font-bold">{nextAppointment.title}</h4>
                    <p className="text-xs text-teal-100 mt-0.5">
                      {new Date(nextAppointment.scheduledDate).toLocaleDateString()} at{' '}
                      {nextAppointment.scheduledTime} • {nextAppointment.doctorName} ({nextAppointment.facilityName})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition self-start sm:self-auto"
                >
                  View Visits
                </button>
              </div>
            )}

            {/* Vitals Summary Card Component */}
            <VitalsWidget
              latestVitals={latestVitals}
              vitalsHistory={vitalsHistory}
              thresholds={vitalThresholds}
              onOpenThresholdSettings={() => setActiveTab('settings')}
              onAddVitals={async (data) => {
                const ok = await recordVitals(data);
                if (ok) showToast('New vitals recorded successfully.');
              }}
              onDeleteVitals={async (id) => {
                const ok = await deleteVitals(id);
                if (ok) showToast('Vitals record removed.');
              }}
              isLoading={isLoading}
              syncStatus={patient.syncStatus}
            />

            {/* Medical Records Preview & Emergency Contact Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Active Conditions (2 cols) */}
              <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Clinical Diagnoses ({activeConditions.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('medical_records')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {activeConditions.slice(0, 3).map((cond) => (
                    <div key={cond.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{cond.condition}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cond.notes}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        {cond.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contact Card (1 col) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Emergency Contact</h3>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {patient.emergencyContact.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {patient.emergencyContact.relation}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.emergencyContact.phone}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate?.('create_referral', { patientId: patient.id })}
                    className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Initiate Inter-Facility Referral</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Medical Records */}
        {activeTab === 'medical_records' && (
          <MedicalHistoryTable
            records={medicalHistory}
            onUpdateStatus={async (id, newStatus) => {
              const ok = await changeConditionStatus(id, newStatus);
              if (ok) showToast('Medical condition status updated.');
            }}
            onDeleteRecord={async (id) => {
              const ok = await removeCondition(id);
              if (ok) showToast('Medical record deleted.');
            }}
            onAddRecord={async (data) => {
              const ok = await recordMedicalCondition(data);
              if (ok) showToast('Medical condition documented.');
            }}
            isLoading={isLoading}
          />
        )}

        {/* Tab 3: Vitals History */}
        {activeTab === 'vitals_history' && (
          <VitalsWidget
            latestVitals={latestVitals}
            vitalsHistory={vitalsHistory}
            thresholds={vitalThresholds}
            onOpenThresholdSettings={() => setActiveTab('settings')}
            onAddVitals={async (data) => {
              const ok = await recordVitals(data);
              if (ok) showToast('New vitals recorded successfully.');
            }}
            onDeleteVitals={async (id) => {
              const ok = await deleteVitals(id);
              if (ok) showToast('Vitals record removed.');
            }}
            isLoading={isLoading}
            syncStatus={patient.syncStatus}
          />
        )}

        {/* Tab 4: Appointments */}
        {activeTab === 'appointments' && (
          <AppointmentLog
            appointments={patient.appointments}
            onAddAppointment={async (data) => {
              const ok = await scheduleAppointment(data);
              if (ok) showToast('Clinical encounter booked.');
            }}
            onUpdateStatus={async (id, status) => {
              const ok = await changeAppointmentStatus(id, status);
              if (ok) showToast(`Appointment marked as ${status}.`);
            }}
            onDeleteAppointment={async (id) => {
              const ok = await removeAppointment(id);
              if (ok) showToast('Appointment removed.');
            }}
            isLoading={isLoading}
          />
        )}

        {/* Tab: Field Care & Rural Referrals */}
        {activeTab === 'field_care' && (
          <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white p-5 rounded-3xl border border-teal-500/30 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5 w-fit">
                    <Stethoscope className="w-3.5 h-3.5" />
                    Rural Primary & Field Encounters
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    Field Tele-Triage, Point-of-Care Kits & Ambulance Routing
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    Unified log of village-level ASHA/ANM triage assessments, rapid diagnostic test kits, and inter-facility emergency transport telemetry for {patient.firstName} {patient.lastName}.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('rural_triage')}
                      className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Field Triage</span>
                    </button>
                  )}
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('rural_referrals')}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Pipeline</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sub-section 1: Active Referral & 108 Transit Status */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Referral & Emergency Transport Status</span>
                </h4>
                <span className="text-xs font-semibold text-slate-500">Live Logistics</span>
              </div>

              {DEFAULT_REFERRAL_REQUESTS.filter(
                (r) => r.patientName.toLowerCase().includes(patient.firstName.toLowerCase()) || r.id === 'ref-001'
              ).slice(0, 1).map((ref) => (
                <div key={ref.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">{ref.referralCode}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                          {ref.priority} Priority
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {ref.status}
                        </span>
                      </div>
                      <h5 className="text-sm font-extrabold text-slate-900 mt-1">
                        To: {ref.destinationFacilityName} ({ref.specialtyRequired})
                      </h5>
                    </div>

                    {ref.bedReservationCode && (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Bed Reserved: {ref.bedReservationCode}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium bg-white p-2.5 rounded-xl border border-slate-200">
                    {ref.clinicalSummary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Transport</span>
                      <span className="font-bold text-slate-800">{ref.transportArrangement}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicle No / Driver</span>
                      <span className="font-bold text-slate-800">{ref.transportVehicleNumber} • {ref.transportDriverContact}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated ETA</span>
                      <span className="font-extrabold text-rose-700">~{ref.transportEtaMinutes} Minutes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sub-section 2: Point-of-Care Diagnostics Log */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-teal-600" />
                  <span>Field Point-of-Care Diagnostics (Rapid Tests)</span>
                </h4>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('rural_poc')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800"
                  >
                    Open Diagnostic Hub &rarr;
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEFAULT_POC_DIAGNOSTICS.slice(0, 2).map((test) => (
                  <div key={test.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">{test.testCode}</span>
                        <h5 className="text-xs font-black text-slate-900">{test.testType}</h5>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        test.result === 'Positive' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {test.result}
                      </span>
                    </div>

                    {test.quantitativeValue && (
                      <div className="text-xs font-bold text-slate-800 bg-white p-2 rounded-xl border border-slate-200">
                        Reading: {test.quantitativeValue}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-600 italic">{test.clinicalImplication}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                      <span>Tested by {test.conductedByWorker}</span>
                      <span>{new Date(test.conductedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-section 3: Field Tele-Triage History */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  <span>Historical Field Triage Records</span>
                </h4>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('rural_triage')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800"
                  >
                    View All Assessments &rarr;
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {DEFAULT_TELE_TRIAGE_RECORDS.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{rec.chiefComplaint}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          rec.priority === 'Emergency' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.priority}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {rec.triageCode}
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Recorded by {rec.workerName} ({rec.workerRole}) at {rec.villageName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right shrink-0">
                      <div className="text-[10px] text-slate-500">
                        <div>BP: {rec.vitals.systolicBp}/{rec.vitals.diastolicBp} mmHg</div>
                        <div>SpO2: {rec.vitals.spo2Pct}% • Pulse: {rec.vitals.heartRateBpm} bpm</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Settings & Demographics & Vital Thresholds */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Clinician Threshold Configuration Panel */}
            <VitalThresholdsConfigPanel
              thresholds={vitalThresholds}
              onUpdateThresholds={updateThresholds}
              onResetThresholds={resetThresholds}
              onApplyPreset={applyPreset}
              currentVitals={latestVitals}
              onSaveToast={showToast}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Registry Switcher */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Switch Active Patient</h3>
                <p className="text-xs text-slate-500">
                  Select another registered patient profile from local state:
                </p>

                <div className="space-y-2">
                  {patients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        selectPatient(p.id);
                        showToast(`Switched to patient: ${p.firstName} ${p.lastName}`);
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition ${
                        p.id === patient.id
                          ? 'bg-teal-50 border-teal-300 text-teal-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">{p.mrn}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200">
                        {p.bloodType}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Diagnostics & Maintenance */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Storage & Diagnostic Controls</h3>
                <p className="text-xs text-slate-500">
                  Manage local storage persistence, simulate network sync queues, or restore sample state:
                </p>

                <div className="space-y-2.5">
                  <button
                    onClick={handleSyncClick}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Synchronize All Local Queues</span>
                  </button>

                  <button
                    onClick={() => {
                      resetToDefaults();
                      showToast('Patient state reset to initial seed data.');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Reset Local Storage & Seed Data
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                  <p>• Local Storage Key: <code>smart_referral_patient_mgmt_state_v1</code></p>
                  <p>• Thresholds Key: <code>smart_referral_vital_thresholds_v1</code></p>
                  <p>• Last State Sync: {new Date(patient.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Demographics Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Update Patient Demographics</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDemographics} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={demographicsForm.firstName}
                    onChange={(e) =>
                      setDemographicsForm({ ...demographicsForm, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={demographicsForm.lastName}
                    onChange={(e) =>
                      setDemographicsForm({ ...demographicsForm, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={demographicsForm.phone}
                    onChange={(e) =>
                      setDemographicsForm({ ...demographicsForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={demographicsForm.email}
                    onChange={(e) =>
                      setDemographicsForm({ ...demographicsForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address *
                </label>
                <input
                  type="text"
                  required
                  value={demographicsForm.address}
                  onChange={(e) =>
                    setDemographicsForm({ ...demographicsForm, address: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-900">Emergency Contact Details</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    required
                    value={demographicsForm.emergencyName}
                    onChange={(e) =>
                      setDemographicsForm({ ...demographicsForm, emergencyName: e.target.value })
                    }
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g. Spouse)"
                    required
                    value={demographicsForm.emergencyRelation}
                    onChange={(e) =>
                      setDemographicsForm({ ...demographicsForm, emergencyRelation: e.target.value })
                    }
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Emergency Phone"
                    required
                    value={demographicsForm.emergencyPhone}
                    onChange={(e) =>
                      setDemographicsForm({ ...demographicsForm, emergencyPhone: e.target.value })
                    }
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition"
                >
                  Save Demographics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
