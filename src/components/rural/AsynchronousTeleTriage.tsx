import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TeleTriageRecord,
  PriorityLevel,
  HealthcareWorkerRole,
  DiagnosticMedia,
  SyncStatus,
} from '../../types/ruralCare';
import { DEFAULT_TELE_TRIAGE_RECORDS } from '../../services/referralEngine';
import {
  Stethoscope,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Camera,
  Mic,
  FileText,
  Activity,
  User,
  MapPin,
  Clock,
  Send,
  Sparkles,
  Search,
  Filter,
  Eye,
  Trash2,
  Upload,
  Radio,
  HeartPulse,
} from 'lucide-react';

interface AsynchronousTeleTriageProps {
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
  onSelectPatient?: (patientId: string) => void;
}

export const AsynchronousTeleTriage: React.FC<AsynchronousTeleTriageProps> = ({
  onNavigate,
  onSelectPatient,
}) => {
  const { patients, isOnline } = useApp();

  // Local state for records list (initialized from defaults + local storage)
  const [records, setRecords] = useState<TeleTriageRecord[]>(() => {
    try {
      const saved = localStorage.getItem('rural_tele_triage_records');
      if (saved) {
        return JSON.parse(saved) as TeleTriageRecord[];
      }
    } catch {
      // Fallback
    }
    return DEFAULT_TELE_TRIAGE_RECORDS;
  });

  const [activeTab, setActiveTab] = useState<'queue' | 'new_triage'>('queue');
  const [selectedRecord, setSelectedRecord] = useState<TeleTriageRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Form State for New Tele-Triage
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'pat-001');
  const [customPatientName, setCustomPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(35);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState('+91 ');
  const [villageName, setVillageName] = useState('Ramachandrapuram Rural');
  const [district, setDistrict] = useState('Sangareddy');
  const [workerName, setWorkerName] = useState('Lakshmi Devi (ASHA)');
  const [workerRole, setWorkerRole] = useState<HealthcareWorkerRole>('ASHA');

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [symptomDuration, setSymptomDuration] = useState('2 days');
  const [fieldNotes, setFieldNotes] = useState('');

  // Vitals State
  const [tempF, setTempF] = useState<string>('98.6');
  const [systolicBp, setSystolicBp] = useState<string>('120');
  const [diastolicBp, setDiastolicBp] = useState<string>('80');
  const [heartRate, setHeartRate] = useState<string>('78');
  const [spo2, setSpo2] = useState<string>('98');
  const [respRate, setRespRate] = useState<string>('18');
  const [bloodGlucose, setBloodGlucose] = useState<string>('');

  // Media Attachments
  const [diagnosticMedia, setDiagnosticMedia] = useState<DiagnosticMedia[]>([]);
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'audio_note' | 'ecg_strip' | 'skin_lesion'>('photo');

  const effectiveOnline = isOnline && !isSimulatedOffline;

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Automated Priority Calculation based on clinical vitals & complaints
  const computedPriority = useMemo((): PriorityLevel => {
    const s = Number(systolicBp) || 120;
    const d = Number(diastolicBp) || 80;
    const hr = Number(heartRate) || 75;
    const o2 = Number(spo2) || 98;
    const t = Number(tempF) || 98.6;
    const bg = Number(bloodGlucose) || 100;

    // Emergency Triggers: Hypoxia, Severe Shock/Hypertensive Crisis, Tachy/Bradycardia with Chest Pain
    if (
      o2 < 90 ||
      s < 85 ||
      s > 180 ||
      d > 120 ||
      hr > 135 ||
      hr < 45 ||
      chiefComplaint.toLowerCase().includes('chest pain') ||
      chiefComplaint.toLowerCase().includes('unconscious') ||
      chiefComplaint.toLowerCase().includes('seizure') ||
      chiefComplaint.toLowerCase().includes('severe hemorrhage')
    ) {
      return 'Emergency';
    }

    // Urgent Triggers: High Pyrexia, SpO2 90-94, Tachycardia, Severe Dengue signs
    if (
      o2 <= 94 ||
      t >= 102.5 ||
      hr > 110 ||
      s < 95 ||
      bg > 300 ||
      selectedSymptoms.some((sym) =>
        ['Petechial Rash', 'Bleeding Gums', 'Severe Arthralgia', 'Dyspnea'].includes(sym)
      )
    ) {
      return 'Urgent';
    }

    // Moderate Triggers: Mild fever, cough > 2 weeks, elevated BP
    if (t >= 100.4 || s >= 140 || d >= 90 || symptomDuration.includes('week')) {
      return 'Moderate';
    }

    return 'Low';
  }, [systolicBp, diastolicBp, heartRate, spo2, tempF, bloodGlucose, chiefComplaint, selectedSymptoms, symptomDuration]);

  // Common Symptom Tags in Rural Primary Care
  const commonSymptomCatalog = [
    'High Fever (>102°F)',
    'Continuous Cough > 2 Wks',
    'Chest Tightness / Pain',
    'Shortness of Breath',
    'Severe Headache',
    'Retro-orbital Pain',
    'Joint / Muscle Pain',
    'Watery Diarrhea',
    'Vomiting',
    'Petechial Rash',
    'Abdominal Spasm',
    'Dizziness / Syncope',
    'Swelling in Legs / Edema',
  ];

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleAddCustomSymptom = () => {
    if (customSymptomInput.trim() && !selectedSymptoms.includes(customSymptomInput.trim())) {
      setSelectedSymptoms((prev) => [...prev, customSymptomInput.trim()]);
      setCustomSymptomInput('');
    }
  };

  // Add Simulated Diagnostic Media
  const handleAddMedia = () => {
    const newMedia: DiagnosticMedia = {
      id: `dm-${Date.now()}`,
      type: mediaType,
      title:
        mediaType === 'photo'
          ? 'Field Clinical Photo'
          : mediaType === 'audio_note'
          ? 'Voice Auscultation / Patient Voice Note'
          : mediaType === 'ecg_strip'
          ? 'Portable 1-Lead ECG Strip'
          : 'Skin Lesion / Rash Macro',
      url:
        mediaType === 'ecg_strip'
          ? 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=60'
          : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=60',
      caption: mediaCaption || 'Captured by field worker on mobile camera',
      fileSizeBytes: Math.floor(Math.random() * 800000) + 200000,
      capturedAt: new Date().toISOString(),
      isUploaded: effectiveOnline,
    };

    setDiagnosticMedia((prev) => [...prev, newMedia]);
    setMediaCaption('');
  };

  // Submit Triage Record (Offline-resilient)
  const handleSubmitTriage = (e: React.FormEvent) => {
    e.preventDefault();

    const currentPatient = patients.find((p) => p.id === selectedPatientId);
    const pName = customPatientName.trim() || currentPatient?.name || 'Walk-in Rural Patient';

    const syncStatus: SyncStatus = effectiveOnline ? 'Synced' : 'Pending';

    const newRecord: TeleTriageRecord = {
      id: `tt-${Date.now()}`,
      triageCode: `TRI-RUR-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: selectedPatientId || `pat-temp-${Date.now()}`,
      patientName: pName,
      patientAge: Number(patientAge) || 30,
      patientGender,
      patientPhone: patientPhone || currentPatient?.phone || '+91 90000 00000',
      patientAddress: `${villageName}, ${district} District`,
      villageName,
      subCenterOrWard: 'Sub-Center Primary Ward',
      district,
      workerId: 'hw-field-current',
      workerName,
      workerRole,
      chiefComplaint: chiefComplaint || 'Routine Health Evaluation',
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ['General Weakness'],
      symptomDuration,
      vitals: {
        temperatureF: Number(tempF) || 98.6,
        systolicBp: Number(systolicBp) || 120,
        diastolicBp: Number(diastolicBp) || 80,
        heartRateBpm: Number(heartRate) || 75,
        spo2Pct: Number(spo2) || 98,
        respiratoryRateBpm: Number(respRate) || 18,
        bloodGlucoseMgDl: bloodGlucose ? Number(bloodGlucose) : undefined,
        capturedAt: new Date().toISOString(),
      },
      priority: computedPriority,
      suspectedCondition:
        computedPriority === 'Emergency'
          ? 'Acute Unstable Emergency / Immediate Tertiary Transfer'
          : computedPriority === 'Urgent'
          ? 'Febrile / Acute Infection Under Evaluation'
          : 'Sub-acute Primary Condition',
      diagnosticMedia,
      fieldNotes,
      syncStatus,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    try {
      localStorage.setItem('rural_tele_triage_records', JSON.stringify(updated));
    } catch {
      // safe
    }

    // Reset Form
    setChiefComplaint('');
    setSelectedSymptoms([]);
    setDiagnosticMedia([]);
    setFieldNotes('');
    setActiveTab('queue');

    if (effectiveOnline) {
      showToast(`Tele-Triage #${newRecord.triageCode} transmitted to Specialist Queue.`);
    } else {
      showToast(`Saved OFFLINE in Local Cache. Will sync automatically when connected.`);
    }
  };

  // Sync Pending Records
  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const synced = records.map((r) =>
        r.syncStatus === 'Pending' || r.syncStatus === 'Offline'
          ? { ...r, syncStatus: 'Synced' as SyncStatus }
          : r
      );
      setRecords(synced);
      try {
        localStorage.setItem('rural_tele_triage_records', JSON.stringify(synced));
      } catch {
        // safe
      }
      setIsSyncing(false);
      showToast('All pending field triage records successfully synced to State Server!');
    }, 1200);
  };

  // Preset Loaders for Quick Demo
  const loadPreset = (type: 'cardiac' | 'dengue' | 'tb') => {
    if (type === 'cardiac') {
      setCustomPatientName('Govindappa (Farmer)');
      setPatientAge(52);
      setPatientGender('Male');
      setVillageName('Maddur Hamlet');
      setChiefComplaint('Crushing chest pain radiating to left shoulder with cold sweats');
      setSelectedSymptoms(['Chest Tightness / Pain', 'Shortness of Breath', 'Dizziness / Syncope']);
      setSymptomDuration('1.5 hours');
      setTempF('98.4');
      setSystolicBp('162');
      setDiastolicBp('104');
      setHeartRate('110');
      setSpo2('93');
      setRespRate('24');
      setBloodGlucose('178');
      setFieldNotes('Chewed Aspirin 300mg. Placed in semi-Fowler position. Needs emergency 108 ambulance.');
    } else if (type === 'dengue') {
      setCustomPatientName('Laxmi Bai');
      setPatientAge(24);
      setPatientGender('Female');
      setVillageName('Borabanda Tanda');
      setChiefComplaint('Intense fever for 3 days with behind-the-eye aching and red spots on legs');
      setSelectedSymptoms(['High Fever (>102°F)', 'Retro-orbital Pain', 'Joint / Muscle Pain', 'Petechial Rash']);
      setSymptomDuration('3 days');
      setTempF('103.6');
      setSystolicBp('96');
      setDiastolicBp('62');
      setHeartRate('118');
      setSpo2('97');
      setRespRate('20');
      setFieldNotes('Tourniquet test positive. Started ORS. Local dengue cluster active in ward.');
    } else {
      setCustomPatientName('Narsing Rao');
      setPatientAge(58);
      setPatientGender('Male');
      setVillageName('Ramachandrapuram');
      setChiefComplaint('Chronic productive cough with evening low fever and weight loss');
      setSelectedSymptoms(['Continuous Cough > 2 Wks', 'General Weakness']);
      setSymptomDuration('25 days');
      setTempF('99.8');
      setSystolicBp('124');
      setDiastolicBp('80');
      setHeartRate('82');
      setSpo2('96');
      setRespRate('18');
      setFieldNotes('Collecting morning sputum sample for CBNAAT cartridge.');
    }
  };

  const pendingCount = records.filter((r) => r.syncStatus === 'Pending' || r.syncStatus === 'Offline').length;

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.triageCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.villageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || rec.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="text-xs font-semibold">{notificationToast}</span>
        </div>
      )}

      {/* Top Header Card with Offline Mesh Controls */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-teal-600/40 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                Rural Field Tele-Triage & Remote Consult
              </span>

              {/* Network Status Badge */}
              <button
                onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition ${
                  effectiveOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30'
                }`}
                title="Click to toggle simulated offline field mesh mode"
              >
                {effectiveOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>Online (Satellite / 4G)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Offline (Store & Forward Mesh)</span>
                  </>
                )}
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Asynchronous Field Triage & Diagnostic Capture
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Enable ASHA, ANM, and Community Health Officers to capture structured symptoms, vital telemetry, and media in remote zero-connectivity villages for remote specialist triage.
            </p>
          </div>

          {/* Sync & Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {pendingCount > 0 && (
              <button
                onClick={handleSyncAll}
                disabled={isSyncing || !effectiveOnline}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync {pendingCount} Offline Item(s)</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab(activeTab === 'new_triage' ? 'queue' : 'new_triage')}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-2"
            >
              {activeTab === 'new_triage' ? (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Triage Queue</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Field Triage</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* NEW FIELD TRIAGE FORM */}
      {activeTab === 'new_triage' && (
        <form onSubmit={handleSubmitTriage} className="space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Quick Demo Case Selector */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Load Realistic Field Scenario:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadPreset('cardiac')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 transition"
              >
                🚨 STEMI Chest Pain (Emergency)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('dengue')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition"
              >
                🦟 Febrile Dengue Cluster (Urgent)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('tb')}
                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition"
              >
                🫁 Chronic Cough / TB Screening
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Columns: Demographics, Complaints, Symptoms */}
            <div className="lg:col-span-2 space-y-4">
              {/* Section 1: Patient & Field Worker Info */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>1. Patient & Field Health Worker Identification</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">Patient Full Name / Token</label>
                    <input
                      type="text"
                      value={customPatientName}
                      onChange={(e) => setCustomPatientName(e.target.value)}
                      placeholder="e.g. Govindappa (Farmer)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Age</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as 'Male' | 'Female' | 'Other')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Village / Hamlet</label>
                    <input
                      type="text"
                      value={villageName}
                      onChange={(e) => setVillageName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Field Worker on Duty</label>
                    <input
                      type="text"
                      value={workerName}
                      onChange={(e) => setWorkerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Chief Complaint & Symptom Tag Matrix */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>2. Clinical Complaints & Symptom Matrix</span>
                </h3>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-700">Chief Complaint (In Patient&apos;s Words)</label>
                  <textarea
                    rows={2}
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Describe main symptoms, onset, severity, and radiation..."
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
                    required
                  />
                </div>

                {/* Symptom Tag Chips */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Select Active Syndromic Indicators:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {commonSymptomCatalog.map((sym) => {
                      const isSelected = selectedSymptoms.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => toggleSymptom(sym)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-teal-700 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>{sym}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Symptom */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={customSymptomInput}
                      onChange={(e) => setCustomSymptomInput(e.target.value)}
                      placeholder="Add another symptom..."
                      className="text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSymptom}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Diagnostic Media Attachments */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>Attach Field Diagnostic Media ({diagnosticMedia.length})</span>
                    </label>
                  </div>

                  {/* Media Form */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-2.5 text-xs">
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value as 'photo' | 'audio_note' | 'ecg_strip' | 'skin_lesion')}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                    >
                      <option value="photo">Field Photo / Clinical Sign</option>
                      <option value="skin_lesion">Skin Lesion / Rash Macro</option>
                      <option value="ecg_strip">Portable ECG Strip</option>
                      <option value="audio_note">Voice Auscultation Note</option>
                    </select>

                    <input
                      type="text"
                      value={mediaCaption}
                      onChange={(e) => setMediaCaption(e.target.value)}
                      placeholder="Caption or clinical finding..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />

                    <button
                      type="button"
                      onClick={handleAddMedia}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shrink-0 transition"
                    >
                      + Attach Media
                    </button>
                  </div>

                  {/* Attached Media Previews */}
                  {diagnosticMedia.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {diagnosticMedia.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs">
                              {m.type === 'ecg_strip' ? 'ECG' : m.type === 'audio_note' ? 'VOX' : 'IMG'}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-800 truncate">{m.title}</div>
                              <div className="text-[10px] text-slate-500 truncate">{m.caption}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDiagnosticMedia(diagnosticMedia.filter((x) => x.id !== m.id))}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Vitals Telemetry & Priority Engine */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>3. Vital Telemetry & Auto-Triage</span>
                </h3>

                {/* Live Priority Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all text-white ${
                    computedPriority === 'Emergency'
                      ? 'bg-rose-950 border-rose-600'
                      : computedPriority === 'Urgent'
                      ? 'bg-amber-950 border-amber-600'
                      : computedPriority === 'Moderate'
                      ? 'bg-teal-950 border-teal-600'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20">
                      Auto-Triage Classifier
                    </span>
                    <span className="text-xs font-bold font-mono">
                      {computedPriority} Priority
                    </span>
                  </div>

                  <h4 className="text-lg font-black mt-2">
                    {computedPriority === 'Emergency'
                      ? 'Immediate Red-Flag Emergency'
                      : computedPriority === 'Urgent'
                      ? 'High Priority Referral'
                      : 'Standard Rural Consultation'}
                  </h4>

                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {computedPriority === 'Emergency'
                      ? '108 Ambulance evacuation advised. Critical vitals require immediate tertiary ICU bed reservation.'
                      : computedPriority === 'Urgent'
                      ? 'Direct doctor review required within 30 minutes. Schedule tele-specialist connection.'
                      : 'Non-emergency primary clinic management or asynchronous specialist queue.'}
                  </p>
                </div>

                {/* Vitals Inputs Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-600 text-[11px] block">Temp (°F)</label>
                    <input
                      type="text"
                      value={tempF}
                      onChange={(e) => setTempF(e.target.value)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 font-extrabold text-sm"
                    />
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-600 text-[11px] block">BP (mmHg)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={systolicBp}
                        onChange={(e) => setSystolicBp(e.target.value)}
                        placeholder="Sys"
                        className="w-1/2 bg-white px-2 py-1.5 rounded-xl border border-slate-300 font-extrabold text-xs text-center"
                      />
                      <span>/</span>
                      <input
                        type="text"
                        value={diastolicBp}
                        onChange={(e) => setDiastolicBp(e.target.value)}
                        placeholder="Dia"
                        className="w-1/2 bg-white px-2 py-1.5 rounded-xl border border-slate-300 font-extrabold text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-600 text-[11px] block">Heart Rate (bpm)</label>
                    <input
                      type="text"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 font-extrabold text-sm"
                    />
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-600 text-[11px] block">SpO2 (%)</label>
                    <input
                      type="text"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 font-extrabold text-sm"
                    />
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-600 text-[11px] block">Resp Rate (/min)</label>
                    <input
                      type="text"
                      value={respRate}
                      onChange={(e) => setRespRate(e.target.value)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 font-extrabold text-sm"
                    />
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-600 text-[11px] block">Glucose (mg/dL)</label>
                    <input
                      type="text"
                      value={bloodGlucose}
                      onChange={(e) => setBloodGlucose(e.target.value)}
                      placeholder="Optional"
                      className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 font-extrabold text-sm"
                    />
                  </div>
                </div>

                {/* Field Notes */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Immediate Field Interventions Provided</label>
                  <textarea
                    rows={2}
                    value={fieldNotes}
                    onChange={(e) => setFieldNotes(e.target.value)}
                    placeholder="e.g. Oral fluids given, tourniquet test, Sorbitrate administered..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {effectiveOnline
                      ? 'Queue Tele-Triage to Remote Specialist'
                      : 'Save Offline in Local Store & Forward'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TRIAGE QUEUE & REVIEWS */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, village, or code..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Priority:</span>
              {['all', 'emergency', 'urgent', 'moderate', 'low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition shrink-0 ${
                    priorityFilter === p
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((record) => {
              const isEmg = record.priority === 'Emergency';
              const isUrg = record.priority === 'Urgent';
              const isSynced = record.syncStatus === 'Synced';

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Code & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                          {record.triageCode}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                          {record.patientName}
                        </h4>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isEmg
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : isUrg
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-teal-100 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {record.priority}
                        </span>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isSynced ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                          }`}
                        >
                          {isSynced ? '● Synced' : '○ Local Offline'}
                        </span>
                      </div>
                    </div>

                    {/* Location & Worker */}
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{record.villageName}</span>
                      </span>
                      <span className="font-semibold text-slate-700">
                        {record.workerName} ({record.workerRole})
                      </span>
                    </div>

                    {/* Chief Complaint Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Chief Complaint</span>
                      <p className="font-medium line-clamp-2 leading-relaxed">{record.chiefComplaint}</p>
                    </div>

                    {/* Vitals Ribbon */}
                    <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-slate-100 text-[10px] text-center font-bold text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[8px]">TEMP</span>
                        <span>{record.vitals.temperatureF}°F</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px]">BP</span>
                        <span>{record.vitals.systolicBp}/{record.vitals.diastolicBp}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px]">HR</span>
                        <span>{record.vitals.heartRateBpm} bpm</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px]">SPO2</span>
                        <span className={record.vitals.spo2Pct < 94 ? 'text-rose-600' : ''}>
                          {record.vitals.spo2Pct}%
                        </span>
                      </div>
                    </div>

                    {/* Specialist Remote Review if available */}
                    {record.specialistNotes ? (
                      <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-indigo-800">
                          <span>Specialist: {record.assignedSpecialistName}</span>
                          <span className="text-emerald-700">Reviewed</span>
                        </div>
                        <p className="line-clamp-2">{record.specialistNotes}</p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5 p-2 bg-amber-50 rounded-xl">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Awaiting remote doctor evaluation</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-bold">
                    <button
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('create_referral');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 transition"
                    >
                      Escalate to Referral
                    </button>

                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {selectedRecord.triageCode}
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedRecord.patientName} ({selectedRecord.patientAge}y, {selectedRecord.patientGender})
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Location: {selectedRecord.patientAddress}
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  selectedRecord.priority === 'Emergency'
                    ? 'bg-rose-100 text-rose-800'
                    : selectedRecord.priority === 'Urgent'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {selectedRecord.priority}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Chief Complaint & Duration</span>
                <p className="font-semibold text-slate-800">{selectedRecord.chiefComplaint}</p>
                <div className="text-slate-500">Duration: {selectedRecord.symptomDuration}</div>
              </div>

              {/* Symptoms */}
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Symptoms Recorded</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecord.symptoms.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">TEMP</span>
                  <span className="font-black text-slate-800 text-sm">{selectedRecord.vitals.temperatureF} °F</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">BLOOD PRESSURE</span>
                  <span className="font-black text-slate-800 text-sm">
                    {selectedRecord.vitals.systolicBp}/{selectedRecord.vitals.diastolicBp}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">SPO2 OXYGEN</span>
                  <span className="font-black text-slate-800 text-sm">{selectedRecord.vitals.spo2Pct}%</span>
                </div>
              </div>

              {/* Diagnostic Media if any */}
              {selectedRecord.diagnosticMedia.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">
                    Diagnostic Media Attached ({selectedRecord.diagnosticMedia.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedRecord.diagnosticMedia.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                        <div className="font-bold text-slate-800">{m.title}</div>
                        <div className="text-[10px] text-slate-500">{m.caption}</div>
                        <img
                          src={m.url}
                          alt={m.title}
                          className="w-full h-24 object-cover rounded-xl mt-1 border border-slate-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
