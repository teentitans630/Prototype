import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Activity,
  Thermometer,
  Wind,
  ShieldAlert,
  Info,
  Sparkles,
} from 'lucide-react';
import { VitalThresholds, VitalsRecord } from '../../types/patient';
import {
  DEFAULT_VITAL_THRESHOLDS,
  CLINICAL_PRESETS,
  evaluateAllVitalMetrics,
} from '../../context/PatientContext';

interface VitalThresholdsConfigPanelProps {
  thresholds: VitalThresholds;
  onUpdateThresholds: (thresholds: Partial<VitalThresholds>) => void;
  onResetThresholds: () => void;
  onApplyPreset: (presetKey: string) => void;
  currentVitals?: VitalsRecord;
  onSaveToast?: (msg: string) => void;
}

export const VitalThresholdsConfigPanel: React.FC<VitalThresholdsConfigPanelProps> = ({
  thresholds,
  onUpdateThresholds,
  onResetThresholds,
  onApplyPreset,
  currentVitals,
  onSaveToast,
}) => {
  const [localForm, setLocalForm] = useState<VitalThresholds>(thresholds);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activePresetKey, setActivePresetKey] = useState<string | null>(null);

  // Sync with prop changes
  useEffect(() => {
    setLocalForm(thresholds);
    setHasUnsavedChanges(false);

    // Identify if matches any preset
    const matchingPresetKey = Object.keys(CLINICAL_PRESETS).find((key) => {
      const p = CLINICAL_PRESETS[key].thresholds;
      return (
        p.bpSystolicWarning === thresholds.bpSystolicWarning &&
        p.bpSystolicCritical === thresholds.bpSystolicCritical &&
        p.bpDiastolicWarning === thresholds.bpDiastolicWarning &&
        p.bpDiastolicCritical === thresholds.bpDiastolicCritical &&
        p.hrHighWarning === thresholds.hrHighWarning &&
        p.hrHighCritical === thresholds.hrHighCritical &&
        p.spo2WarningMin === thresholds.spo2WarningMin &&
        p.spo2CriticalMin === thresholds.spo2CriticalMin &&
        p.tempHighWarning === thresholds.tempHighWarning
      );
    });
    setActivePresetKey(matchingPresetKey || null);
  }, [thresholds]);

  const handleFieldChange = (field: keyof VitalThresholds, value: number) => {
    setLocalForm((prev) => ({
      ...prev,
      [field]: value,
      presetName: 'Custom Configured',
    }));
    setActivePresetKey(null);
    setHasUnsavedChanges(true);
  };

  const handleApplyPreset = (key: string) => {
    const preset = CLINICAL_PRESETS[key];
    if (preset) {
      setLocalForm(preset.thresholds);
      setActivePresetKey(key);
      setHasUnsavedChanges(true);
      onApplyPreset(key);
      if (onSaveToast) onSaveToast(`Applied "${preset.name}" threshold preset.`);
    }
  };

  const handleSave = () => {
    onUpdateThresholds(localForm);
    setHasUnsavedChanges(false);
    if (onSaveToast) onSaveToast('Vital sign alert thresholds updated successfully.');
  };

  const handleReset = () => {
    onResetThresholds();
    setLocalForm(DEFAULT_VITAL_THRESHOLDS);
    setActivePresetKey('standard');
    setHasUnsavedChanges(false);
    if (onSaveToast) onSaveToast('Restored standard WHO/AHA threshold defaults.');
  };

  // Evaluate active patient vitals in real time against the localForm settings
  const simulatedAssessment = currentVitals
    ? evaluateAllVitalMetrics(currentVitals, localForm)
    : null;

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Clinical Vital Sign Thresholds & Alert Triggers
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                {localForm.presetName || 'Custom'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize threshold parameters to trigger automated visual warnings and triage alerts across patient monitoring widgets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Reset to WHO/AHA standard defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs ${
              hasUnsavedChanges
                ? 'bg-teal-700 hover:bg-teal-800 text-white animate-pulse'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{hasUnsavedChanges ? 'Apply & Save Changes' : 'Saved'}</span>
          </button>
        </div>
      </div>

      {/* Preset Profiles Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinical Practice Presets:</span>
          </div>
          <span className="text-[11px] text-slate-400">Click a protocol to apply standardized limits</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {Object.entries(CLINICAL_PRESETS).map(([key, preset]) => {
            const isSelected = activePresetKey === key || localForm.presetName === preset.name;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className={`p-3 rounded-xl text-left border transition flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-400 ring-2 ring-teal-500/20 text-teal-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">{preset.name}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Threshold Category Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Blood Pressure Thresholds */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Blood Pressure (mmHg)</h4>
                <p className="text-[11px] text-slate-500">Systolic & Diastolic limits</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Systolic / Diastolic
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Systolic Warnings */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Systolic Warning Limit (Stage 1 HTN)</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  ≥ {localForm.bpSystolicWarning} mmHg
                </span>
              </div>
              <input
                type="range"
                min="110"
                max="170"
                step="5"
                value={localForm.bpSystolicWarning}
                onChange={(e) => handleFieldChange('bpSystolicWarning', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Strict (110)</span>
                <span>Standard (140)</span>
                <span>Relaxed (170)</span>
              </div>
            </div>

            {/* Systolic Critical */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Systolic Critical Emergency (Stage 2 / Crisis)</span>
                <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                  ≥ {localForm.bpSystolicCritical} mmHg
                </span>
              </div>
              <input
                type="range"
                min="140"
                max="200"
                step="5"
                value={localForm.bpSystolicCritical}
                onChange={(e) => handleFieldChange('bpSystolicCritical', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Diastolic Warnings & Critical */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Diastolic Warning
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="60"
                    max="110"
                    value={localForm.bpDiastolicWarning}
                    onChange={(e) => handleFieldChange('bpDiastolicWarning', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Diastolic Critical
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="80"
                    max="140"
                    value={localForm.bpDiastolicCritical}
                    onChange={(e) => handleFieldChange('bpDiastolicCritical', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Heart Rate & Rhythm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-pink-50 text-pink-600 border border-pink-100">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Heart Rate & Pulse (BPM)</h4>
                <p className="text-[11px] text-slate-500">Bradycardia & Tachycardia alert levels</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700">
              Beats/Min
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Tachycardia High Warning */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Tachycardia Warning (High HR)</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  &gt; {localForm.hrHighWarning} BPM
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="130"
                step="5"
                value={localForm.hrHighWarning}
                onChange={(e) => handleFieldChange('hrHighWarning', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            {/* Critical Tachycardia */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Severe Tachycardia Critical</span>
                <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                  &gt; {localForm.hrHighCritical} BPM
                </span>
              </div>
              <input
                type="range"
                min="110"
                max="160"
                step="5"
                value={localForm.hrHighCritical}
                onChange={(e) => handleFieldChange('hrHighCritical', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Bradycardia Low Warning & Critical */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bradycardia Low Warning
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="40"
                    max="65"
                    value={localForm.hrLowWarning}
                    onChange={(e) => handleFieldChange('hrLowWarning', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">BPM</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Critical Low Bradycardia
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="30"
                    max="50"
                    value={localForm.hrLowCritical}
                    onChange={(e) => handleFieldChange('hrLowCritical', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-[10px] text-slate-400">BPM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Oxygen Saturation (SpO2) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Blood Oxygen Saturation (SpO2)</h4>
                <p className="text-[11px] text-slate-500">Hypoxemia trigger thresholds</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">
              Percentage %
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Warning SpO2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Sub-optimal SpO2 Warning Threshold</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  ≤ {localForm.spo2WarningMin}%
                </span>
              </div>
              <input
                type="range"
                min="88"
                max="97"
                step="1"
                value={localForm.spo2WarningMin}
                onChange={(e) => handleFieldChange('spo2WarningMin', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>COPD target (88%)</span>
                <span>Standard (94%)</span>
                <span>High Sensitivity (96%)</span>
              </div>
            </div>

            {/* Critical Hypoxia */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Critical Hypoxemia Alarm (O2 Therapy Indicated)</span>
                <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                  ≤ {localForm.spo2CriticalMin}%
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="94"
                step="1"
                value={localForm.spo2CriticalMin}
                onChange={(e) => handleFieldChange('spo2CriticalMin', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Temperature & Respiratory Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Body Temp & Respiratory Rate</h4>
                <p className="text-[11px] text-slate-500">Pyrexia & Bradypnea / Tachypnea</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800">
              °C & Breaths/min
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Temperature Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Fever Warning (°C)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="37.0"
                    max="39.0"
                    value={localForm.tempHighWarning}
                    onChange={(e) => handleFieldChange('tempHighWarning', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">°C</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  High Pyrexia Critical (°C)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="38.5"
                    max="41.0"
                    value={localForm.tempHighCritical}
                    onChange={(e) => handleFieldChange('tempHighCritical', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-[10px] text-slate-400">°C</span>
                </div>
              </div>
            </div>

            {/* Respiratory Rate Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bradypnea Low Warning
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="8"
                    max="16"
                    value={localForm.respRateLowWarning}
                    onChange={(e) => handleFieldChange('respRateLowWarning', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-slate-400">/min</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tachypnea High Warning
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="18"
                    max="35"
                    value={localForm.respRateHighWarning}
                    onChange={(e) => handleFieldChange('respRateHighWarning', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-slate-400">/min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Patient Simulation & Verification Card */}
      {currentVitals && simulatedAssessment && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Live Patient Evaluation against Current Thresholds
              </h4>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                simulatedAssessment.overallStatus === 'Critical'
                  ? 'bg-red-500 text-white animate-pulse'
                  : simulatedAssessment.overallStatus === 'Warning'
                  ? 'bg-amber-500 text-slate-900'
                  : simulatedAssessment.overallStatus === 'Elevated'
                  ? 'bg-orange-400 text-slate-900'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              Overall Triage: {simulatedAssessment.overallStatus}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Testing current patient vital readings ({currentVitals.bloodPressureSystolic}/{currentVitals.bloodPressureDiastolic} mmHg, {currentVitals.heartRate} BPM, {currentVitals.spo2}%, {currentVitals.temperature}°C):
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block">BP Assessment</span>
              <span className="font-bold text-slate-100">
                {currentVitals.bloodPressureSystolic}/{currentVitals.bloodPressureDiastolic} mmHg
              </span>
              <span className={`block text-[11px] font-semibold mt-0.5 ${
                simulatedAssessment.bp.status === 'Critical' ? 'text-red-400' : simulatedAssessment.bp.status === 'Warning' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {simulatedAssessment.bp.label}
              </span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block">Heart Rate Assessment</span>
              <span className="font-bold text-slate-100">{currentVitals.heartRate} BPM</span>
              <span className={`block text-[11px] font-semibold mt-0.5 ${
                simulatedAssessment.hr.status === 'Critical' ? 'text-red-400' : simulatedAssessment.hr.status === 'Warning' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {simulatedAssessment.hr.label}
              </span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block">SpO2 Assessment</span>
              <span className="font-bold text-slate-100">{currentVitals.spo2}%</span>
              <span className={`block text-[11px] font-semibold mt-0.5 ${
                simulatedAssessment.spo2.status === 'Critical' ? 'text-red-400' : simulatedAssessment.spo2.status === 'Warning' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {simulatedAssessment.spo2.label}
              </span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block">Temp Assessment</span>
              <span className="font-bold text-slate-100">{currentVitals.temperature.toFixed(1)}°C</span>
              <span className={`block text-[11px] font-semibold mt-0.5 ${
                simulatedAssessment.temp.status === 'Critical' ? 'text-red-400' : simulatedAssessment.temp.status === 'Warning' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {simulatedAssessment.temp.label}
              </span>
            </div>
          </div>

          {simulatedAssessment.alerts.length > 0 && (
            <div className="mt-2 p-2.5 rounded-xl bg-red-950/60 border border-red-800/60 text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-300">
                  {simulatedAssessment.alerts.length} Visual Alert Trigger(s) Active:
                </span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px] text-red-200">
                  {simulatedAssessment.alerts.map((al, idx) => (
                    <li key={idx}>
                      <strong>{al.title}</strong>: {al.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
