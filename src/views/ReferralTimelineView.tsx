import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  ArrowLeft,
  Check,
  Clock,
  Circle,
  Building2,
  User,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Send,
  Sparkles,
} from 'lucide-react';
import { ReferralStatus } from '../types';

interface ReferralTimelineViewProps {
  referralId: string;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const ReferralTimelineView: React.FC<ReferralTimelineViewProps> = ({
  referralId,
  onNavigate,
}) => {
  const { getReferralById, getReferralHistory } = useApp();
  const referral = getReferralById(referralId);
  const history = getReferralHistory(referralId);

  if (!referral) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center text-slate-500">
        <p className="text-sm font-semibold">Referral not found</p>
        <button
          onClick={() => onNavigate('referrals')}
          className="mt-4 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold"
        >
          Back
        </button>
      </div>
    );
  }

  // Standard full journey sequence for comparison
  const standardJourney: { key: ReferralStatus; label: string; description: string }[] = [
    { key: 'pending', label: '1. Referral Created & Sent', description: 'Transmitted from PHC with clinical vitals' },
    { key: 'accepted', label: '2. Triage Accepted', description: 'Hospital duty desk confirmed bed and specialist' },
    { key: 'patient_arrived', label: '3. Patient Arrived', description: 'Physical check-in at triage / emergency bay' },
    { key: 'under_treatment', label: '4. Under Active Treatment', description: 'Clinical interventions & specialist care ongoing' },
    { key: 'completed', label: '5. Completed / Discharged', description: 'Case resolution, discharge summary transmitted back' },
  ];

  // Determine highest completed step index in standard journey
  const completedKeys = new Set(history.map((h) => h.status));

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('referral_detail', { id: referral.id })}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-none">
                Referral Journey & Audit Trail
              </h2>
              <StatusBadge status={referral.status} size="sm" />
            </div>
            <p className="font-mono text-xs text-teal-800 mt-0.5">
              {referral.referral_code} • {referral.patient?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Diagnosis:</span>
          <span className="font-bold text-slate-900">{referral.diagnosis}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Route:</span>
          <span className="font-semibold text-slate-700">
            {referral.source_facility?.name} → {referral.destination_facility?.name}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-500 font-medium">Priority:</span>
          <PriorityBadge priority={referral.priority} size="sm" />
        </div>
      </div>

      {/* Vertical Timeline Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Event History & Milestones</span>
          </h3>
          <p className="text-xs text-slate-500">
            Chronological audit log recorded across PHC and Hospital desks
          </p>
        </div>

        {/* Timeline Items */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {history.map((item, index) => {
            const formattedTime = new Date(item.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const isLast = index === history.length - 1;

            return (
              <div key={item.id} className="relative group">
                {/* Node icon circle */}
                <div
                  className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-white ring-4 ring-white ${
                    item.status === 'rejected'
                      ? 'bg-rose-600'
                      : item.status === 'completed'
                      ? 'bg-emerald-600'
                      : 'bg-teal-600'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>

                {/* Content */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 hover:border-teal-300 transition space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-[11px] font-medium text-slate-400 font-mono">
                      {formattedTime}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">
                    {item.remarks || 'Status updated'}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>
                      Logged by: <strong className="text-slate-700">{item.updated_by_name}</strong> (
                      {item.updated_by_role === 'phc_doctor'
                        ? 'PHC Medical Officer'
                        : item.updated_by_role === 'hospital_staff'
                        ? 'Hospital Triage Desk'
                        : 'Admin'}
                      )
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Prospective Remaining Steps in Journey (if not completed or rejected) */}
          {referral.status !== 'completed' && referral.status !== 'rejected' && (
            <>
              {standardJourney.map((step) => {
                if (completedKeys.has(step.key)) return null;

                return (
                  <div key={step.key} className="relative opacity-60">
                    {/* Hollow Node icon */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center ring-4 ring-white">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-3 border border-dashed border-slate-200 space-y-0.5">
                      <div className="text-xs font-semibold text-slate-500">
                        {step.label}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
