import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PoCDiagnosticTest,
  PoCTestType,
  SampleTransportStatus,
  HealthcareWorkerRole,
  SyncStatus,
} from '../../types/ruralCare';
import { DEFAULT_POC_DIAGNOSTICS } from '../../services/referralEngine';
import {
  TestTube,
  Thermometer,
  Truck,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Snowflake,
  BarChart2,
  Calendar,
  User,
  MapPin,
  Sparkles,
  Wifi,
  WifiOff,
  Check,
  Clock,
  Share2,
} from 'lucide-react';

interface PoCDiagnosticsLogProps {
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
  patientFilterId?: string;
}

export const PoCDiagnosticsLog: React.FC<PoCDiagnosticsLogProps> = ({
  onNavigate,
  patientFilterId,
}) => {
  const { patients, isOnline } = useApp();

  const [tests, setTests] = useState<PoCDiagnosticTest[]>(() => {
    try {
      const saved = localStorage.getItem('rural_poc_diagnostic_tests');
      if (saved) {
        return JSON.parse(saved) as PoCDiagnosticTest[];
      }
    } catch {
      // safe
    }
    return DEFAULT_POC_DIAGNOSTICS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [patientName, setPatientName] = useState('Govindappa');
  const [patientAge, setPatientAge] = useState(48);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [villageName, setVillageName] = useState('Ramachandrapuram Rural');
  const [testType, setTestType] = useState<PoCTestType>('Dengue NS1 / IgM Rapid');
  const [kitManufacturer, setKitManufacturer] = useState('SD Biosensor Standard Q');
  const [kitBatchNumber, setKitBatchNumber] = useState('BATCH-2026-99X');
  const [testResult, setTestResult] = useState<'Positive' | 'Negative' | 'Inconclusive' | 'Elevated' | 'Critical'>('Positive');
  const [quantitativeVal, setQuantitativeVal] = useState('NS1 Ag Positive (+)');
  const [workerName, setWorkerName] = useState('Lakshmi Devi (ASHA)');
  const [workerRole, setWorkerRole] = useState<HealthcareWorkerRole>('ASHA');
  const [sampleTransport, setSampleTransport] = useState<SampleTransportStatus>('In Cold Chain Transport');
  const [coldTemp, setColdTemp] = useState('4.5');
  const [clinicalNote, setClinicalNote] = useState('Confirmed early dengue fever. Platelet count triage needed.');

  const effectiveOnline = isOnline && !isSimulatedOffline;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics Calculation
  const stats = useMemo(() => {
    const total = tests.length;
    const positive = tests.filter(
      (t) => t.result === 'Positive' || t.result === 'Elevated' || t.result === 'Critical'
    ).length;
    const coldChainInTransit = tests.filter(
      (t) => t.sampleTransportStatus === 'In Cold Chain Transport'
    ).length;
    const pendingSync = tests.filter((t) => t.syncStatus === 'Pending' || t.syncStatus === 'Offline').length;

    const positivityRate = total > 0 ? Math.round((positive / total) * 100) : 0;

    return { total, positive, coldChainInTransit, pendingSync, positivityRate };
  }, [tests]);

  // Handle Add New PoC Test
  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();

    const isStatutory =
      testResult === 'Positive' &&
      (testType.includes('Dengue') ||
        testType.includes('Cholera') ||
        testType.includes('Malaria') ||
        testType.includes('COVID'));

    const newTest: PoCDiagnosticTest = {
      id: `poc-${Date.now()}`,
      testCode: `POC-${testType.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: `pat-${Date.now()}`,
      patientName,
      patientAge: Number(patientAge) || 30,
      patientGender,
      villageName,
      testType,
      kitManufacturer,
      kitBatchNumber,
      expiryDate: '2027-12-31',
      result: testResult,
      quantitativeValue: quantitativeVal || undefined,
      conductedByWorker: workerName,
      workerRole,
      facilityOrVillage: `${villageName} Health Sub-Center`,
      conductedAt: new Date().toISOString(),
      sampleTransportStatus: sampleTransport,
      coldChainTempCelsius: sampleTransport.includes('Cold Chain') ? Number(coldTemp) || 4.0 : undefined,
      coldChainTargetMinCelsius: 2,
      coldChainTargetMaxCelsius: 8,
      syncStatus: effectiveOnline ? 'Synced' : 'Pending',
      clinicalImplication: clinicalNote || 'Test recorded in field log.',
      statutoryFlagged: isStatutory,
    };

    const updated = [newTest, ...tests];
    setTests(updated);
    try {
      localStorage.setItem('rural_poc_diagnostic_tests', JSON.stringify(updated));
    } catch {
      // safe
    }

    setShowAddModal(false);
    showToast(`PoC Test #${newTest.testCode} saved (${newTest.syncStatus})`);
  };

  // Sync handler
  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const synced = tests.map((t) => ({ ...t, syncStatus: 'Synced' as SyncStatus }));
      setTests(synced);
      try {
        localStorage.setItem('rural_poc_diagnostic_tests', JSON.stringify(synced));
      } catch {
        // safe
      }
      setIsSyncing(false);
      showToast('PoC Diagnostics successfully synchronized with District Laboratory Server.');
    }, 1200);
  };

  const filteredTests = tests.filter((t) => {
    if (patientFilterId && t.patientId !== patientFilterId) return false;

    const matchesSearch =
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.testCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.villageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.testType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = testTypeFilter === 'all' || t.testType.includes(testTypeFilter);
    const matchesResult =
      resultFilter === 'all' ||
      (resultFilter === 'positive' &&
        (t.result === 'Positive' || t.result === 'Elevated' || t.result === 'Critical')) ||
      (resultFilter === 'negative' && t.result === 'Negative') ||
      (resultFilter === 'in_transit' && t.sampleTransportStatus === 'In Cold Chain Transport');

    return matchesSearch && matchesType && matchesResult;
  });

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border border-teal-600/40 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                <TestTube className="w-3.5 h-3.5" />
                Field Rapid Diagnostic Testing (RDT)
              </span>

              <button
                onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition ${
                  effectiveOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30 animate-pulse'
                }`}
              >
                {effectiveOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>Live Lab Server</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    <span>Offline Cache</span>
                  </>
                )}
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Point-of-Care Diagnostics & Cold-Chain Tracker
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Track rapid test results for malaria, dengue, blood glucose, and hemoglobin in field camps. Monitor cold chain temperatures for sample transport to district laboratories.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {stats.pendingSync > 0 && (
              <button
                onClick={handleSyncAll}
                disabled={isSyncing || !effectiveOnline}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync {stats.pendingSync} Tests</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record Rapid Kit Result</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Field Tests</span>
            <span className="text-xl font-black text-white">{stats.total}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">Positivity Rate</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-amber-400">{stats.positivityRate}%</span>
              <span className="text-[10px] text-slate-400">({stats.positive} positive)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-cyan-300 font-bold uppercase block flex items-center gap-1">
              <Snowflake className="w-3 h-3 text-cyan-400" />
              Cold Chain In Transit
            </span>
            <span className="text-xl font-black text-cyan-400">{stats.coldChainInTransit} batches</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Sync Status</span>
            <span className="text-sm font-black text-emerald-400">
              {stats.pendingSync === 0 ? 'All Synced (100%)' : `${stats.pendingSync} Queued`}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, village, or batch code..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Filter:</span>
          {['all', 'positive', 'negative', 'in_transit'].map((r) => (
            <button
              key={r}
              onClick={() => setResultFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition shrink-0 ${
                resultFilter === r
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Test Log Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((t) => {
          const isPos = t.result === 'Positive' || t.result === 'Elevated' || t.result === 'Critical';
          const isInTransit = t.sampleTransportStatus === 'In Cold Chain Transport';

          return (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3.5"
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                      {t.testCode}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{t.patientName}</h4>
                    <span className="text-xs text-slate-500">
                      {t.patientAge}y, {t.patientGender} • {t.villageName}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isPos
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {t.result}
                    </span>

                    {t.statutoryFlagged && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5 text-amber-700" />
                        Statutory Alert
                      </span>
                    )}
                  </div>
                </div>

                {/* Test Kit Details */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span className="text-teal-900">{t.testType}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Lot: {t.kitBatchNumber}</span>
                  </div>
                  {t.quantitativeValue && (
                    <div className="text-xs font-black text-slate-900 bg-white p-2 rounded-xl border border-slate-200">
                      Value: {t.quantitativeValue}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-600 italic">{t.clinicalImplication}</p>
                </div>

                {/* Cold Chain Tracker Badge */}
                {isInTransit && t.coldChainTempCelsius !== undefined && (
                  <div className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs flex items-center justify-between text-cyan-950 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Snowflake className="w-4 h-4 text-cyan-600 animate-spin" />
                      <span>Cold Chain Active</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white text-cyan-800 font-bold border border-cyan-200 text-[11px]">
                      {t.coldChainTempCelsius} °C (Target 2-8°C)
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span className="text-[10px] text-slate-400">
                  By {t.conductedByWorker} ({t.workerRole})
                </span>
                <span className={t.syncStatus === 'Synced' ? 'text-emerald-700' : 'text-amber-600'}>
                  {t.syncStatus === 'Synced' ? '● Synced' : '○ Local Queue'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record New PoC Test Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-black text-slate-900">Record Point-of-Care Diagnostic Test</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Village / Hamlet</label>
                  <input
                    type="text"
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Select Test Type</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value as PoCTestType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="Dengue NS1 / IgM Rapid">Dengue NS1 / IgM Rapid</option>
                  <option value="Malaria Rapid Antigen (Pf/Pv)">Malaria Rapid Antigen (Pf/Pv)</option>
                  <option value="Random Blood Glucose (RBG)">Random Blood Glucose (RBG)</option>
                  <option value="Hemoglobin (Hb) Meter">Hemoglobin (Hb) Meter</option>
                  <option value="Vibrio Cholerae RDT">Vibrio Cholerae RDT</option>
                  <option value="Typhoid IgM/IgG Card">Typhoid IgM/IgG Card</option>
                  <option value="COVID-19 Ag Rapid">COVID-19 Ag Rapid</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Test Result</label>
                  <select
                    value={testResult}
                    onChange={(e) => setTestResult(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    <option value="Positive">Positive / Reactive</option>
                    <option value="Negative">Negative / Non-Reactive</option>
                    <option value="Elevated">Elevated / High</option>
                    <option value="Critical">Critical Alert</option>
                    <option value="Inconclusive">Inconclusive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Quantitative Reading</label>
                  <input
                    type="text"
                    value={quantitativeVal}
                    onChange={(e) => setQuantitativeVal(e.target.value)}
                    placeholder="e.g. 182 mg/dL or NS1 (+)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Sample Cold-Chain State</label>
                <select
                  value={sampleTransport}
                  onChange={(e) => setSampleTransport(e.target.value as SampleTransportStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  <option value="Not Applicable">Not Applicable (Field Kit Only)</option>
                  <option value="In Cold Chain Transport">In Cold Chain Transport (District Lab Dispatch)</option>
                  <option value="Sample Collected">Sample Collected (Awaiting Pickup)</option>
                </select>
              </div>

              {sampleTransport === 'In Cold Chain Transport' && (
                <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 space-y-1">
                  <label className="font-bold text-cyan-900 text-xs">Current Vaccine Carrier Temp (°C)</label>
                  <input
                    type="text"
                    value={coldTemp}
                    onChange={(e) => setColdTemp(e.target.value)}
                    placeholder="4.0"
                    className="w-full px-3 py-1.5 rounded-xl border border-cyan-300 bg-white font-bold text-cyan-900"
                  />
                  <span className="text-[10px] text-cyan-700">Safe Range: 2.0°C to 8.0°C</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Clinical Finding & Implication</label>
                <textarea
                  rows={2}
                  value={clinicalNote}
                  onChange={(e) => setClinicalNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold shadow-md"
                >
                  Save Result Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
