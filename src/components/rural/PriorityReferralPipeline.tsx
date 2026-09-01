import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ReferralRequest,
  ReferralLifecycleStage,
  PriorityLevel,
  TransportArrangement,
} from '../../types/ruralCare';
import { DEFAULT_REFERRAL_REQUESTS } from '../../services/referralEngine';
import {
  Network,
  Truck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Phone,
  Bed,
  User,
  MapPin,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface PriorityReferralPipelineProps {
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
}

const STAGES: { key: ReferralLifecycleStage; label: string; color: string }[] = [
  { key: 'Initiated', label: '1. Initiated', color: 'bg-slate-100 text-slate-800' },
  { key: 'Specialist Accepted', label: '2. Specialist Accepted', color: 'bg-indigo-50 text-indigo-800' },
  { key: 'Transport In Transit', label: '3. 108 In Transit', color: 'bg-amber-50 text-amber-800' },
  { key: 'Arrived & Triaged', label: '4. Arrived & Triaged', color: 'bg-cyan-50 text-cyan-800' },
  { key: 'Admitted', label: '5. Bed Admitted', color: 'bg-emerald-50 text-emerald-800' },
];

export const PriorityReferralPipeline: React.FC<PriorityReferralPipelineProps> = ({ onNavigate }) => {
  const { facilities } = useApp();

  const [referrals, setReferrals] = useState<ReferralRequest[]>(() => {
    try {
      const saved = localStorage.getItem('rural_priority_referrals');
      if (saved) {
        return JSON.parse(saved) as ReferralRequest[];
      }
    } catch {
      // safe
    }
    return DEFAULT_REFERRAL_REQUESTS;
  });

  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<ReferralRequest | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Advance Referral Stage
  const handleAdvanceStage = (id: string, nextStage: ReferralLifecycleStage) => {
    const updated = referrals.map((r) =>
      r.id === id ? { ...r, status: nextStage, updatedAt: new Date().toISOString() } : r
    );
    setReferrals(updated);
    try {
      localStorage.setItem('rural_priority_referrals', JSON.stringify(updated));
    } catch {
      // safe
    }
    showToast(`Referral status advanced to "${nextStage}"`);
  };

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referralCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destinationFacilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.specialtyRequired.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || r.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesPriority;
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

      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 border border-indigo-500/30 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                Inter-Facility Routing & Logistics Pipeline
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Primary-to-Tertiary Referral Command Board
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Track emergency ambulance transit, bed reservations, and tertiary specialist acceptance in real-time from rural primary centers to regional specialty hubs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  viewMode === 'board' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Kanban Pipeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                List View
              </button>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('create_referral')}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Referral</span>
            </button>
          </div>
        </div>

        {/* Live Transit Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Referrals</span>
            <span className="text-xl font-black text-white">{referrals.length}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-rose-300 font-bold uppercase block flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" />
              Critical Emergencies
            </span>
            <span className="text-xl font-black text-rose-400">
              {referrals.filter((r) => r.priority === 'Emergency').length} Cases
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-amber-300 font-bold uppercase block flex items-center gap-1">
              <Truck className="w-3 h-3 text-amber-400" />
              108 Ambulances En Route
            </span>
            <span className="text-xl font-black text-amber-400">
              {referrals.filter((r) => r.status === 'Transport In Transit').length} In Transit
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block flex items-center gap-1">
              <Bed className="w-3 h-3 text-emerald-400" />
              Bed Reserved / Admitted
            </span>
            <span className="text-xl font-black text-emerald-400">
              {referrals.filter((r) => r.status === 'Admitted').length} Admitted
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, hospital, or referral code..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Priority:</span>
          {['all', 'emergency', 'urgent', 'moderate'].map((p) => (
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

      {/* KANBAN PIPELINE BOARD */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAGES.map((stage) => {
            const stageReferrals = filteredReferrals.filter((r) => r.status === stage.key);

            return (
              <div
                key={stage.key}
                className="bg-slate-50/80 rounded-3xl p-3.5 border border-slate-200 flex flex-col space-y-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-slate-800">{stage.label}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
                    {stageReferrals.length}
                  </span>
                </div>

                {/* Cards in Column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageReferrals.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-[11px] text-slate-400 font-semibold text-center p-2">
                      No active cases in this stage
                    </div>
                  ) : (
                    stageReferrals.map((r) => {
                      const isEmg = r.priority === 'Emergency';
                      const isUrg = r.priority === 'Urgent';

                      return (
                        <div
                          key={r.id}
                          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition space-y-2.5"
                        >
                          {/* Top: Code & Priority */}
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {r.referralCode}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                isEmg
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                                  : isUrg
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-teal-100 text-teal-800 border border-teal-200'
                              }`}
                            >
                              {r.priority}
                            </span>
                          </div>

                          {/* Patient Name */}
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">{r.patientName}</h4>
                            <div className="text-[11px] text-slate-500">
                              {r.patientAge}y, {r.patientGender} • {r.originVillageOrDistrict}
                            </div>
                          </div>

                          {/* Destination Hospital */}
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                            <div className="flex items-center gap-1 font-bold text-slate-800">
                              <Building2 className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span className="truncate">{r.destinationFacilityName}</span>
                            </div>
                            <div className="text-[10px] text-teal-800 font-semibold">
                              Specialty: {r.specialtyRequired}
                            </div>
                          </div>

                          {/* Transport Telemetry */}
                          {r.transportArrangement && (
                            <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[10px] text-amber-950 font-semibold space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>{r.transportArrangement}</span>
                                </span>
                                {r.transportEtaMinutes && (
                                  <span className="font-bold text-amber-900">
                                    ETA ~{r.transportEtaMinutes}m
                                  </span>
                                )}
                              </div>
                              {r.transportVehicleNumber && (
                                <div className="text-[9px] text-amber-800 font-mono">
                                  Veh: {r.transportVehicleNumber}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Bed Reservation */}
                          {r.bedReservationCode && (
                            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                              <span className="flex items-center gap-1">
                                <Bed className="w-3 h-3" />
                                {r.allocatedBedType || 'Bed Reserved'}
                              </span>
                              <span className="font-mono text-[9px]">{r.bedReservationCode}</span>
                            </div>
                          )}

                          {/* Action Advance Buttons */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px] font-bold">
                            <button
                              onClick={() => setSelectedReferral(r)}
                              className="text-slate-500 hover:text-slate-800"
                            >
                              Details
                            </button>

                            {stage.key === 'Initiated' && (
                              <button
                                onClick={() => handleAdvanceStage(r.id, 'Specialist Accepted')}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
                              >
                                Accept & Reserve
                              </button>
                            )}

                            {stage.key === 'Specialist Accepted' && (
                              <button
                                onClick={() => handleAdvanceStage(r.id, 'Transport In Transit')}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition"
                              >
                                Dispatch 108
                              </button>
                            )}

                            {stage.key === 'Transport In Transit' && (
                              <button
                                onClick={() => handleAdvanceStage(r.id, 'Arrived & Triaged')}
                                className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition"
                              >
                                Mark Arrived
                              </button>
                            )}

                            {stage.key === 'Arrived & Triaged' && (
                              <button
                                onClick={() => handleAdvanceStage(r.id, 'Admitted')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                              >
                                Confirm Admission
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {selectedReferral.referralCode}
                </span>
                <h3 className="text-xl font-black text-slate-900">{selectedReferral.patientName}</h3>
                <div className="text-xs text-slate-500">
                  Origin: {selectedReferral.originFacilityName} ({selectedReferral.originVillageOrDistrict})
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  selectedReferral.priority === 'Emergency'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedReferral.priority}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Clinical Summary</span>
                <p className="font-semibold text-slate-800">{selectedReferral.clinicalSummary}</p>
                <div className="text-teal-800 font-bold">
                  Diagnosis: {selectedReferral.provisionalDiagnosis}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1 text-indigo-950">
                <span className="font-bold text-indigo-700 uppercase text-[10px]">
                  Target Destination Facility
                </span>
                <div className="text-sm font-black">{selectedReferral.destinationFacilityName}</div>
                <div>Required Specialty: {selectedReferral.specialtyRequired}</div>
                {selectedReferral.specialistDoctorName && (
                  <div className="text-slate-600">Assigned Doctor: {selectedReferral.specialistDoctorName}</div>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 text-amber-950">
                <span className="font-bold text-amber-800 uppercase text-[10px]">
                  Ambulance & Transport Telemetry
                </span>
                <div className="font-bold">{selectedReferral.transportArrangement}</div>
                {selectedReferral.transportVehicleNumber && (
                  <div>Vehicle: {selectedReferral.transportVehicleNumber}</div>
                )}
                {selectedReferral.transportDriverContact && (
                  <div>Driver Contact: {selectedReferral.transportDriverContact}</div>
                )}
                {selectedReferral.transportEtaMinutes && (
                  <div className="text-rose-700 font-black">
                    Estimated Transit ETA: {selectedReferral.transportEtaMinutes} Minutes
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
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
