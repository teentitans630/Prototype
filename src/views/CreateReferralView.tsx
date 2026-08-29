import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { matchFacilities } from '../lib/matchFacilities';
import {
  Facility,
  FacilityMatchScore,
  Patient,
  ReferralPriority,
} from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  ArrowLeft,
  Search,
  Sparkles,
  Stethoscope,
  Clock,
  MapPin,
  Bed,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  HeartPulse,
  Thermometer,
  Activity,
  Droplet,
  ChevronRight,
  ShieldCheck,
  Check,
  FileCheck,
  Building2,
  Info,
  QrCode,
} from 'lucide-react';

interface CreateReferralViewProps {
  preselectedPatientId?: string;
  prefillRaviKumar?: boolean;
  excludedFacilityIds?: string[];
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const CreateReferralView: React.FC<CreateReferralViewProps> = ({
  preselectedPatientId,
  prefillRaviKumar,
  excludedFacilityIds = [],
  onNavigate,
}) => {
  const {
    patients,
    facilities,
    facilityServices,
    currentUser,
    createReferral,
    setActivePatientId,
    switchDemoUser,
  } = useApp();

  // Multi-step flow: 'form' -> 'matching' -> 'confirm' -> 'success'
  const [step, setStep] = useState<'form' | 'matching' | 'confirm' | 'success'>('form');

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>(preselectedPatientId || '');
  const [patientSearch, setPatientSearch] = useState('');
  
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [duration, setDuration] = useState('');
  const [relevantHistory, setRelevantHistory] = useState('');
  const [currentTreatment, setCurrentTreatment] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  // Vitals
  const [temperature, setTemperature] = useState('98.6 °F');
  const [bloodPressure, setBloodPressure] = useState('120/80 mmHg');
  const [heartRate, setHeartRate] = useState('78 bpm');
  const [spo2, setSpo2] = useState('98%');

  const [priority, setPriority] = useState<ReferralPriority>('urgent');

  // Matching State
  const [matchResults, setMatchResults] = useState<FacilityMatchScore[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [createdReferralCode, setCreatedReferralCode] = useState<string>('');
  const [createdReferralId, setCreatedReferralId] = useState<string>('');
  const [validationError, setValidationError] = useState('');

  // Handle Ravi Kumar or preselected patient
  useEffect(() => {
    if (prefillRaviKumar) {
      const ravi = patients.find((p) => p.name.includes('Ravi Kumar') || p.patient_code === 'PAT-000245') || patients[0];
      if (ravi) {
        setSelectedPatientId(ravi.id);
        setChiefComplaint('Severe retrosternal chest pain radiating to left jaw & diaphoresis');
        setSymptoms('Heavy chest tightness, dyspnea on minimal exertion, nausea, sweating');
        setDiagnosis('Acute Coronary Syndrome / Suspected Anterior Wall STEMI');
        setDuration('2.5 hours');
        setRelevantHistory('Type 2 Diabetes (6 yrs), Hypertension on medication');
        setCurrentTreatment('Aspirin 325mg stat, Clopidogrel 300mg stat, Sublingual Nitroglycerin given');
        setDoctorNotes('ECG shows 2mm ST-elevation in V2-V4. Urgent cath lab transfer and coronary intervention recommended.');
        setTemperature('98.4 °F');
        setBloodPressure('148/92 mmHg');
        setHeartRate('96 bpm');
        setSpo2('95%');
        setPriority('urgent');
      }
    } else if (preselectedPatientId) {
      setSelectedPatientId(preselectedPatientId);
    }
  }, [prefillRaviKumar, preselectedPatientId, patients]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const sourceFacility = facilities.find((f) => f.id === currentUser?.facility_id) || facilities[0];

  // Run 40/20/20/20 Facility Matching
  const handleFindFacilities = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setValidationError('Please select or search for a patient first');
      return;
    }
    if (!chiefComplaint.trim()) {
      setValidationError('Chief complaint is required');
      return;
    }
    if (!diagnosis.trim()) {
      setValidationError('Preliminary diagnosis is required');
      return;
    }

    setValidationError('');

    const scored = matchFacilities({
      sourceFacility,
      allFacilities: facilities,
      allFacilityServices: facilityServices,
      diagnosis,
      chiefComplaint,
      symptoms,
      priority,
      excludedFacilityIds,
    });

    setMatchResults(scored);
    setStep('matching');
  };

  const handleSelectFacility = (facMatch: FacilityMatchScore) => {
    setSelectedFacility(facMatch.facility);
    setStep('confirm');
  };

  const handleConfirmSendReferral = () => {
    if (!selectedPatient || !selectedFacility) return;

    const newRef = createReferral({
      patient_id: selectedPatient.id,
      destination_facility_id: selectedFacility.id,
      chief_complaint: chiefComplaint,
      symptoms,
      diagnosis,
      duration,
      relevant_history: relevantHistory,
      current_treatment: currentTreatment,
      doctor_notes: doctorNotes,
      temperature,
      blood_pressure: bloodPressure,
      heart_rate: heartRate,
      spo2,
      priority,
    });

    setCreatedReferralCode(newRef.referral_code);
    setCreatedReferralId(newRef.id);
    setStep('success');
  };

  // Filter patient search
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.patient_code.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch)
  );

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (step === 'matching') setStep('form');
              else if (step === 'confirm') setStep('matching');
              else onNavigate('phc_dashboard');
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-none">
              {step === 'form' && 'Create Clinical Referral'}
              {step === 'matching' && 'Smart Facility Recommendation'}
              {step === 'confirm' && 'Confirm Referral Summary'}
              {step === 'success' && 'Referral Transmitted'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'form' && 'Step 1 of 3: Patient & Clinical Triage'}
              {step === 'matching' && 'Step 2 of 3: Multi-factor 40/20/20/20 algorithm'}
              {step === 'confirm' && 'Step 3 of 3: Review & Transmit'}
              {step === 'success' && 'Transmitted to receiving hospital triage desk'}
            </p>
          </div>
        </div>

        {step === 'form' && (
          <button
            type="button"
            onClick={() => {
              const ravi = patients.find((p) => p.name.includes('Ravi Kumar') || p.patient_code === 'PAT-000245') || patients[0];
              if (ravi) {
                setSelectedPatientId(ravi.id);
                setChiefComplaint('Severe retrosternal chest pain radiating to left jaw & diaphoresis');
                setSymptoms('Heavy chest tightness, dyspnea on minimal exertion, nausea, sweating');
                setDiagnosis('Acute Coronary Syndrome / Suspected Anterior Wall STEMI');
                setDuration('2.5 hours');
                setRelevantHistory('Type 2 Diabetes (6 yrs), Hypertension on medication');
                setCurrentTreatment('Aspirin 325mg stat, Clopidogrel 300mg stat, Sublingual Nitroglycerin given');
                setDoctorNotes('ECG shows 2mm ST-elevation in V2-V4. Urgent cath lab transfer and coronary intervention recommended.');
                setTemperature('98.4 °F');
                setBloodPressure('148/92 mmHg');
                setHeartRate('96 bpm');
                setSpo2('95%');
                setPriority('urgent');
              }
            }}
            className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Load Demo Case</span>
          </button>
        )}
      </div>

      {validationError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: REFERRAL FORM */}
      {/* ========================================================================= */}
      {step === 'form' && (
        <form onSubmit={handleFindFacilities} className="space-y-4">
          {/* Patient Selector */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Patient *
            </label>

            {selectedPatient ? (
              <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {selectedPatient.name}
                      </h4>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-200 text-teal-900">
                        {selectedPatient.patient_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {selectedPatient.gender} • {selectedPatient.phone} • Blood: {selectedPatient.blood_group || 'N/A'}
                    </p>
                    {selectedPatient.medical_history && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">Hx:</span> {selectedPatient.medical_history}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPatientId('')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search patient by name, PAT code, phone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 rounded-2xl p-1 bg-slate-50">
                  {filteredPatients.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No patients match search.
                    </div>
                  ) : (
                    filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPatientId(p.id);
                          if (p.medical_history) setRelevantHistory(p.medical_history);
                        }}
                        className="p-2.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 cursor-pointer flex items-center justify-between transition"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{p.name}</span>
                            <span className="font-mono text-[10px] text-slate-500">
                              ({p.patient_code})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {p.gender} • {p.phone}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-teal-700">Select</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => onNavigate('new_patient')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    + Register New Patient Instead
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Findings & Diagnosis */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Clinical Triage & Diagnosis
            </label>

            {/* Chief Complaint */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chief Complaint *
              </label>
              <input
                type="text"
                required
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Severe chest pain radiating to left arm"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Symptoms & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associated Symptoms
                </label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Diaphoresis, shortness of breath, nausea"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration / Onset
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2 hours, acute onset"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Preliminary Diagnosis */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preliminary Diagnosis / Clinical Impression *
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Coronary Syndrome (Suspected NSTEMI)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Used for automated specialty matching (Cardiology, Orthopedics, Neurology, etc.)
              </p>
            </div>

            {/* Treatment given & Medical history */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Treatment Administered at PHC
                </label>
                <textarea
                  rows={2}
                  value={currentTreatment}
                  onChange={(e) => setCurrentTreatment(e.target.value)}
                  placeholder="e.g. Aspirin 300mg stat, Sorbitrate 5mg sublingual..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relevant History & Comorbidities
                </label>
                <textarea
                  rows={2}
                  value={relevantHistory}
                  onChange={(e) => setRelevantHistory(e.target.value)}
                  placeholder="e.g. Diabetic 6 yrs, Hypertensive, non-smoker..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Doctor's Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor's Clinical Notes / Specific Requests
              </label>
              <textarea
                rows={2}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="e.g. ECG shows ST depression. Immediate cath lab and cardiologist review requested."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Vitals */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Patient Vitals
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-rose-500" />
                  Temperature
                </label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="98.6 °F"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-red-500" />
                  Blood Pressure
                </label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="120/80 mmHg"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-500" />
                  Heart Rate
                </label>
                <input
                  type="text"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="76 bpm"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-teal-500" />
                  SpO2 Level
                </label>
                <input
                  type="text"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  placeholder="98%"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              4. Referral Priority *
            </label>

            <div className="grid grid-cols-3 gap-2">
              {/* Emergency */}
              <button
                type="button"
                onClick={() => setPriority('emergency')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 min-h-[56px] ${
                  priority === 'emergency'
                    ? 'bg-rose-100 border-rose-400 text-rose-900 ring-2 ring-rose-500 font-extrabold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs uppercase tracking-wider font-bold text-rose-700">
                  Emergency
                </span>
                <span className="text-[10px] text-rose-600 leading-tight">
                  Life-threat / Immediate
                </span>
              </button>

              {/* Urgent */}
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 min-h-[56px] ${
                  priority === 'urgent'
                    ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-500 font-extrabold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs uppercase tracking-wider font-bold text-amber-700">
                  Urgent
                </span>
                <span className="text-[10px] text-amber-600 leading-tight">
                  Within 24 Hours
                </span>
              </button>

              {/* Routine */}
              <button
                type="button"
                onClick={() => setPriority('routine')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 min-h-[56px] ${
                  priority === 'routine'
                    ? 'bg-blue-100 border-blue-400 text-blue-900 ring-2 ring-blue-500 font-extrabold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs uppercase tracking-wider font-bold text-blue-700">
                  Routine
                </span>
                <span className="text-[10px] text-blue-600 leading-tight">
                  Elective / OPD
                </span>
              </button>
            </div>
          </div>

          {/* Submit -> Find Suitable Facilities */}
          <div className="pt-2">
            <button
              id="btn-find-suitable-facilities"
              type="submit"
              className="w-full py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-teal-700/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Find Suitable Facilities</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: MATCHING & RECOMMENDATIONS */}
      {/* ========================================================================= */}
      {step === 'matching' && (
        <div className="space-y-4">
          {/* Header pill with inferred specialty */}
          <div className="p-3.5 rounded-2xl bg-teal-900 text-white flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-teal-300">
                Algorithm Scored Match Results
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                Inferred Specialty: <span className="text-teal-200 font-extrabold">{matchResults[0]?.inferredSpecialty || 'General Medicine'}</span>
              </div>
            </div>
            <span className="text-xs bg-teal-800 px-2.5 py-1 rounded-full text-teal-100 font-semibold">
              Weights: 40/20/20/20
            </span>
          </div>

          {/* Scored Facility Recommendation Cards */}
          <div className="space-y-3">
            {matchResults.map((match, idx) => {
              const isTop = idx === 0;

              return (
                <div
                  key={match.facility.id}
                  className={`bg-white rounded-3xl p-5 border transition shadow-sm space-y-3.5 relative overflow-hidden ${
                    isTop
                      ? 'border-teal-500 ring-2 ring-teal-500/25'
                      : 'border-slate-200'
                  }`}
                >
                  {isTop && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-600 to-teal-700 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Best Match</span>
                    </div>
                  )}

                  {/* Facility Name & Score Header */}
                  <div className="flex items-start justify-between gap-3 pr-16">
                    <div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {match.facility.type}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {match.facility.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {match.distanceKm} km away
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          ~{match.estimatedWaitMinutes} min wait
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Match Score Bar & Breakdown */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        Match Score: <span className="text-teal-700 font-extrabold text-sm">{match.totalScore}%</span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Load: {match.loadPercentage}% ({match.loadCategory})
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          match.totalScore >= 80
                            ? 'bg-teal-600'
                            : match.totalScore >= 60
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${match.totalScore}%` }}
                      />
                    </div>

                    {/* Weight Breakdown Subtext */}
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500 pt-1 text-center">
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="block text-slate-400">Specialty</span>
                        <strong className="text-slate-800">{match.specialtyScore}/40</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="block text-slate-400">Distance</span>
                        <strong className="text-slate-800">{match.distanceScore}/20</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="block text-slate-400">Capacity</span>
                        <strong className="text-slate-800">{match.capacityScore}/20</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="block text-slate-400">Urgency</span>
                        <strong className="text-slate-800">{match.urgencyScore}/20</strong>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Reasons Checklist */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Recommendation Factors
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {match.reasons.map((reason, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-center gap-1.5 text-xs text-slate-700 bg-teal-50/50 px-2 py-1 rounded-lg border border-teal-100/50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="font-medium text-[11px] truncate">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    id={`btn-select-facility-${match.facility.id}`}
                    onClick={() => handleSelectFacility(match)}
                    className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                      isTop
                        ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-700/20'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    <span>Select {match.facility.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Legal / Clinical Disclaimer */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 text-xs flex items-center gap-2 text-center justify-center">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="italic font-medium">
              Recommendation only — not a clinical decision. The referring medical officer retains final clinical authority.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CONFIRMATION SUMMARY */}
      {/* ========================================================================= */}
      {step === 'confirm' && selectedPatient && selectedFacility && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Summary Review
              </span>
              <PriorityBadge priority={priority} size="md" />
            </div>

            {/* Patient & Facility Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Patient</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedPatient.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedPatient.patient_code} • {selectedPatient.gender} • {selectedPatient.phone}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200">
                <span className="text-[10px] font-bold text-teal-700 uppercase">Destination Facility</span>
                <h4 className="text-sm font-bold text-teal-950 mt-0.5">
                  {selectedFacility.name}
                </h4>
                <p className="text-xs text-teal-700">
                  {selectedFacility.type} • {selectedFacility.contact}
                </p>
              </div>
            </div>

            {/* Clinical Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">Diagnosis:</span>{' '}
                <span className="text-slate-900 font-semibold">{diagnosis}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">Chief Complaint:</span>{' '}
                <span className="text-slate-800">{chiefComplaint}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">Vitals Recorded:</span>{' '}
                <span className="text-slate-800">
                  BP: {bloodPressure} | HR: {heartRate} | SpO2: {spo2} | Temp: {temperature}
                </span>
              </div>

              {doctorNotes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700">Doctor's Notes:</span>{' '}
                  <span className="text-slate-800">{doctorNotes}</span>
                </div>
              )}
            </div>

            {/* Referring Doctor Info */}
            <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
              <span>Referring Officer: <strong>{currentUser?.name}</strong></span>
              <span>Source: <strong>{sourceFacility.name}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('matching')}
              className="flex-1 py-3.5 rounded-2xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-100 transition"
            >
              Back to Matches
            </button>

            <button
              id="btn-confirm-send-referral"
              onClick={handleConfirmSendReferral}
              className="flex-1 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md shadow-teal-700/20 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Referral</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: SUCCESS CONFIRMATION */}
      {/* ========================================================================= */}
      {step === 'success' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase">
              Referral Dispatched
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
              Transmitted to Receiving Hospital
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              The destination hospital triage desk has received this case in their incoming queue.
            </p>
          </div>

          {/* Referral Code Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-xs mx-auto space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Generated Referral Code
            </span>
            <div className="font-mono text-xl font-extrabold text-teal-900">
              {createdReferralCode}
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Destination: {selectedFacility?.name}
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-col gap-2.5 max-w-sm mx-auto pt-2">
            <button
              id="btn-view-as-patient"
              onClick={() => {
                if (selectedPatient) {
                  setActivePatientId(selectedPatient.id);
                  switchDemoUser('patient', selectedPatient.id);
                }
                onNavigate('patient_dashboard');
              }}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4" />
              <span>Switch to Patient View (Live QR Pass)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('referral_detail', { id: createdReferralId })}
                className="py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition"
              >
                Referral Details
              </button>

              <button
                onClick={() => onNavigate('phc_dashboard')}
                className="py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
