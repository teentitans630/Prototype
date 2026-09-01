import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { PatientScanner } from '../components/PatientScanner';
import { Patient } from '../types';
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Building2,
  Calendar,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Activity,
  QrCode,
  User,
  Heart,
  Save,
  Check,
  Stethoscope,
  Phone,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface PHCDashboardViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const PHCDashboardView: React.FC<PHCDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, referrals, patients, facilities, updatePatient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Scanner & Lookup State
  const [scannerMode, setScannerMode] = useState<'code' | 'camera'>('code');
  const [patientInputCode, setPatientInputCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    return patients.length > 0 ? patients[0] : null;
  });
  const [searchError, setSearchError] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Medical Records Modification Form State
  const [medicalForm, setMedicalForm] = useState({
    diagnosis: selectedPatient?.medical_history || 'Acute Coronary Syndrome (STEMI)',
    doctor_notes: 'Patient presented with acute diaphoresis and substernal chest discomfort radiating to left arm for 45 minutes.',
    medications: selectedPatient?.medications || 'Aspirin 325mg stat, Clopidogrel 300mg stat, Sublingual Nitroglycerin 0.4mg',
    allergies: selectedPatient?.allergies || 'Penicillin (mild urticaria)',
    chronic_conditions: selectedPatient?.chronic_conditions || 'Hypertension (6 yrs), Type 2 Diabetes Mellitus',
    blood_pressure: selectedPatient?.recent_vitals?.blood_pressure || '145/92 mmHg',
    heart_rate: selectedPatient?.recent_vitals?.heart_rate || '96 bpm',
    spo2: selectedPatient?.recent_vitals?.spo2 || '95%',
    temperature: selectedPatient?.recent_vitals?.temperature || '98.6°F',
    chief_complaint: 'Substernal chest pressure and breathlessness on exertion',
    icd10_code: 'I21.0 - ST elevation myocardial infarction of anterior wall',
  });

  // Standard Medical Terminology Quick Presets
  const MEDICAL_TERMINOLOGY_PRESETS = [
    { label: 'ACS / STEMI', term: 'Acute Coronary Syndrome (STEMI)', icd: 'I21.0' },
    { label: 'Severe Preeclampsia', term: 'Severe Preeclampsia with Impending Eclampsia', icd: 'O14.1' },
    { label: 'COPD Exacerbation', term: 'Acute Exacerbation of Chronic Obstructive Pulmonary Disease', icd: 'J44.1' },
    { label: 'Diabetic Ketoacidosis', term: 'Diabetic Ketoacidosis (DKA) with Hyperglycemia', icd: 'E11.1' },
    { label: 'Acute Appendicitis', term: 'Acute Appendicitis with Localized Peritoneal Signs', icd: 'K35.8' },
    { label: 'Compound Fracture', term: 'Open Compound Tibial Fracture with Neurovascular Risk', icd: 'S82.2' },
  ];

  // Scope to current doctor's facility (or all if admin)
  const myFacilityId = currentUser?.facility_id || 'fac-phc-01';
  const myFacility = facilities.find((f) => f.id === myFacilityId);
  const myReferrals = referrals.filter(
    (r) => r.source_facility_id === myFacilityId || currentUser?.role === 'admin'
  );

  // Compute stat card numbers
  const totalCount = myReferrals.length;
  const pendingCount = myReferrals.filter((r) => r.status === 'pending').length;
  const acceptedCount = myReferrals.filter(
    (r) => r.status === 'accepted' || r.status === 'patient_arrived' || r.status === 'under_treatment'
  ).length;
  const completedCount = myReferrals.filter((r) => r.status === 'completed').length;

  // Audio chime feedback for scanner
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Ignore audio constraints
    }
  };

  // Search / Fetch Patient by ID or Code
  const handleFetchPatient = (codeQuery?: string) => {
    setSearchError('');
    setSaveSuccessMessage('');
    const query = (codeQuery !== undefined ? codeQuery : patientInputCode).trim().toLowerCase();

    if (!query) {
      setSearchError('Please enter a Patient Code, ID, or Phone Number');
      return;
    }

    const found = patients.find(
      (p) =>
        p.patient_code.toLowerCase() === query ||
        p.id.toLowerCase() === query ||
        p.phone.includes(query) ||
        p.name.toLowerCase().includes(query)
    );

    if (found) {
      playScanBeep();
      setSelectedPatient(found);
      setMedicalForm({
        diagnosis: found.medical_history || 'Acute Coronary Syndrome (STEMI)',
        doctor_notes: `Clinical examination conducted on ${new Date().toLocaleDateString()}. Patient evaluated in triage.`,
        medications: found.medications || 'Aspirin 325mg, Atorvastatin 40mg',
        allergies: found.allergies || 'None known',
        chronic_conditions: found.chronic_conditions || found.medical_history || 'None recorded',
        blood_pressure: found.recent_vitals?.blood_pressure || found.recent_vitals?.bp || '130/85 mmHg',
        heart_rate: found.recent_vitals?.heart_rate || found.recent_vitals?.hr || '88 bpm',
        spo2: found.recent_vitals?.spo2 || '97%',
        temperature: found.recent_vitals?.temperature || found.recent_vitals?.temp || '98.4°F',
        chief_complaint: 'Clinical evaluation & triage request',
        icd10_code: 'R69 - Illness, unspecified',
      });
      setSearchError('');
    } else {
      setSearchError(`No patient found matching "${query}". Check code format (e.g. PAT-000245)`);
    }
  };

  // Simulate QR Code Camera Scan
  const handleSimulateScan = (scannedPatient: Patient) => {
    setIsScanning(true);
    setTimeout(() => {
      playScanBeep();
      setIsScanning(false);
      setSelectedPatient(scannedPatient);
      setPatientInputCode(scannedPatient.patient_code);
      setMedicalForm({
        diagnosis: scannedPatient.medical_history || 'Evaluated in Tele-Triage',
        doctor_notes: `QR Code Verified: ${scannedPatient.patient_code}. Identity validated digitally.`,
        medications: scannedPatient.medications || 'Standard medication protocol',
        allergies: scannedPatient.allergies || 'None known',
        chronic_conditions: scannedPatient.chronic_conditions || scannedPatient.medical_history || 'None',
        blood_pressure: scannedPatient.recent_vitals?.blood_pressure || scannedPatient.recent_vitals?.bp || '135/88 mmHg',
        heart_rate: scannedPatient.recent_vitals?.heart_rate || scannedPatient.recent_vitals?.hr || '90 bpm',
        spo2: scannedPatient.recent_vitals?.spo2 || '96%',
        temperature: scannedPatient.recent_vitals?.temperature || scannedPatient.recent_vitals?.temp || '98.6°F',
        chief_complaint: 'Emergency medical assessment',
        icd10_code: 'Z00.0 - General medical examination',
      });
      setScannerMode('code');
    }, 700);
  };

  // Save Doctor Modifications & Notes
  const handleSaveMedicalModifications = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    updatePatient(selectedPatient.id, {
      medical_history: medicalForm.diagnosis,
      chronic_conditions: medicalForm.chronic_conditions,
      allergies: medicalForm.allergies,
      medications: medicalForm.medications,
      recent_vitals: {
        blood_pressure: medicalForm.blood_pressure,
        heart_rate: medicalForm.heart_rate,
        spo2: medicalForm.spo2,
        temperature: medicalForm.temperature,
      },
    });

    setSaveSuccessMessage(
      `Medical record updated successfully for ${selectedPatient.name} (${selectedPatient.patient_code})`
    );

    setTimeout(() => {
      setSaveSuccessMessage('');
    }, 4000);
  };

  // Filtered recent referrals
  const filteredReferrals = myReferrals
    .filter((r) => {
      const patient = patients.find((p) => p.id === r.patient_id);
      const dest = facilities.find((f) => f.id === r.destination_facility_id);
      const query = searchTerm.toLowerCase();
      return (
        r.referral_code.toLowerCase().includes(query) ||
        (patient && patient.name.toLowerCase().includes(query)) ||
        (dest && dest.name.toLowerCase().includes(query)) ||
        r.diagnosis.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-5">
      {/* Welcome & Facility Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-teal-950/20 border border-teal-700/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Stethoscope className="w-3 h-3" />
              <span>Doctor Clinical Workspace</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome, {currentUser?.name || 'Doctor'}
            </h2>
            <p className="text-xs text-teal-200 mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>{myFacility?.name || 'PHC Kukatpally'} • Tele-Triage Station</span>
            </p>
          </div>

          {/* Quick Action: New Referral */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-create-referral"
              onClick={() => onNavigate('create_referral', { preselectedPatientId: selectedPatient?.id })}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.98]"
            >
              <Send className="w-4 h-4 text-slate-950 shrink-0" />
              <span>+ Create Referral Transfer</span>
            </button>
          </div>
        </div>

        {/* Notice: Doctor Role Restrictions */}
        <div className="mt-4 pt-3 border-t border-teal-800/80 flex items-center justify-between text-xs text-teal-300">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Registration restricted to Hospitals & Patient Self-Service</span>
          </span>
          <span className="text-[11px] font-semibold text-teal-300/80">
            {patients.length} Total Registered Patients
          </span>
        </div>
      </div>

      {/* REGIONAL EPIDEMIOLOGICAL SURVEILLANCE BANNER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-600/70 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-md animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/30 text-rose-200 border border-rose-400/40">
                Active IDSP Cluster: Kukatpally Ward 4
              </span>
              <span className="text-[11px] font-bold text-rose-400 font-mono">Dengue Virus (DEN-2)</span>
            </div>
            <h4 className="text-base font-bold text-white">
              Elevated Febrile Surge Detected in Local Sector
            </h4>
            <p className="text-xs text-slate-300 max-w-2xl">
              18 febrile cases recorded this week. Triage suspected patients with NS1 antigen, platelet monitoring, and mandatory statutory reporting.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('create_referral')}
          className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0 flex items-center justify-center gap-2"
        >
          <span>Launch Outbreak Referral</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* SECTION 1: QR & CODE SCANNER WORKSPACE */}
      <PatientScanner
        mode="doctor_patient_lookup"
        patients={patients}
        onPatientScanned={(code) => {
          handleFetchPatient(code);
        }}
        title="Doctor QR Scanner & Patient EHR Lookup"
        subtitle="Scan digital QR pass or enter patient ID to fetch medical history & vitals for triage"
      />

      {/* SECTION 2: COMPREHENSIVE MEDICAL REPORT & MODIFICATION FORM */}
      {selectedPatient ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Patient Header Banner */}
          <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500 text-slate-950 font-extrabold text-xs">
                  {selectedPatient.patient_code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-xs">
                  Blood Group: {selectedPatient.blood_group || 'O+'}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {selectedPatient.gender}, {selectedPatient.date_of_birth}
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1.5">
                {selectedPatient.name}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-teal-400" />
                  {selectedPatient.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-teal-400" />
                  {selectedPatient.address}
                </span>
              </p>
            </div>

            {/* Referral Transfer Button */}
            <button
              type="button"
              id="btn-refer-selected-patient"
              onClick={() => onNavigate('create_referral', { preselectedPatientId: selectedPatient.id })}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition"
            >
              <Send className="w-4 h-4" />
              <span>Transfer to Hospital</span>
            </button>
          </div>

          {/* Save Success Banner */}
          {saveSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* Medical Modification Form */}
          <form onSubmit={handleSaveMedicalModifications} className="p-5 space-y-5">
            {/* Vitals Triage Row */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-600" />
                <span>Current Vital Signs Assessment</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">Blood Pressure</span>
                  <input
                    type="text"
                    id="input-vitals-bp"
                    value={medicalForm.blood_pressure}
                    onChange={(e) => setMedicalForm({ ...medicalForm, blood_pressure: e.target.value })}
                    className="w-full mt-1 font-mono font-bold text-sm bg-white px-2 py-1.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="120/80 mmHg"
                  />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">Heart Rate</span>
                  <input
                    type="text"
                    id="input-vitals-hr"
                    value={medicalForm.heart_rate}
                    onChange={(e) => setMedicalForm({ ...medicalForm, heart_rate: e.target.value })}
                    className="w-full mt-1 font-mono font-bold text-sm bg-white px-2 py-1.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="78 bpm"
                  />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">Oxygen (SpO2)</span>
                  <input
                    type="text"
                    id="input-vitals-spo2"
                    value={medicalForm.spo2}
                    onChange={(e) => setMedicalForm({ ...medicalForm, spo2: e.target.value })}
                    className="w-full mt-1 font-mono font-bold text-sm bg-white px-2 py-1.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="98%"
                  />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">Body Temp</span>
                  <input
                    type="text"
                    id="input-vitals-temp"
                    value={medicalForm.temperature}
                    onChange={(e) => setMedicalForm({ ...medicalForm, temperature: e.target.value })}
                    className="w-full mt-1 font-mono font-bold text-sm bg-white px-2 py-1.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="98.6°F"
                  />
                </div>
              </div>
            </div>

            {/* Standard Medical Terminology Diagnosis */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-700" />
                  <span>Clinical Diagnosis & Standard Terminology *</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Standard Medical Fields</span>
              </div>

              {/* Terminology Presets */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {MEDICAL_TERMINOLOGY_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setMedicalForm({
                        ...medicalForm,
                        diagnosis: preset.term,
                        icd10_code: preset.icd,
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                id="input-medical-diagnosis"
                value={medicalForm.diagnosis}
                onChange={(e) => setMedicalForm({ ...medicalForm, diagnosis: e.target.value })}
                placeholder="e.g. Acute Coronary Syndrome (STEMI), Hypertensive Crisis"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            {/* ICD-10 Classification & Chief Complaint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ICD-10 Code & Classification
                </label>
                <input
                  type="text"
                  id="input-icd-code"
                  value={medicalForm.icd10_code}
                  onChange={(e) => setMedicalForm({ ...medicalForm, icd10_code: e.target.value })}
                  placeholder="e.g. I21.0 - Acute transmural myocardial infarction"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chief Complaint & Onset
                </label>
                <input
                  type="text"
                  id="input-chief-complaint"
                  value={medicalForm.chief_complaint}
                  onChange={(e) => setMedicalForm({ ...medicalForm, chief_complaint: e.target.value })}
                  placeholder="e.g. Severe chest pain radiating to jaw for 1 hour"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Clinical Notes & Triage Findings */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Doctor's Clinical Notes, Modifications & Treatment Plan
              </label>
              <textarea
                id="input-doctor-notes"
                rows={3}
                value={medicalForm.doctor_notes}
                onChange={(e) => setMedicalForm({ ...medicalForm, doctor_notes: e.target.value })}
                placeholder="Append clinical assessment, physical findings, and recommendations..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Medications & Known Allergies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active Medications & Dosages
                </label>
                <input
                  type="text"
                  id="input-medications"
                  value={medicalForm.medications}
                  onChange={(e) => setMedicalForm({ ...medicalForm, medications: e.target.value })}
                  placeholder="e.g. Aspirin 325mg, Atorvastatin 80mg, Metoprolol 25mg"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Known Drug Sensitivities & Allergies
                </label>
                <input
                  type="text"
                  id="input-allergies"
                  value={medicalForm.allergies}
                  onChange={(e) => setMedicalForm({ ...medicalForm, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, NSAIDs, Sulfa (or None known)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold text-rose-700"
                />
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Past Medical History & Chronic Co-Morbidities
              </label>
              <input
                type="text"
                id="input-chronic-conditions"
                value={medicalForm.chronic_conditions}
                onChange={(e) => setMedicalForm({ ...medicalForm, chronic_conditions: e.target.value })}
                placeholder="e.g. Type 2 Diabetes (HbA1c 8.2), Hypertension, CAD"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Submit Modifications Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                id="btn-save-medical-modifications"
                className="px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md shadow-teal-700/20 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Medical Modifications</span>
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* SECTION 3: RECENT REFERRAL QUEUE & FACILITY METRICS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Facility Referral Activity & Tele-Triage
          </h3>
          <span className="text-xs font-bold text-teal-800">
            {myReferrals.length} Cases Transmitted
          </span>
        </div>

        {/* 4 Stat Overview Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-xs font-medium block">Total Referrals</span>
            <span className="text-xl font-black text-slate-900">{totalCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
            <span className="text-amber-800 text-xs font-semibold block">Pending Triage</span>
            <span className="text-xl font-black text-amber-900">{pendingCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs">
            <span className="text-blue-800 text-xs font-semibold block">In Treatment</span>
            <span className="text-xl font-black text-blue-900">{acceptedCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
            <span className="text-emerald-800 text-xs font-semibold block">Completed</span>
            <span className="text-xl font-black text-emerald-900">{completedCount}</span>
          </div>
        </div>

        {/* Search referrals */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search referrals by code, diagnosis, or patient..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Referral List */}
        <div className="space-y-2">
          {filteredReferrals.slice(0, 5).map((r) => {
            const patient = patients.find((p) => p.id === r.patient_id);
            const dest = facilities.find((f) => f.id === r.destination_facility_id);

            return (
              <div
                key={r.id}
                onClick={() => onNavigate('referral_detail', { referralId: r.id })}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-teal-800">{r.referral_code}</span>
                    <PriorityBadge priority={r.priority} />
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {patient ? patient.name : 'Unknown Patient'} • {r.diagnosis}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    Destination: {dest ? dest.name : 'District Center'}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
