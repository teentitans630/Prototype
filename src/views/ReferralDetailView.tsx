import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  ReferralPriority,
  ReferralStatus,
  RejectionReasonCode,
} from '../types';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  HeartPulse,
  Thermometer,
  Activity,
  Droplet,
  FileText,
  AlertTriangle,
  Stethoscope,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

interface ReferralDetailViewProps {
  referralId: string;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const ReferralDetailView: React.FC<ReferralDetailViewProps> = ({
  referralId,
  onNavigate,
}) => {
  const {
    getReferralById,
    currentUser,
    acceptReferral,
    rejectReferral,
    advanceReferralStatus,
  } = useApp();

  const referral = getReferralById(referralId);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<RejectionReasonCode>('No specialist available');
  const [otherReasonText, setOtherReasonText] = useState('');

  // Status progression modal / prompt
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [targetNextStatus, setTargetNextStatus] = useState<ReferralStatus>('patient_arrived');
  const [advanceRemarks, setAdvanceRemarks] = useState('');

  if (!referral) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center text-slate-500">
        <p className="text-sm font-semibold">Referral record not found.</p>
        <button
          onClick={() => onNavigate('referrals')}
          className="mt-4 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold"
        >
          Back to Referrals
        </button>
      </div>
    );
  }

  const isHospitalStaff = currentUser?.role === 'hospital_staff' || currentUser?.role === 'admin';
  const isPending = referral.status === 'pending';
  const isAcceptedOrBeyond =
    referral.status === 'accepted' ||
    referral.status === 'patient_arrived' ||
    referral.status === 'under_treatment';
  const isRejected = referral.status === 'rejected';

  // Handle Acceptance
  const handleAccept = () => {
    acceptReferral(referral.id, 'Referral accepted. Duty specialist assigned.');
  };

  // Handle Rejection
  const handleConfirmReject = () => {
    const finalReason = selectedReason === 'Other' ? (otherReasonText || 'Other clinical constraints') : selectedReason;
    rejectReferral(referral.id, finalReason, otherReasonText);
    setShowRejectModal(false);
  };

  // Handle Status Advancement
  const handleOpenAdvance = (next: ReferralStatus) => {
    setTargetNextStatus(next);
    setAdvanceRemarks('');
    setShowAdvanceModal(true);
  };

  const handleConfirmAdvance = () => {
    advanceReferralStatus(referral.id, targetNextStatus, advanceRemarks);
    setShowAdvanceModal(false);
  };

  const formattedDate = new Date(referral.created_at).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('referrals')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-slate-900">
                {referral.referral_code}
              </span>
              <PriorityBadge priority={referral.priority} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Created on {formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={referral.status} size="md" />
          <button
            id="btn-view-timeline"
            onClick={() => onNavigate('timeline', { id: referral.id })}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
        </div>
      </div>

      {/* REJECTION ALERT & REROUTING FOR PHC */}
      {isRejected && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-900">
                Referral Rejected by Destination Facility
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                <strong>Reason:</strong> {referral.rejection_reason || 'Capacity/Service constraint'}
              </p>
              {referral.rejection_notes && (
                <p className="text-xs text-rose-600 mt-1 italic">
                  "{referral.rejection_notes}"
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-rose-200/60 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-xs text-rose-800 font-medium">
              Re-run facility matching algorithm excluding {referral.destination_facility?.name || 'this hospital'}:
            </span>
            <button
              id="btn-find-alternative-facility"
              onClick={() =>
                onNavigate('create_referral', {
                  preselectedPatientId: referral.patient_id,
                  excludedFacilityIds: [referral.destination_facility_id],
                })
              }
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Find Alternative Facility</span>
            </button>
          </div>
        </div>
      )}

      {/* HOSPITAL TRIAGE ACTION BAR (PENDING) */}
      {isHospitalStaff && isPending && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Clock className="w-6 h-6 shrink-0 animate-pulse" />
            <div>
              <h4 className="font-bold text-sm">Action Required: Triage Decision</h4>
              <p className="text-xs text-amber-100">Review clinical parameters and accept or decline transfer</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-reject-referral"
              onClick={() => setShowRejectModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition active:scale-95 border border-white/30 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>

            <button
              id="btn-accept-referral"
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              <span>Accept Referral</span>
            </button>
          </div>
        </div>
      )}

      {/* HOSPITAL STATUS PROGRESSION CONTROLS (ACCEPTED OR BEYOND) */}
      {isHospitalStaff && isAcceptedOrBeyond && (
        <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              Patient Care Progression
            </span>
            <span className="text-[11px] text-slate-400">
              Current: <strong className="text-white capitalize">{referral.status.replace('_', ' ')}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Patient Arrived */}
            <button
              disabled={referral.status !== 'accepted'}
              onClick={() => handleOpenAdvance('patient_arrived')}
              className={`p-2.5 rounded-xl font-bold text-xs transition flex flex-col items-center gap-1 text-center ${
                referral.status === 'patient_arrived'
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : referral.status === 'accepted'
                  ? 'bg-slate-800 hover:bg-indigo-900 text-slate-200 border border-slate-700'
                  : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>1. Patient Arrived</span>
              <span className="text-[10px] font-normal opacity-75">Triage check-in</span>
            </button>

            {/* Under Treatment */}
            <button
              disabled={referral.status !== 'patient_arrived'}
              onClick={() => handleOpenAdvance('under_treatment')}
              className={`p-2.5 rounded-xl font-bold text-xs transition flex flex-col items-center gap-1 text-center ${
                referral.status === 'under_treatment'
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                  : referral.status === 'patient_arrived'
                  ? 'bg-slate-800 hover:bg-purple-900 text-slate-200 border border-slate-700'
                  : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>2. Under Treatment</span>
              <span className="text-[10px] font-normal opacity-75">Admitted / In Care</span>
            </button>

            {/* Completed */}
            <button
              disabled={referral.status !== 'under_treatment'}
              onClick={() => handleOpenAdvance('completed')}
              className={`p-2.5 rounded-xl font-bold text-xs transition flex flex-col items-center gap-1 text-center ${
                referral.status === 'completed'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                  : referral.status === 'under_treatment'
                  ? 'bg-slate-800 hover:bg-emerald-900 text-slate-200 border border-slate-700'
                  : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>3. Completed</span>
              <span className="text-[10px] font-normal opacity-75">Discharge & summary</span>
            </button>

            {/* Referred Further */}
            <button
              onClick={() => handleOpenAdvance('referred_further')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-teal-900 text-teal-300 border border-slate-700 font-bold text-xs transition flex flex-col items-center gap-1 text-center"
            >
              <span>+ Refer Further</span>
              <span className="text-[10px] font-normal text-slate-400">Higher tertiary center</span>
            </button>
          </div>
        </div>
      )}

      {/* Patient Demographic Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Patient</span>
            <h3
              onClick={() => onNavigate('patient_profile', { id: referral.patient_id })}
              className="text-lg font-bold text-slate-900 hover:text-teal-700 cursor-pointer flex items-center gap-2"
            >
              <span>{referral.patient?.name || 'Ravi Kumar'}</span>
              <span className="font-mono text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                {referral.patient?.patient_code}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {referral.patient?.gender} • Phone: {referral.patient?.phone} • Blood: {referral.patient?.blood_group || 'B+'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('patient_profile', { id: referral.patient_id })}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 underline"
          >
            View Full EHR
          </button>
        </div>

        {/* Facility transfer route */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Source (Referring PHC)</span>
            <div className="font-bold text-slate-800 mt-0.5">{referral.source_facility?.name || 'PHC Kukatpally'}</div>
            <div className="text-slate-500 text-[11px]">{referral.source_facility?.contact}</div>
          </div>

          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100">
            <span className="text-[10px] font-bold text-teal-700 uppercase">Destination Facility</span>
            <div className="font-bold text-teal-950 mt-0.5">{referral.destination_facility?.name || 'District Hospital'}</div>
            <div className="text-teal-700 text-[11px]">{referral.destination_facility?.contact}</div>
          </div>
        </div>
      </div>

      {/* Clinical Findings & Vitals */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Clinical Examination & Vitals
        </h4>

        {/* Vitals Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
            <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-500" />
              Temperature
            </span>
            <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
              {referral.temperature || '98.6 °F'}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-red-50/60 border border-red-100 text-center">
            <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
              <HeartPulse className="w-3 h-3 text-red-500" />
              Blood Pressure
            </span>
            <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
              {referral.blood_pressure || '120/80 mmHg'}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
            <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
              <Activity className="w-3 h-3 text-blue-500" />
              Heart Rate
            </span>
            <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
              {referral.heart_rate || '78 bpm'}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-teal-50/60 border border-teal-100 text-center">
            <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
              <Droplet className="w-3 h-3 text-teal-500" />
              SpO2 Level
            </span>
            <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
              {referral.spo2 || '98%'}
            </div>
          </div>
        </div>

        {/* Diagnosis & Complaint */}
        <div className="space-y-2.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-0.5">Preliminary Diagnosis</span>
            <span className="text-sm font-bold text-teal-900">{referral.diagnosis}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-0.5">Chief Complaint & Symptoms</span>
            <p className="text-slate-800 leading-relaxed">
              {referral.chief_complaint} {referral.symptoms ? `• Associated: ${referral.symptoms}` : ''}
              {referral.duration ? ` (Duration: ${referral.duration})` : ''}
            </p>
          </div>

          {referral.current_treatment && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Treatment Given at PHC</span>
              <p className="text-slate-800">{referral.current_treatment}</p>
            </div>
          )}

          {referral.doctor_notes && (
            <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200/70">
              <span className="font-bold text-teal-900 block mb-0.5">Doctor's Clinical Notes</span>
              <p className="text-slate-800 italic">{referral.doctor_notes}</p>
            </div>
          )}

          {referral.relevant_history && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Relevant History / Comorbidities</span>
              <p className="text-slate-800">{referral.relevant_history}</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REJECT MODAL (4 Reasons) */}
      {/* ========================================================================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Reject Referral</h3>
              <p className="text-xs text-slate-500 mt-1">
                Specify the structured reason for declination so the referring doctor can reroute.
              </p>
            </div>

            <div className="space-y-2">
              {(
                [
                  'No specialist available',
                  'Facility capacity full',
                  'Service unavailable',
                  'Other',
                ] as RejectionReasonCode[]
              ).map((reason) => (
                <label
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                    selectedReason === reason
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reject_reason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs">{reason}</span>
                </label>
              ))}

              {selectedReason === 'Other' && (
                <textarea
                  rows={2}
                  placeholder="Specify other reason details..."
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 mt-2"
                />
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-reject-referral"
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADVANCE STATUS MODAL */}
      {/* ========================================================================= */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Advance Status: <span className="capitalize">{targetNextStatus.replace('_', ' ')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Record clinical milestones and append remarks to patient timeline.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Remarks (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Patient checked in at Triage desk, vitals stable, allocated bed #4 in CCU..."
                value={advanceRemarks}
                onChange={(e) => setAdvanceRemarks(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanceModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-advance-status"
                onClick={handleConfirmAdvance}
                className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
