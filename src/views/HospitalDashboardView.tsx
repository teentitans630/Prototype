import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { PatientScanner } from '../components/PatientScanner';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Search,
  ChevronRight,
  User,
  Bed,
  Layers,
  Inbox,
  UserPlus,
  Package,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  Pill,
  Syringe,
  Filter,
  Check,
  QrCode,
  ArrowRight,
} from 'lucide-react';

interface HospitalDashboardViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const HospitalDashboardView: React.FC<HospitalDashboardViewProps> = ({
  onNavigate,
}) => {
  const {
    currentUser,
    referrals,
    patients,
    facilities,
    inventory,
    updateInventoryStock,
    acceptReferral,
    advanceReferralStatus,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');
  const [restockNotice, setRestockNotice] = useState<string>('');

  // Hospital Desk QR Scanner State
  const [scannerMode, setScannerMode] = useState<'code' | 'camera'>('code');
  const [inputPassCode, setInputPassCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedReferral, setScannedReferral] = useState<any>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Audio confirmation chime
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

  // Scope to hospital facility
  const myFacilityId = currentUser?.facility_id || 'fac-dh-02';
  const myFacility = facilities.find((f) => f.id === myFacilityId);
  const hospitalReferrals = referrals.filter(
    (r) => r.destination_facility_id === myFacilityId || currentUser?.role === 'admin'
  );

  // Search referral by scanned pass or entered code
  const handleLookupPass = (codeQuery?: string) => {
    setScanMessage(null);
    const query = (codeQuery !== undefined ? codeQuery : inputPassCode).trim().toLowerCase();
    if (!query) {
      setScanMessage({ type: 'error', text: 'Please enter a Referral Code (REF-...) or Patient Code (PAT-...)' });
      return;
    }

    const foundRef = referrals.find(
      (r) =>
        r.referral_code.toLowerCase() === query ||
        r.patient?.patient_code.toLowerCase() === query ||
        r.patient_id.toLowerCase() === query
    );

    if (foundRef) {
      playScanBeep();
      setScannedReferral(foundRef);
      setScanMessage({
        type: 'success',
        text: `Pass verified for ${foundRef.patient?.name || 'Patient'} (${foundRef.referral_code})`,
      });
    } else {
      setScannedReferral(null);
      setScanMessage({
        type: 'error',
        text: `No matching active referral found for "${query}".`,
      });
    }
  };

  const handleSimulateHospitalScan = (ref: any) => {
    setIsScanning(true);
    setTimeout(() => {
      playScanBeep();
      setIsScanning(false);
      setScannedReferral(ref);
      setInputPassCode(ref.referral_code);
      setScanMessage({
        type: 'success',
        text: `QR Pass scanned successfully for ${ref.patient?.name || 'Patient'}`,
      });
      setScannerMode('code');
    }, 700);
  };

  // Monitoring Metrics calculations
  const totalPatientsCount = patients.length;
  const pendingCount = hospitalReferrals.filter((r) => r.status === 'pending').length;
  const activeCasesCount = hospitalReferrals.filter(
    (r) => r.status === 'accepted' || r.status === 'patient_arrived' || r.status === 'under_treatment'
  ).length;
  const emergencyCasesCount = hospitalReferrals.filter(
    (r) => r.priority === 'emergency' && r.status !== 'completed' && r.status !== 'rejected'
  ).length;
  const completedCount = hospitalReferrals.filter((r) => r.status === 'completed').length;

  // Inventory Metrics
  const lowStockItems = inventory.filter(
    (i) => i.status === 'Low Stock' || i.status === 'Critical' || i.status === 'Out of Stock'
  );

  const filteredInventory = inventory.filter((item) => {
    if (inventoryCategoryFilter === 'all') return true;
    return item.category === inventoryCategoryFilter;
  });

  const filteredReferrals = hospitalReferrals
    .filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      const patient = patients.find((p) => p.id === r.patient_id);
      const source = facilities.find((f) => f.id === r.source_facility_id);
      const query = searchTerm.toLowerCase();
      return (
        r.referral_code.toLowerCase().includes(query) ||
        (patient && patient.name.toLowerCase().includes(query)) ||
        (source && source.name.toLowerCase().includes(query)) ||
        r.diagnosis.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Pending first, then by priority, then date
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleQuickRestock = (itemId: string, itemName: string, amount: number) => {
    const current = inventory.find((i) => i.id === itemId)?.current_stock || 0;
    updateInventoryStock(itemId, current + amount);
    setRestockNotice(`Restocked ${itemName} (+${amount})`);
    setTimeout(() => setRestockNotice(''), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Hospital Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-3xl p-5 text-white shadow-xl shadow-blue-950/20 border border-blue-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-3 h-3" />
              <span>Hospital Triage & Command Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {myFacility?.name || 'District Hospital Desk'}
            </h2>
            <p className="text-xs text-blue-200 mt-0.5 flex items-center gap-2">
              <Bed className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                Occupancy: {myFacility?.current_load} / {myFacility?.capacity} beds (
                {Math.round(((myFacility?.current_load || 0) / (myFacility?.capacity || 1)) * 100)}%)
              </span>
            </p>
          </div>

          {/* Hospital Authorized Action: Patient Registration */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-hospital-register-patient"
              onClick={() => onNavigate('new_patient')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4 text-slate-950 shrink-0" />
              <span>+ Register New Patient</span>
            </button>
          </div>
        </div>

        {/* Priority alert if pending referrals exist */}
        {pendingCount > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-between text-xs text-amber-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>
                <strong>{pendingCount} Pending Triage Referral{pendingCount > 1 ? 's' : ''}</strong> awaiting desk authorization
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-lg transition"
            >
              Review Pending
            </button>
          </div>
        )}
      </div>

      {/* SECTION: HOSPITAL TRIAGE QR SCANNER & INSTANT CHECK-IN */}
      <PatientScanner
        mode="hospital_referral_checkin"
        referrals={hospitalReferrals}
        patients={patients}
        onPatientScanned={(code) => {
          handleLookupPass(code);
        }}
        title="Hospital Triage QR Scanner & Check-In Desk"
        subtitle="Scan patient digital QR pass or enter referral code for instant arrival verification & admission"
      />

        {/* Scan / Lookup Notification Alert */}
        {scanMessage && (
          <div
            className={`mt-3 p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              scanMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {scanMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{scanMessage.text}</span>
          </div>
        )}

        {/* Verified Referral Card with Quick Actions */}
        {scannedReferral && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50/50 border-2 border-blue-300 shadow-sm animate-in fade-in-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs font-extrabold text-blue-900 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                    {scannedReferral.referral_code}
                  </span>
                  <PriorityBadge priority={scannedReferral.priority} />
                  <StatusBadge status={scannedReferral.status} />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  {scannedReferral.patient?.name} • {scannedReferral.diagnosis}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Age: {scannedReferral.patient?.age}y ({scannedReferral.patient?.gender}) • Phone: {scannedReferral.patient?.phone} • BP: {scannedReferral.blood_pressure || '120/80'} • SpO2: {scannedReferral.spo2 || '98%'}
                </p>
              </div>

              {/* Instant Check-in / Admission Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {scannedReferral.status === 'pending' && (
                  <button
                    type="button"
                    id="btn-scan-accept"
                    onClick={() => {
                      acceptReferral(scannedReferral.id, 'Pass scanned & accepted at Hospital Triage Desk.');
                      handleLookupPass(scannedReferral.referral_code);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    Accept Referral
                  </button>
                )}

                {scannedReferral.status !== 'patient_arrived' && scannedReferral.status !== 'under_treatment' && scannedReferral.status !== 'completed' && (
                  <button
                    type="button"
                    id="btn-scan-checkin"
                    onClick={() => {
                      advanceReferralStatus(scannedReferral.id, 'patient_arrived', 'Patient scanned at hospital entrance & verified arrival.');
                      handleLookupPass(scannedReferral.referral_code);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    Confirm Arrival
                  </button>
                )}

                {scannedReferral.status !== 'under_treatment' && scannedReferral.status !== 'completed' && (
                  <button
                    type="button"
                    id="btn-scan-admit"
                    onClick={() => {
                      advanceReferralStatus(scannedReferral.id, 'under_treatment', 'Patient admitted to emergency ward by triage staff.');
                      handleLookupPass(scannedReferral.referral_code);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    Admit to Ward
                  </button>
                )}

                <button
                  type="button"
                  id="btn-scan-view-file"
                  onClick={() => onNavigate('referral_detail', { referralId: scannedReferral.id })}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition"
                >
                  Open Full File
                </button>
              </div>
            </div>
          </div>
        )}

      {/* SECTION 1: KEY MONITORING WIDGETS */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Real-Time Hospital Monitoring Widgets</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Widget 1: Total Registered Patients */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Patients</span>
              <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-slate-900">{totalPatientsCount}</span>
              <span className="text-[11px] text-teal-600 font-semibold block mt-0.5">
                Hospital & Portal Registered
              </span>
            </div>
          </div>

          {/* Widget 2: Active Triage Cases */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Active Triage</span>
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-blue-900">{activeCasesCount}</span>
              <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">
                {pendingCount} Pending • {emergencyCasesCount} Emergency
              </span>
            </div>
          </div>

          {/* Widget 3: Bed & Ward Load */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Bed Occupancy</span>
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Bed className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-purple-900">
                {Math.round(((myFacility?.current_load || 0) / (myFacility?.capacity || 1)) * 100)}%
              </span>
              <span className="text-[11px] text-purple-700 font-semibold block mt-0.5">
                {myFacility?.current_load} / {myFacility?.capacity} Beds
              </span>
            </div>
          </div>

          {/* Widget 4: Medicine / Inventory Status */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Stock Alerts</span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${lowStockItems.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-black ${lowStockItems.length > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {lowStockItems.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                {lowStockItems.length > 0 ? 'Items Require Restock' : 'All Supplies Adequate'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MEDICINE & INVENTORY MONITORING MODULE */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-700" />
              <span>Hospital Medicine & Emergency Inventory</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking for critical medicines, thrombolytics, insulin, oxygen, and transfusion supplies
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['all', 'Medicine', 'Emergency', 'Supplies', 'Blood Bank'].map((cat) => (
              <button
                key={cat}
                type="button"
                id={`btn-inv-filter-${cat}`}
                onClick={() => setInventoryCategoryFilter(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                  inventoryCategoryFilter === cat
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Items' : cat}
              </button>
            ))}
          </div>
        </div>

        {restockNotice && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{restockNotice}</span>
          </div>
        )}

        {/* Inventory Grid Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredInventory.map((item) => {
            const isLow = item.current_stock <= item.min_threshold;
            const isCrit = item.current_stock <= item.min_threshold * 0.4;
            const isZero = item.current_stock === 0;

            return (
              <div
                key={item.id}
                id={`inv-card-${item.id}`}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                  isZero
                    ? 'bg-rose-50/70 border-rose-300'
                    : isCrit
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {item.category} • {item.item_code}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {item.name}
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                        isZero
                          ? 'bg-rose-600 text-white'
                          : isCrit
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isLow
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Stock progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">
                        Stock: <strong className="text-slate-950 font-black">{item.current_stock}</strong> {item.unit}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Min: {item.min_threshold}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCrit ? 'bg-rose-600' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round((item.current_stock / (item.min_threshold * 2)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Restock & Quantity Controls */}
                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id={`btn-minus-${item.id}`}
                      onClick={() => updateInventoryStock(item.id, Math.max(0, item.current_stock - 5))}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center text-xs hover:bg-slate-100"
                      title="Consume 5 units"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      id={`btn-plus-${item.id}`}
                      onClick={() => updateInventoryStock(item.id, item.current_stock + 5)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center text-xs hover:bg-slate-100"
                      title="Add 5 units"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id={`btn-restock-10-${item.id}`}
                      onClick={() => handleQuickRestock(item.id, item.name, 10)}
                      className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold transition active:scale-95"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      id={`btn-restock-50-${item.id}`}
                      onClick={() => handleQuickRestock(item.id, item.name, 50)}
                      className="px-2 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold transition active:scale-95 shadow-xs"
                    >
                      +50 Restock
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: INCOMING REFERRALS & TRIAGE QUEUE */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Inbox className="w-4 h-4 text-blue-700" />
            <span>Hospital Incoming Referrals ({filteredReferrals.length})</span>
          </h3>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto overflow-x-auto">
            {['all', 'pending', 'accepted', 'under_treatment', 'completed'].map((st) => (
              <button
                key={st}
                type="button"
                id={`filter-ref-${st}`}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition capitalize whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'under_treatment' ? 'Admitted' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Search referrals */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="input-hospital-search-referrals"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search incoming referrals by patient, code, origin PHC, or diagnosis..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Referrals List */}
        <div className="space-y-2.5">
          {filteredReferrals.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No referrals match the criteria</p>
              <p className="text-xs text-slate-400 mt-0.5">Switch filter to 'All' or adjust search query</p>
            </div>
          ) : (
            filteredReferrals.map((r) => {
              const patient = patients.find((p) => p.id === r.patient_id);
              const source = facilities.find((f) => f.id === r.source_facility_id);

              return (
                <div
                  key={r.id}
                  id={`ref-item-${r.id}`}
                  className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div
                    onClick={() => onNavigate('referral_detail', { referralId: r.id })}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-900">{r.referral_code}</span>
                      <PriorityBadge priority={r.priority} />
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 truncate">
                      {patient ? patient.name : 'Unknown Patient'} • {r.diagnosis}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-2">
                      <span>Origin: {source ? source.name : 'PHC Center'}</span>
                      <span>•</span>
                      <span>Vitals: BP {r.blood_pressure || '120/80'}, SpO2 {r.spo2 || '98%'}</span>
                    </div>
                  </div>

                  {/* Actions Deck */}
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status === 'pending' && (
                      <button
                        type="button"
                        id={`btn-accept-ref-${r.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptReferral(r.id, 'Bed and specialist assigned at Hospital Triage.');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        Accept Case
                      </button>
                    )}

                    {r.status === 'accepted' && (
                      <button
                        type="button"
                        id={`btn-admit-ref-${r.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          advanceReferralStatus(r.id, 'under_treatment', 'Patient admitted to emergency bay.');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        Admit / Treat
                      </button>
                    )}

                    <button
                      type="button"
                      id={`btn-detail-ref-${r.id}`}
                      onClick={() => onNavigate('referral_detail', { referralId: r.id })}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1"
                    >
                      <span>Full File</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
