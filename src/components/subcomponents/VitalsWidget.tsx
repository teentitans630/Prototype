import React, { useState, useMemo } from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  TrendingUp,
  X,
  Radio,
  Sliders,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import { VitalsWidgetProps, VitalStatus } from '../../types/patient';
import {
  calculateVitalStatus,
  DEFAULT_VITAL_THRESHOLDS,
  evaluateAllVitalMetrics,
} from '../../context/PatientContext';

interface VitalsFormState {
  systolic: string;
  diastolic: string;
  heartRate: string;
  spo2: string;
  temperature: string;
  respiratoryRate: string;
  notes: string;
  recordedBy: string;
}

const INITIAL_FORM: VitalsFormState = {
  systolic: '120',
  diastolic: '80',
  heartRate: '72',
  spo2: '98',
  temperature: '37.0',
  respiratoryRate: '16',
  notes: '',
  recordedBy: 'Clinical Officer',
};

export const VitalsWidget: React.FC<VitalsWidgetProps> = ({
  latestVitals,
  vitalsHistory = [],
  onAddVitals,
  onDeleteVitals,
  isLoading = false,
  syncStatus,
  thresholds = DEFAULT_VITAL_THRESHOLDS,
  onOpenThresholdSettings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<VitalsFormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Live evaluation of latest vitals against custom clinician thresholds
  const vitalAssessment = useMemo(() => {
    if (!latestVitals) return null;
    return evaluateAllVitalMetrics(latestVitals, thresholds);
  }, [latestVitals, thresholds]);

  // Live preview vital status calculation in form using thresholds
  const previewStatus: VitalStatus = useMemo(() => {
    const sys = parseInt(formData.systolic, 10) || 120;
    const dia = parseInt(formData.diastolic, 10) || 80;
    const hr = parseInt(formData.heartRate, 10) || 72;
    const oxy = parseInt(formData.spo2, 10) || 98;
    const temp = parseFloat(formData.temperature) || 37.0;
    return calculateVitalStatus(sys, dia, hr, oxy, temp, thresholds);
  }, [formData, thresholds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const sys = parseInt(formData.systolic, 10);
    const dia = parseInt(formData.diastolic, 10);
    const hr = parseInt(formData.heartRate, 10);
    const oxy = parseInt(formData.spo2, 10);
    const temp = parseFloat(formData.temperature);
    const resp = formData.respiratoryRate ? parseInt(formData.respiratoryRate, 10) : undefined;

    if (isNaN(sys) || sys < 50 || sys > 260) {
      setFormError('Systolic BP must be between 50 and 260 mmHg');
      return;
    }
    if (isNaN(dia) || dia < 30 || dia > 160) {
      setFormError('Diastolic BP must be between 30 and 160 mmHg');
      return;
    }
    if (isNaN(hr) || hr < 30 || hr > 220) {
      setFormError('Heart rate must be between 30 and 220 BPM');
      return;
    }
    if (isNaN(oxy) || oxy < 50 || oxy > 100) {
      setFormError('SpO2 saturation must be between 50% and 100%');
      return;
    }
    if (isNaN(temp) || temp < 32 || temp > 43) {
      setFormError('Temperature must be between 32.0°C and 43.0°C');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onAddVitals) {
        await onAddVitals({
          patientId: latestVitals?.patientId || 'pat-001',
          bloodPressureSystolic: sys,
          bloodPressureDiastolic: dia,
          heartRate: hr,
          spo2: oxy,
          temperature: temp,
          respiratoryRate: resp,
          notes: formData.notes.trim() || undefined,
          recordedBy: formData.recordedBy.trim() || 'Clinical Officer',
        });
      }
      setIsModalOpen(false);
      setFormData(INITIAL_FORM);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to record vitals');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status?: VitalStatus) => {
    switch (status) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Elevated':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Normal':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const activeAlerts = vitalAssessment?.alerts || [];
  const overallTriageStatus = vitalAssessment?.overallStatus || latestVitals?.status || 'Normal';

  return (
    <div className="space-y-4">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Clinical Vitals Monitor</h3>
            {latestVitals && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(
                  overallTriageStatus
                )}`}
              >
                {overallTriageStatus === 'Critical' && <AlertTriangle className="w-3 h-3 animate-pulse text-red-600" />}
                {overallTriageStatus === 'Warning' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                {overallTriageStatus === 'Normal' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                <span>{overallTriageStatus} Status</span>
              </span>
            )}

            {/* Configured Threshold Protocol Pill */}
            {onOpenThresholdSettings && (
              <button
                type="button"
                onClick={onOpenThresholdSettings}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition"
                title="Click to customize vital thresholds in Settings"
              >
                <Sliders className="w-3 h-3 text-slate-500" />
                <span>Protocol: {thresholds.presetName || 'Custom'}</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {latestVitals
                ? `Last measured ${new Date(latestVitals.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'No vitals logged yet'}
            </span>
            {syncStatus && (
              <span className="text-[10px] font-medium text-slate-400">
                • {syncStatus}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenThresholdSettings && (
            <button
              onClick={onOpenThresholdSettings}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
              title="Customize clinical threshold parameters"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-700" />
              <span>Thresholds</span>
            </button>
          )}

          {vitalsHistory.length > 1 && (
            <button
              id="btn-toggle-vitals-history"
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
              <span>{showHistory ? 'Hide History' : `History (${vitalsHistory.length})`}</span>
            </button>
          )}

          {onAddVitals && (
            <button
              id="btn-open-log-vitals-modal"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Vitals</span>
            </button>
          )}
        </div>
      </div>

      {/* Threshold Breach Visual Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-50/90 border-2 border-red-300 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-red-900 uppercase tracking-wide">
                  Clinical Threshold Alert Triggered ({activeAlerts.length} Exceeded)
                </h4>
                <p className="text-[11px] text-red-700">
                  Current vital measurements exceed clinician-configured safety boundaries ({thresholds.presetName || 'Custom'}):
                </p>
              </div>
            </div>

            {onOpenThresholdSettings && (
              <button
                onClick={onOpenThresholdSettings}
                className="text-[11px] font-bold text-red-800 underline hover:text-red-950 shrink-0"
              >
                Adjust Thresholds
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {activeAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                  alert.severity === 'Critical'
                    ? 'bg-white border-red-300 text-red-900 shadow-xs'
                    : 'bg-white/90 border-amber-300 text-amber-900'
                }`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 uppercase tracking-wider ${
                    alert.severity === 'Critical'
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {alert.severity}
                </span>
                <div className="text-xs">
                  <span className="font-bold block">{alert.title}</span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    {alert.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Metric Cards */}
      {latestVitals && vitalAssessment ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Blood Pressure Card */}
          <div
            className={`p-4 rounded-2xl border shadow-xs transition ${
              vitalAssessment.bp.status === 'Critical'
                ? 'bg-red-50/50 border-red-300 ring-2 ring-red-400/20'
                : vitalAssessment.bp.status === 'Warning'
                ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20'
                : vitalAssessment.bp.status === 'Elevated'
                ? 'bg-orange-50/30 border-orange-200'
                : 'bg-white border-slate-200/80 hover:border-teal-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  vitalAssessment.bp.status === 'Critical'
                    ? 'bg-red-100 text-red-700 animate-pulse'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                <Activity className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vitalAssessment.bp.bg} ${vitalAssessment.bp.color} ${vitalAssessment.bp.border}`}
              >
                {vitalAssessment.bp.label}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Blood Pressure</span>
                {vitalAssessment.bp.isBreached && (
                  <span className="text-[10px] font-extrabold text-red-600 flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    Alert
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}
                </span>
                <span className="text-xs text-slate-400 font-semibold">mmHg</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5">
                <span>Threshold: &lt;{thresholds.bpSystolicWarning}/{thresholds.bpDiastolicWarning}</span>
                <span className="font-mono">Crit: &ge;{thresholds.bpSystolicCritical}</span>
              </div>
            </div>
          </div>

          {/* Heart Rate Card */}
          <div
            className={`p-4 rounded-2xl border shadow-xs transition ${
              vitalAssessment.hr.status === 'Critical'
                ? 'bg-red-50/50 border-red-300 ring-2 ring-red-400/20'
                : vitalAssessment.hr.status === 'Warning'
                ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-white border-slate-200/80 hover:border-teal-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  vitalAssessment.hr.status === 'Critical'
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                <Heart className="w-5 h-5 animate-pulse" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vitalAssessment.hr.bg} ${vitalAssessment.hr.color} ${vitalAssessment.hr.border}`}
              >
                {vitalAssessment.hr.label}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Heart Rate</span>
                {vitalAssessment.hr.isBreached && (
                  <span className="text-[10px] font-extrabold text-red-600 flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    Alert
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {latestVitals.heartRate}
                </span>
                <span className="text-xs text-slate-400 font-semibold">BPM</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5">
                <span>Safe: {thresholds.hrLowWarning} - {thresholds.hrHighWarning}</span>
                <span className="font-mono">Crit: &gt;{thresholds.hrHighCritical}</span>
              </div>
            </div>
          </div>

          {/* SpO2 Card */}
          <div
            className={`p-4 rounded-2xl border shadow-xs transition ${
              vitalAssessment.spo2.status === 'Critical'
                ? 'bg-red-50/50 border-red-300 ring-2 ring-red-400/20'
                : vitalAssessment.spo2.status === 'Warning'
                ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-white border-slate-200/80 hover:border-teal-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  vitalAssessment.spo2.status === 'Critical'
                    ? 'bg-cyan-100 text-cyan-800 animate-pulse'
                    : 'bg-cyan-50 text-cyan-600'
                }`}
              >
                <Wind className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vitalAssessment.spo2.bg} ${vitalAssessment.spo2.color} ${vitalAssessment.spo2.border}`}
              >
                {vitalAssessment.spo2.label}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Oxygen Saturation</span>
                {vitalAssessment.spo2.isBreached && (
                  <span className="text-[10px] font-extrabold text-red-600 flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    Hypoxia
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {latestVitals.spo2}
                </span>
                <span className="text-xs text-slate-400 font-semibold">% SpO2</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5">
                <span>Warn: &le;{thresholds.spo2WarningMin}%</span>
                <span className="font-mono text-red-600">Crit: &le;{thresholds.spo2CriticalMin}%</span>
              </div>
            </div>
          </div>

          {/* Temperature Card */}
          <div
            className={`p-4 rounded-2xl border shadow-xs transition ${
              vitalAssessment.temp.status === 'Critical'
                ? 'bg-red-50/50 border-red-300 ring-2 ring-red-400/20'
                : vitalAssessment.temp.status === 'Warning'
                ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-white border-slate-200/80 hover:border-teal-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  vitalAssessment.temp.status === 'Critical'
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                <Thermometer className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vitalAssessment.temp.bg} ${vitalAssessment.temp.color} ${vitalAssessment.temp.border}`}
              >
                {vitalAssessment.temp.label}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Body Temperature</span>
                {vitalAssessment.temp.isBreached && (
                  <span className="text-[10px] font-extrabold text-red-600 flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    Pyrexia
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {latestVitals.temperature.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">°C ({(latestVitals.temperature * 9 / 5 + 32).toFixed(1)}°F)</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5">
                <span>Fever: &ge;{thresholds.tempHighWarning}°C</span>
                <span className="font-mono text-red-600">Crit: &ge;{thresholds.tempHighCritical}°C</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center">
          <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Vitals Recorded</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Click &quot;Log Vitals&quot; to take initial baseline triage measurements.
          </p>
        </div>
      )}

      {/* Historical Logs Accordion */}
      {showHistory && vitalsHistory.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Historical Vitals Log ({vitalsHistory.length})
            </h4>
            <span className="text-[11px] text-slate-400">Sorted by newest</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {vitalsHistory.map((record, index) => {
              const recordAssessment = evaluateAllVitalMetrics(record, thresholds);
              return (
                <div
                  key={record.id}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50/80 rounded-lg px-2 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-slate-400 w-5">
                      #{vitalsHistory.length - index}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {record.bloodPressureSystolic}/{record.bloodPressureDiastolic} mmHg
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-600">{record.heartRate} BPM</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-600">{record.spo2}% SpO2</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-600">{record.temperature}°C</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{new Date(record.timestamp).toLocaleDateString()} at {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {record.recordedBy && <span>• by {record.recordedBy}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(
                        recordAssessment.overallStatus
                      )}`}
                    >
                      {recordAssessment.overallStatus}
                    </span>
                    {onDeleteVitals && (
                      <button
                        onClick={() => onDeleteVitals(record.id)}
                        className="p-1 text-slate-300 hover:text-red-500 rounded transition"
                        title="Delete measurement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Vitals Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Patient Vitals</h3>
                  <p className="text-xs text-slate-500">Capture triage vitals for EHR archive</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Calculated Preview Status Pill */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                Live Triage Status ({thresholds.presetName || 'Custom'}):
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(previewStatus)}`}>
                {previewStatus}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* BP row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Systolic BP (mmHg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="260"
                    value={formData.systolic}
                    onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                    placeholder="e.g. 120"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Diastolic BP (mmHg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="30"
                    max="160"
                    value={formData.diastolic}
                    onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                    placeholder="e.g. 80"
                  />
                </div>
              </div>

              {/* Heart Rate & SpO2 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Heart Rate (BPM) *
                  </label>
                  <input
                    type="number"
                    required
                    min="30"
                    max="220"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                    placeholder="e.g. 72"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SpO2 Saturation (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="100"
                    value={formData.spo2}
                    onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                    placeholder="e.g. 98"
                  />
                </div>
              </div>

              {/* Temperature & Resp Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Body Temp (°C) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="32"
                    max="43"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                    placeholder="e.g. 37.0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resp Rate (breaths/min)
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="60"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                    placeholder="e.g. 16"
                  />
                </div>
              </div>

              {/* Recorded By */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recorded By / Clinician Name
                </label>
                <input
                  type="text"
                  value={formData.recordedBy}
                  onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Dr. Priya Sharma"
                />
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Observation Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Patient rested 5 mins before measurement; symptoms improving."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Vitals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
