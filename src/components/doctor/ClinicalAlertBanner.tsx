import React, { useState, useMemo } from 'react';
import {
  evaluateSyndromicMatch,
  DEFAULT_OUTBREAK_ALERTS,
  DEFAULT_GEO_CLUSTERS,
} from '../../services/predictiveEngine';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Droplet,
  Stethoscope,
  Radio,
  FileCheck,
  Send,
  Info,
  X,
} from 'lucide-react';

interface ClinicalAlertBannerProps {
  symptoms: string;
  diagnosis: string;
  patientAddress?: string;
  vitals?: {
    temperature?: string | number;
    bloodPressure?: string;
    hr?: string | number;
    spo2?: string | number;
  };
  onApplyProtocol?: (guidanceText: string, suggestedLabs: string[]) => void;
  onFlagStatutoryReport?: (diseaseName: string) => void;
}

export const ClinicalAlertBanner: React.FC<ClinicalAlertBannerProps> = ({
  symptoms,
  diagnosis,
  patientAddress = '',
  vitals,
  onApplyProtocol,
  onFlagStatutoryReport,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [reportedSuccess, setReportedSuccess] = useState(false);

  // Evaluate syndromic matching in real-time
  const matchResult = useMemo(() => {
    return evaluateSyndromicMatch(
      symptoms,
      diagnosis,
      patientAddress,
      vitals,
      DEFAULT_OUTBREAK_ALERTS,
      DEFAULT_GEO_CLUSTERS
    );
  }, [symptoms, diagnosis, patientAddress, vitals]);

  if (!matchResult.hasMatch || isDismissed) {
    return null;
  }

  const { outbreakAlert, matchedCluster, matchScore, matchedSymptoms, alertSeverity } = matchResult;

  const isCritical = alertSeverity === 'Critical';
  const isHigh = alertSeverity === 'High';

  const handleApply = () => {
    if (onApplyProtocol && matchResult.outbreakAlert) {
      const guidance = `[OUTBREAK CLINICAL PROTOCOL: ${matchResult.outbreakAlert.diseaseName}]\n• Recommended First-Line: ${matchResult.clinicalGuidanceNotes}\n• Required Isolation: ${matchResult.isolationProtocol}`;
      onApplyProtocol(guidance, matchResult.recommendedLabOrders);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 3000);
    }
  };

  const handleReport = () => {
    if (onFlagStatutoryReport && matchResult.outbreakAlert) {
      onFlagStatutoryReport(matchResult.outbreakAlert.diseaseName);
      setReportedSuccess(true);
      setTimeout(() => setReportedSuccess(false), 3000);
    }
  };

  return (
    <div
      className={`rounded-3xl border shadow-lg transition-all animate-in fade-in slide-in-from-top-2 overflow-hidden ${
        isCritical
          ? 'bg-rose-950/90 text-white border-rose-600/80 shadow-rose-950/30'
          : isHigh
          ? 'bg-amber-950/90 text-white border-amber-600/80 shadow-amber-950/30'
          : 'bg-indigo-950/90 text-white border-indigo-600/80 shadow-indigo-950/30'
      }`}
    >
      {/* Top Warning Banner Header */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              isCritical
                ? 'bg-rose-600 text-white animate-pulse'
                : isHigh
                ? 'bg-amber-500 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                Epidemiological Surge Warning
              </span>
              <span className="text-[10px] font-bold text-rose-300 font-mono">
                {matchScore}% Syndromic Correlation
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Potential Outbreak Case: {outbreakAlert?.diseaseName || 'Active Vector Cluster'}
            </h4>

            <p className="text-xs text-slate-200 leading-relaxed">
              Patient profile correlates with active cluster in{' '}
              <span className="font-bold underline decoration-rose-400">
                {matchedCluster?.regionName || 'your regional zone'}
              </span>
              . Immediate isolation & targeted lab orders advised.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title={isExpanded ? 'Collapse Guidance' : 'Expand Guidance'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Clinical Guidance Section */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4 border-t border-white/10 pt-3">
          {/* Matched Symptom Badges */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Matched Outbreak Indicators:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {matchedSymptoms.map((sym, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/30 text-rose-200 border border-rose-400/40"
                >
                  ✓ {sym}
                </span>
              ))}
              {matchedCluster?.wardCode && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/30 text-amber-200 border border-amber-400/40">
                  📍 Resident in {matchedCluster.wardCode}
                </span>
              )}
            </div>
          </div>

          {/* Clinical Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Box 1: Recommended Labs */}
            <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 space-y-2">
              <div className="font-bold text-teal-300 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4" />
                <span>Statutory & Point-of-Care Lab Orders</span>
              </div>
              <ul className="space-y-1 text-slate-200 list-disc list-inside">
                {matchResult.recommendedLabOrders.map((lab, idx) => (
                  <li key={idx} className="leading-snug">
                    {lab}
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 2: Triage & Bedside Care */}
            <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 space-y-2">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                <span>Immediate Supportive Therapy</span>
              </div>
              <p className="text-slate-200 leading-relaxed">{matchResult.clinicalGuidanceNotes}</p>
              <div className="text-[11px] text-rose-300 font-semibold mt-1">
                ⚠️ Isolation: {matchResult.isolationProtocol}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              {onApplyProtocol && (
                <button
                  onClick={handleApply}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{appliedSuccess ? 'Protocol Appended!' : 'Apply Protocol to Referral'}</span>
                </button>
              )}

              {matchResult.statutoryReportRecommended && (
                <button
                  onClick={handleReport}
                  className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{reportedSuccess ? 'IDSP Surveillance Notified' : 'Report Case to State IDSP'}</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-300 font-mono">
              Sentinel Registry Ref: {outbreakAlert?.id || 'SURG-2026'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
