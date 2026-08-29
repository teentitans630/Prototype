import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Search,
  ChevronRight,
  ArrowUpRight,
  User,
  Calendar,
  Bed,
  Layers,
  Inbox,
} from 'lucide-react';

interface HospitalDashboardViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const HospitalDashboardView: React.FC<HospitalDashboardViewProps> = ({
  onNavigate,
}) => {
  const { currentUser, referrals, patients, facilities } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Scope to hospital facility
  const myFacilityId = currentUser?.facility_id || 'fac-dh-02';
  const myFacility = facilities.find((f) => f.id === myFacilityId);
  const hospitalReferrals = referrals.filter(
    (r) => r.destination_facility_id === myFacilityId || currentUser?.role === 'admin'
  );

  const incomingCount = hospitalReferrals.length;
  const pendingCount = hospitalReferrals.filter((r) => r.status === 'pending').length;
  const acceptedCount = hospitalReferrals.filter(
    (r) => r.status === 'accepted' || r.status === 'patient_arrived' || r.status === 'under_treatment'
  ).length;
  const completedCount = hospitalReferrals.filter((r) => r.status === 'completed').length;

  const filteredReferrals = hospitalReferrals
    .filter((r) => {
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

  const recentList = filteredReferrals.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Hospital Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-5 text-white shadow-lg shadow-blue-950/20">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
              Secondary / Tertiary Hospital Triage
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-0.5">
              {myFacility?.name || 'District Hospital Desk'}
            </h2>
            <p className="text-xs text-blue-100 mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span>
                Bed Load: {myFacility?.current_load} / {myFacility?.capacity} occupied (
                {Math.round(((myFacility?.current_load || 0) / (myFacility?.capacity || 1)) * 100)}%)
              </span>
            </p>
          </div>
          <span className="text-xs bg-blue-800 px-3 py-1 rounded-full text-blue-100 font-bold border border-blue-600">
            Triage Desk Active
          </span>
        </div>

        {/* Priority triage alert if pending emergency exists */}
        {pendingCount > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-between text-xs text-amber-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>
                <strong>{pendingCount} Pending Referral{pendingCount > 1 ? 's' : ''}</strong> awaiting triage review
              </span>
            </div>
            <button
              onClick={() => onNavigate('referrals', { filter: 'pending' })}
              className="px-2.5 py-1 rounded-lg bg-amber-400 text-amber-950 font-bold text-[11px] hover:bg-amber-300 transition"
            >
              Review Now
            </button>
          </div>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Incoming Total */}
        <div
          onClick={() => onNavigate('referrals', { filter: 'all' })}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Incoming</span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{incomingCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total transfers routed</div>
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
          <div className="text-[10px] text-amber-700/80 mt-0.5">Needs Accept/Reject</div>
        </div>

        {/* In Treatment / Accepted */}
        <div
          onClick={() => onNavigate('referrals', { filter: 'accepted' })}
          className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-sm cursor-pointer hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between text-blue-500 mb-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase">Active</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{acceptedCount}</div>
          <div className="text-[10px] text-blue-700/80 mt-0.5">Accepted / In Care</div>
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
          <div className="text-[10px] text-emerald-700/80 mt-0.5">Discharged cases</div>
        </div>
      </div>

      {/* Incoming Referrals Queue */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Incoming Triage Queue</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {hospitalReferrals.length} cases
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Patients transferred from surrounding Primary Health Centres
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search triage..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => onNavigate('referrals')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 shrink-0"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* List of cards */}
        {recentList.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">No incoming referrals found.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentList.map((ref) => {
              const patient = patients.find((p) => p.id === ref.patient_id);
              const source = facilities.find((f) => f.id === ref.source_facility_id);
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
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-2 ${
                    ref.status === 'pending'
                      ? 'border-amber-300 bg-amber-50/30 hover:border-amber-500'
                      : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {ref.referral_code}
                      </span>
                      <PriorityBadge priority={ref.priority} size="sm" />
                    </div>
                    <StatusBadge status={ref.status} size="sm" />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{patient?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-400 font-normal">
                          ({patient?.gender}, {patient?.patient_code})
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5">
                        {ref.diagnosis}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        Complaint: {ref.chief_complaint}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <div className="flex items-center gap-1 truncate max-w-[200px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Referred by: <strong className="text-slate-700">{source?.name || 'PHC'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 shrink-0">
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
