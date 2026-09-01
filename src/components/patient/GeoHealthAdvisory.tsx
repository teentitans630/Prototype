import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PublicAdvisory } from '../../types/epidemiology';
import {
  DEFAULT_PUBLIC_ADVISORIES,
  DEFAULT_GEO_CLUSTERS,
} from '../../services/predictiveEngine';
import {
  MapPin,
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  HeartPulse,
  Droplet,
  CheckCircle2,
  Share2,
  Printer,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  Building2,
  ExternalLink,
  HelpCircle,
  Stethoscope,
  Flame,
  Search,
  Navigation,
} from 'lucide-react';

interface GeoHealthAdvisoryProps {
  onNavigate?: (view: string, params?: Record<string, any>) => void;
  userWard?: string;
}

export const GeoHealthAdvisory: React.FC<GeoHealthAdvisoryProps> = ({
  onNavigate,
  userWard = 'Ward 4 (Kukatpally)',
}) => {
  const { facilities, patients, activePatientId, currentUser } = useApp();

  // State
  const [selectedWard, setSelectedWard] = useState<string>(userWard);
  const [activeTab, setActiveTab] = useState<'advisories' | 'checker' | 'centers'>('advisories');
  const [selectedAdvisoryId, setSelectedAdvisoryId] = useState<string>('adv-001');
  const [copiedShare, setCopiedShare] = useState(false);

  // Self-Assessment Checklist State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [assessmentSubmitted, setAssessmentSubmitted] = useState(false);

  const advisories: PublicAdvisory[] = DEFAULT_PUBLIC_ADVISORIES;
  const currentAdvisory = advisories.find((a) => a.id === selectedAdvisoryId) || advisories[0];

  // Check if current selected ward is in danger zone
  const isHighRiskZone = selectedWard.includes('Kukatpally') || selectedWard.includes('Charminar') || selectedWard.includes('Miyapur');

  const availableWards = [
    'Ward 4 (Kukatpally)',
    'Ward 2 (Miyapur)',
    'Ward 8 (Charminar / Old City)',
    'Ward 12 (Secunderabad)',
    'Ward 10 (Jubilee Hills - Safe)',
    'Ward 15 (Gachibowli - Safe)',
  ];

  // Self-Assessment Symptoms Catalog
  const symptomOptions = [
    { id: 'fever_high', label: 'Sudden High Fever (> 102°F / 38.8°C)', category: 'General' },
    { id: 'retro_orbital', label: 'Pain behind eyes when moving them', category: 'Vector' },
    { id: 'joint_pain', label: 'Severe aching in bones / joints / back', category: 'Vector' },
    { id: 'rash', label: 'Red spots or skin rash on arms/legs', category: 'Vector' },
    { id: 'watery_diarrhea', label: 'Frequent watery rice-like diarrhea', category: 'Enteric' },
    { id: 'vomiting', label: 'Continuous vomiting / inability to keep fluids', category: 'Enteric' },
    { id: 'dry_mouth', label: 'Extreme thirst / sunken eyes / dizziness', category: 'Enteric' },
    { id: 'cough_breathless', label: 'Dry cough with breathlessness on exertion', category: 'Respiratory' },
  ];

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const calculateSelfAssessmentResult = () => {
    const hasVector = selectedSymptoms.some((s) => ['retro_orbital', 'joint_pain', 'rash'].includes(s));
    const hasEnteric = selectedSymptoms.some((s) => ['watery_diarrhea', 'vomiting', 'dry_mouth'].includes(s));
    const hasFever = selectedSymptoms.includes('fever_high');
    const hasBreathless = selectedSymptoms.includes('cough_breathless');

    if (hasFever && hasVector) {
      return {
        level: 'Urgent',
        title: 'Suspected Dengue / Arboviral Infection',
        advice: 'High risk of acute Dengue fever. Visit PHC Kukatpally or nearest Fever Triage Clinic immediately for NS1 Antigen test. Drink plenty of fluids (ORS, tender coconut water). Avoid Aspirin/Ibuprofen.',
        color: 'rose',
      };
    } else if (hasEnteric) {
      return {
        level: 'Urgent',
        title: 'Suspected Acute Waterborne Gastroenteritis / Dehydration',
        advice: 'Start Oral Rehydration Salts (ORS) solution immediately (1 cup after every loose stool). If vomiting persists or you feel dizzy standing up, go to GMC or District Hospital emergency.',
        color: 'blue',
      };
    } else if (hasBreathless) {
      return {
        level: 'Moderate',
        title: 'Respiratory Symptoms with Hypoxia Risk',
        advice: 'Monitor your oxygen saturation (SpO2) with a pulse oximeter. If SpO2 drops below 94% or breathlessness worsens, seek medical evaluation.',
        color: 'purple',
      };
    } else if (selectedSymptoms.length > 0) {
      return {
        level: 'Low',
        title: 'Mild Symptoms Detected',
        advice: 'Rest, stay hydrated, and monitor your temperature twice daily. If fever persists over 48 hours, consult a PHC medical officer.',
        color: 'teal',
      };
    } else {
      return {
        level: 'Safe',
        title: 'No Symptoms Reported',
        advice: 'Maintain standard mosquito protection and safe boiled drinking water habits.',
        color: 'emerald',
      };
    }
  };

  const assessmentResult = calculateSelfAssessmentResult();

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `[HEALTH ADVISORY] ${currentAdvisory.title}\n${currentAdvisory.summary}\nEmergency Contact: 104 / 108`
    );
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Location Danger Zone HUD */}
      <div
        className={`rounded-3xl p-5 sm:p-6 text-white shadow-lg transition relative overflow-hidden ${
          isHighRiskZone
            ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-600/50'
            : 'bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 border border-teal-600/50'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                  isHighRiskZone
                    ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isHighRiskZone ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
                {isHighRiskZone ? 'High Risk Outbreak Zone' : 'Low Risk / Standard Precautions'}
              </span>

              <span className="text-xs text-slate-300">
                Active Ward Surveillance
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              {selectedWard} Public Health Advisory
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl">
              {isHighRiskZone
                ? 'Active Dengue & Waterborne clusters active in this vicinity. Follow strict boiled water and mosquito barrier protocols.'
                : 'No active localized critical epidemic clusters detected in your sector.'}
            </p>
          </div>

          {/* Ward Switcher Control */}
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0 space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
              Switch Monitored Ward:
            </label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {availableWards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Emergency Hotlines */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
          <a
            href="tel:104"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-300 uppercase font-bold">State Health Helpline</div>
                <div className="text-sm font-extrabold">Dial 104 (24/7)</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>

          <a
            href="tel:108"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/30 text-rose-300 flex items-center justify-center font-bold">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-300 uppercase font-bold">Emergency Ambulance</div>
                <div className="text-sm font-extrabold">Dial 108 (24/7)</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>

          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-300 uppercase font-bold">Safe Drinking Water</div>
                <div className="text-sm font-extrabold">Boil Minimum 3 Min</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('advisories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'advisories'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Active Outbreak Bulletins</span>
        </button>

        <button
          onClick={() => setActiveTab('checker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'checker'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          <span>Citizen Symptom Self-Assessment</span>
        </button>

        <button
          onClick={() => setActiveTab('centers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'centers'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Nearest Emergency & Triage Centers</span>
        </button>
      </div>

      {/* Tab 1: Active Outbreak Bulletins */}
      {activeTab === 'advisories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Advisory List (Left Column) */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Official State Advisories
              </h4>
              {advisories.map((advisory) => {
                const isSelected = advisory.id === selectedAdvisoryId;
                const isUrgent = advisory.severity === 'Urgent';

                return (
                  <div
                    key={advisory.id}
                    onClick={() => setSelectedAdvisoryId(advisory.id)}
                    className={`p-4 rounded-3xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-white border-rose-500 shadow-md ring-2 ring-rose-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {advisory.severity} Alert
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(advisory.effectiveDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                      {advisory.title}
                    </h5>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {advisory.summary}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs font-semibold text-teal-700">
                      <span>Target: {advisory.targetDisease}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Advisory Deep Dive (Right 2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    {currentAdvisory.severity} Health Directive
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    {currentAdvisory.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Issued By: <span className="font-semibold text-slate-700">{currentAdvisory.issuedBy}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 leading-relaxed space-y-1">
                <span className="font-bold block text-amber-900 uppercase tracking-wider text-[10px]">
                  Executive Citizen Summary:
                </span>
                <p>{currentAdvisory.summary}</p>
              </div>

              {/* Preventive Measures & Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Mandatory Citizen Preventive Action Checklist</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentAdvisory.preventiveMeasures.map((measure, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5"
                    >
                      <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="leading-snug">{measure}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Symptoms to Watch Out For */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Critical Red-Flag Symptoms (Seek Immediate Triage)</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentAdvisory.symptomChecklist.map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>{sym}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* High Risk Activities to Avoid */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Prohibited & High-Risk Activities in Affected Wards</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {currentAdvisory.highRiskActivitiesToAvoid.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Citizen Symptom Self-Assessment Checker */}
      {activeTab === 'checker' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>Interactive Outbreak Triage & Symptom Checker</span>
              </h3>
              <p className="text-xs text-slate-500">
                Select any symptoms you or your family members are experiencing to evaluate localized outbreak match.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedSymptoms([]);
                setAssessmentSubmitted(false);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              Reset Checklist
            </button>
          </div>

          {/* Symptom Multi-Select Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {symptomOptions.map((sym) => {
              const isChecked = selectedSymptoms.includes(sym.id);

              return (
                <div
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    isChecked
                      ? 'bg-teal-50/80 border-teal-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                        isChecked
                          ? 'bg-teal-700 border-teal-700 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{sym.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{sym.category}</span>
                </div>
              );
            })}
          </div>

          {/* Live Dynamic Triage Recommendation Output */}
          <div
            className={`p-5 rounded-3xl border transition space-y-3 ${
              assessmentResult.color === 'rose'
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : assessmentResult.color === 'blue'
                ? 'bg-blue-50/90 border-blue-300 text-blue-950'
                : assessmentResult.color === 'purple'
                ? 'bg-purple-50/90 border-purple-300 text-purple-950'
                : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/80 border border-current">
                Triage Result: {assessmentResult.level} Risk
              </span>
              <span className="text-xs font-mono font-bold">
                {selectedSymptoms.length} symptom(s) recorded
              </span>
            </div>

            <h4 className="text-base font-extrabold">{assessmentResult.title}</h4>

            <p className="text-xs leading-relaxed">{assessmentResult.advice}</p>

            {assessmentResult.level === 'Urgent' && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="tel:104"
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 104 Doctor Advice Now</span>
                </a>
                <button
                  onClick={() => setActiveTab('centers')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Find Nearest Fever Clinic</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Nearest Emergency & Triage Centers */}
      {activeTab === 'centers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((fac) => {
              const isTertiary = fac.type === 'Medical College Hospital' || fac.type === 'District Hospital';
              const availableBeds = Math.max(0, fac.capacity - fac.current_load);
              const isNearKukatpally = fac.address.includes('Kukatpally') || fac.address.includes('Miyapur');

              return (
                <div
                  key={fac.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{fac.name}</h4>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{fac.address}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                      {isNearKukatpally ? '1.8 km away' : '6.4 km away'}
                    </span>
                  </div>

                  {/* Bed and Speciality Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Free Beds</span>
                      <span className="font-extrabold text-teal-800 text-sm">
                        {availableBeds} / {fac.capacity}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Speciality</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {isTertiary ? 'ICU & Ventilators' : 'Fever Triage & Labs'}
                      </span>
                    </div>
                  </div>

                  {/* Action Contact and Direction buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${fac.contact}`}
                      className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call {fac.contact}</span>
                    </a>

                    <a
                      href={`https://maps.google.com/?q=${fac.latitude},${fac.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
