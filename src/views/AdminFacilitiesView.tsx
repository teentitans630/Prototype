import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  SlidersHorizontal,
  Bed,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react';

interface AdminFacilitiesViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const AdminFacilitiesView: React.FC<AdminFacilitiesViewProps> = ({
  onNavigate,
}) => {
  const { facilities, facilityServices, updateFacilityLoad } = useApp();
  const [activeSimulationNote, setActiveSimulationNote] = useState('');

  const getLoadBadge = (current_load: number, capacity: number) => {
    const percentage = Math.round((current_load / (capacity || 1)) * 100);
    if (percentage < 40) {
      return {
        label: 'Low Load',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        bar: 'bg-emerald-500',
        percentage,
      };
    } else if (percentage <= 75) {
      return {
        label: 'Moderate Load',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        bar: 'bg-amber-500',
        percentage,
      };
    } else {
      return {
        label: 'High Load (Congested)',
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        bar: 'bg-rose-500',
        percentage,
      };
    }
  };

  const handleStepLoad = (facilityId: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    updateFacilityLoad(facilityId, next);
    setActiveSimulationNote(`Updated load for facility to ${next} beds.`);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-indigo-900 rounded-3xl p-5 text-white shadow-lg space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-200">
              Live Capacity & Workload Simulator
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-0.5">
              Facility Management & Load Balancer
            </h2>
            <p className="text-xs text-teal-100 mt-1">
              Adjust hospital bed loads in real time to observe dynamic recommendation score shifts
            </p>
          </div>
          <button
            onClick={() => onNavigate('create_referral', { prefillRaviKumar: true })}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow transition active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test Algorithm</span>
          </button>
        </div>
      </div>

      {activeSimulationNote && (
        <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center justify-between">
          <span>{activeSimulationNote}</span>
          <button
            onClick={() => setActiveSimulationNote('')}
            className="text-teal-700 underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Facility Load Tuner Cards */}
      <div className="space-y-3.5">
        {facilities.map((fac) => {
          const loadInfo = getLoadBadge(fac.current_load, fac.capacity);
          const services = facilityServices.filter(
            (s) => s.facility_id === fac.id && s.available
          );

          return (
            <div
              key={fac.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4"
            >
              {/* Top Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {fac.type}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-slate-500">{fac.address}</p>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${loadInfo.bg}`}
                >
                  {loadInfo.label} ({loadInfo.percentage}%)
                </span>
              </div>

              {/* Interactive Load Adjuster */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-slate-500" />
                    Simulated Active Load:
                  </span>
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    {fac.current_load} / {fac.capacity} beds occupied
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${loadInfo.bar}`}
                    style={{ width: `${Math.min(100, loadInfo.percentage)}%` }}
                  />
                </div>

                {/* Steppers & Slider */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleStepLoad(fac.id, fac.current_load, -10)}
                    className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition active:scale-95 shadow-sm"
                    title="Decrease by 10"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min="0"
                    max={fac.capacity}
                    value={fac.current_load}
                    onChange={(e) =>
                      updateFacilityLoad(fac.id, parseInt(e.target.value, 10))
                    }
                    className="flex-1 accent-teal-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />

                  <button
                    onClick={() => handleStepLoad(fac.id, fac.current_load, 10)}
                    className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition active:scale-95 shadow-sm"
                    title="Increase by 10"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Services list */}
              <div className="text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Available Specialties
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[11px]"
                    >
                      {s.service_name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
