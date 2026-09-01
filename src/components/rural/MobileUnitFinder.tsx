import React, { useState } from 'react';
import { MobileUnit } from '../../types/ruralCare';
import { DEFAULT_MOBILE_UNITS } from '../../services/referralEngine';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  Radio,
  BatteryCharging,
  Stethoscope,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Users,
  Box,
  Share2,
  Sparkles,
  Wifi,
  Wind,
} from 'lucide-react';

interface MobileUnitFinderProps {
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
  userVillage?: string;
}

export const MobileUnitFinder: React.FC<MobileUnitFinderProps> = ({
  onNavigate,
  userVillage = 'Ramachandrapuram Rural',
}) => {
  const [mobileUnits] = useState<MobileUnit[]>(DEFAULT_MOBILE_UNITS);
  const [selectedUnit, setSelectedUnit] = useState<MobileUnit | null>(DEFAULT_MOBILE_UNITS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredUnits = mobileUnits.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.unitCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.currentLocation.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.onDutySpecialists.some((s) => s.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-600/30 text-white shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            Rural Mobile Medical Units (MMU) & Field Clinics
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Active Mobile Health Unit & Camp Directory
        </h2>
        <p className="text-xs text-slate-300 max-w-2xl">
          Locate roaming Dhanvantari and Arogya Vahini mobile medical vans equipped with satellite telemedicine, specialist doctors, ultrasound, and point-of-care rapid testing in remote villages.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Units List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by van code, village, doctor..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          <div className="space-y-3">
            {filteredUnits.map((unit) => {
              const isSelected = selectedUnit?.id === unit.id;
              const isCampActive = unit.status === 'Camp in Progress';

              return (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-emerald-950 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase block ${
                          isSelected ? 'text-emerald-300' : 'text-slate-400'
                        }`}
                      >
                        {unit.unitCode} • {unit.vehicleRegistration}
                      </span>
                      <h4 className="text-sm font-extrabold mt-0.5">{unit.name}</h4>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                        isCampActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      {unit.status}
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-2xl text-xs space-y-1 ${
                      isSelected ? 'bg-white/10 text-slate-200' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{unit.currentLocation.village}</span>
                    </div>
                    <div className="text-[11px] opacity-80 pl-5">
                      {unit.currentLocation.landmark}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold opacity-90 pt-1">
                    <span>{unit.onDutySpecialists.length} Specialists On-Duty</span>
                    <span className="font-bold text-emerald-400">~{unit.distanceFromUserKm} km away</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Unit In-Depth Dashboard */}
        {selectedUnit ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Unit Header Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {selectedUnit.unitCode}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Base: {selectedUnit.baseHospital}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{selectedUnit.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedUnit.contactNumber}`}
                    className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Unit Coordinator</span>
                  </a>
                </div>
              </div>

              {/* Hardware & Tele-Tech Status Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <Radio className="w-3 h-3 text-indigo-600" />
                    Telemedicine Link
                  </span>
                  <span className="font-extrabold text-slate-800">{selectedUnit.telemedicineBandwidth}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <BatteryCharging className="w-3 h-3 text-emerald-600" />
                    Solar Battery Level
                  </span>
                  <span className="font-extrabold text-emerald-700">
                    {selectedUnit.batterySolarStatusPct}% Charged
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <Wind className="w-3 h-3 text-cyan-600" />
                    Oxygen Cylinders
                  </span>
                  <span className="font-extrabold text-slate-800">{selectedUnit.oxygenCylindersAboard} Ready</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Camp Hours
                  </span>
                  <span className="font-extrabold text-slate-800">{selectedUnit.operatingHours}</span>
                </div>
              </div>

              {/* On-Duty Specialists */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>On-Duty Specialist Doctors ({selectedUnit.onDutySpecialists.length})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedUnit.onDutySpecialists.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-950">{doc.name}</span>
                        <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                          {doc.qualification}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-700">{doc.specialty}</div>
                      <div className="text-[10px] text-slate-500">
                        Languages: {doc.languages.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Route Schedule */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Today&apos;s Field Camp Itinerary</span>
                </h4>

                <div className="space-y-2">
                  {selectedUnit.todayRouteSchedule.map((stop) => {
                    const isInProgress = stop.status === 'In Progress';
                    const isCompleted = stop.status === 'Completed';

                    return (
                      <div
                        key={stop.id}
                        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                          isInProgress
                            ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-400/20'
                            : isCompleted
                            ? 'bg-slate-50 border-slate-200 opacity-70'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{stop.village}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                isInProgress
                                  ? 'bg-teal-600 text-white animate-pulse'
                                  : isCompleted
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {stop.status}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {stop.landmark} • Window: {stop.timeWindow}
                          </div>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {stop.servicesOffered.map((srv, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block font-bold">EXPECTED QUEUE</span>
                          <span className="font-black text-slate-800 text-sm">
                            {stop.expectedPatients} Patients
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Equipment Inventory Aboard */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-emerald-600" />
                  <span>Onboard Diagnostic & Emergency Equipment</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedUnit.equipmentInventory.map((eq) => (
                    <div
                      key={eq.id}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-800 truncate">{eq.name}</div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-700 font-bold">● {eq.status}</span>
                        <span className="font-mono text-slate-500">
                          {eq.quantity} {eq.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 font-semibold flex items-center justify-center">
            Select a Mobile Medical Unit from the directory to inspect onboard doctors and today&apos;s camp schedule.
          </div>
        )}
      </div>
    </div>
  );
};
