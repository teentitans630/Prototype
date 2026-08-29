import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  UserPlus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Building2,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface PHCDashboardViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const PHCDashboardView: React.FC<PHCDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, referrals, patients, facilities } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

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

  const recentFive = filteredReferrals.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Welcome & Facility Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 rounded-3xl p-5 text-white shadow-lg shadow-teal-900/10">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-200">
              PHC Primary Care Hub
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-0.5">
              Welcome, {currentUser?.name || 'Doctor'}
            </h2>
            <p className="text-xs text-teal-100 mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span>{myFacility?.name || 'PHC Kukatpally'} • Active Triage Node</span>
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-teal-200 font-medium">State Triage System</span>
            <span className="text-sm font-bold bg-teal-900/40 px-2.5 py-1 rounded-full mt-1 border border-teal-600/50">
              Connected Online
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <button
            id="btn-register-patient"
            onClick={() => onNavigate('new_patient')}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-white text-teal-900 font-bold text-xs sm:text-sm shadow hover:bg-teal-50 transition active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4 text-teal-700 shrink-0" />
            <span>+ Register Patient</span>
          </button>

          <button
            id="btn-create-referral"
            onClick={() => onNavigate('create_referral')}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.98]"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>+ Create Referral</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Referrals */}
        <div
          onClick={() => onNavigate('referrals', { filter: 'all' })}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:border-teal-300 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">All created cases</div>
        </div>

        {/* Pending */}
        <div
          onClick={() => onNavigate('referrals', { filter: 'pending' })}
          className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-sm cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingCount}</div>
          <div className="text-[10px] text-amber-700/80 mt-0.5">Awaiting hospital</div>
        </div>

        {/* Accepted */}
        <div
          onClick={() => onNavigate('referrals', { filter: 'accepted' })}
          className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-sm cursor-pointer hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between text-blue-500 mb-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase">Accepted</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{acceptedCount}</div>
          <div className="text-[10px] text-blue-700/80 mt-0.5">In treatment queue</div>
        </div>

        {/* Completed */}
        <div
          onClick={() => onNavigate('referrals', { filter: 'completed' })}
          className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm cursor-pointer hover:border-emerald-400 transition"
        >
          <div className="flex items-center justify-between text-emerald-500 mb-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{completedCount}</div>
          <div className="text-[10px] text-emerald-700/80 mt-0.5">Resolved cases</div>
        </div>
      </div>

      {/* Demo Quick Scenario Highlight */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-950">
              Demo Patient: Ravi Kumar (PAT-000245)
            </div>
            <div className="text-[11px] text-amber-800">
              Pre-loaded with Acute Coronary Syndrome case & District Hospital referral
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('create_referral', { prefillRaviKumar: true })}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
        >
          Test Flow
        </button>
      </div>

      {/* Recent Referrals Section */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Recent Referrals</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {myReferrals.length} total
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Latest patient transfers from this PHC
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search referrals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={() => onNavigate('referrals')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5 shrink-0"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Referrals List Cards (Mobile first) */}
        {recentFive.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">No matching referrals found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentFive.map((ref) => {
              const patient = patients.find((p) => p.id === ref.patient_id);
              const destination = facilities.find((f) => f.id === ref.destination_facility_id);
              const formattedDate = new Date(ref.created_at).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={ref.id}
                  onClick={() => onNavigate('referral_detail', { id: ref.id })}
                  className="p-3 sm:p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 transition cursor-pointer flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        {ref.referral_code}
                      </span>
                      <PriorityBadge priority={ref.priority} size="sm" />
                    </div>
                    <StatusBadge status={ref.status} size="sm" />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{patient?.name || 'Unknown Patient'}</span>
                        <span className="text-xs text-slate-400 font-normal">
                          ({patient?.gender}, {patient?.patient_code})
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-600 mt-0.5 line-clamp-1">
                        {ref.diagnosis}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <div className="flex items-center gap-1 truncate max-w-[200px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 truncate">
                        {destination?.name || 'Destination'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
