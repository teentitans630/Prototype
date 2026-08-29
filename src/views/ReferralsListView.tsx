import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  ReferralPriority,
  ReferralStatus,
} from '../types';
import {
  Activity,
  Search,
  Filter,
  Send,
  Building2,
  Calendar,
  ChevronRight,
  User,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';

interface ReferralsListViewProps {
  initialFilter?: string;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const ReferralsListView: React.FC<ReferralsListViewProps> = ({
  initialFilter,
  onNavigate,
}) => {
  const { referrals, patients, facilities, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilter || 'all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Scope: PHC sees where source is theirs; Hospital sees where destination is theirs; Admin sees all
  const userFacilityId = currentUser?.facility_id;
  const isDoctor = currentUser?.role === 'phc_doctor';
  const isHospital = currentUser?.role === 'hospital_staff';

  const scopedReferrals = referrals.filter((r) => {
    if (currentUser?.role === 'admin') return true;
    if (isDoctor) return r.source_facility_id === userFacilityId;
    if (isHospital) return r.destination_facility_id === userFacilityId;
    return true;
  });

  const statusChips: { key: string; label: string }[] = [
    { key: 'all', label: 'All Cases' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'patient_arrived', label: 'Arrived' },
    { key: 'under_treatment', label: 'Under Treatment' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'referred_further', label: 'Referred Further' },
  ];

  const filtered = scopedReferrals.filter((ref) => {
    const patient = patients.find((p) => p.id === ref.patient_id);
    const source = facilities.find((f) => f.id === ref.source_facility_id);
    const dest = facilities.find((f) => f.id === ref.destination_facility_id);

    const query = searchTerm.toLowerCase();
    const matchesSearch =
      ref.referral_code.toLowerCase().includes(query) ||
      ref.diagnosis.toLowerCase().includes(query) ||
      ref.chief_complaint.toLowerCase().includes(query) ||
      (patient && patient.name.toLowerCase().includes(query)) ||
      (source && source.name.toLowerCase().includes(query)) ||
      (dest && dest.name.toLowerCase().includes(query));

    const matchesStatus =
      selectedStatus === 'all' || ref.status === selectedStatus;

    const matchesPriority =
      selectedPriority === 'all' || ref.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Referrals Directory
          </h2>
          <p className="text-xs text-slate-500">
            {isDoctor
              ? 'Outbound patient referrals from your PHC'
              : isHospital
              ? 'Inbound patient transfers to your hospital triage'
              : 'State-wide multi-tier referral tracking registry'}
          </p>
        </div>

        {isDoctor && (
          <button
            onClick={() => onNavigate('create_referral')}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Referral</span>
          </button>
        )}
      </div>

      {/* Search & Priority Controls */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by code, patient name, diagnosis, hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm shrink-0"
          >
            <option value="all">All Priorities</option>
            <option value="emergency">Emergency Only</option>
            <option value="urgent">Urgent Only</option>
            <option value="routine">Routine Only</option>
          </select>
        </div>

        {/* Status Filter Chips Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          {statusChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setSelectedStatus(chip.key)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition shrink-0 ${
                selectedStatus === chip.key
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Referrals Cards List (Mobile first) */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400">
          <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold text-slate-600">No matching referrals found</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or search criteria</p>
          <button
            onClick={() => {
              setSelectedStatus('all');
              setSelectedPriority('all');
              setSearchTerm('');
            }}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((ref) => {
            const patient = patients.find((p) => p.id === ref.patient_id);
            const otherFacility = isDoctor
              ? facilities.find((f) => f.id === ref.destination_facility_id)
              : facilities.find((f) => f.id === ref.source_facility_id);

            const formattedDate = new Date(ref.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={ref.id}
                onClick={() => onNavigate('referral_detail', { id: ref.id })}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-teal-400 hover:bg-teal-50/20 transition cursor-pointer flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-950 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                      {ref.referral_code}
                    </span>
                    <PriorityBadge priority={ref.priority} size="sm" />
                  </div>
                  <StatusBadge status={ref.status} size="sm" />
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{patient?.name || 'Patient'}</span>
                      <span className="text-xs font-normal text-slate-400">
                        ({patient?.gender}, {patient?.patient_code})
                      </span>
                    </h3>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">
                      {ref.diagnosis}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {ref.chief_complaint}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 self-center" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 truncate max-w-[220px]">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {isDoctor ? 'To: ' : 'From: '}
                      <strong className="text-slate-700">{otherFacility?.name || 'Facility'}</strong>
                    </span>
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
  );
};
