import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateDistanceKm } from '../lib/matchFacilities';
import {
  Building2,
  Search,
  Phone,
  MapPin,
  Stethoscope,
  Activity,
  Layers,
  Bed,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';

interface FacilitiesDirectoryViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const FacilitiesDirectoryView: React.FC<FacilitiesDirectoryViewProps> = ({
  onNavigate,
}) => {
  const { facilities, facilityServices, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('All');

  // Source reference facility (default to Kukatpally)
  const sourceFacility = facilities.find((f) => f.id === currentUser?.facility_id) || facilities[0];

  // Extract unique available services
  const allServicesSet = new Set<string>();
  facilityServices.forEach((s) => allServicesSet.add(s.service_name));
  const serviceOptions = ['All', ...Array.from(allServicesSet).sort()];

  const filteredFacilities = facilities.filter((fac) => {
    const services = facilityServices
      .filter((s) => s.facility_id === fac.id && s.available)
      .map((s) => s.service_name.toLowerCase());

    const matchesSearch =
      fac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fac.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fac.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      services.some((s) => s.includes(searchTerm.toLowerCase()));

    const matchesService =
      selectedService === 'All' ||
      services.includes(selectedService.toLowerCase());

    return matchesSearch && matchesService;
  });

  const getLoadBadge = (current_load: number, capacity: number) => {
    const percentage = Math.round((current_load / (capacity || 1)) * 100);
    if (percentage < 40) {
      return {
        label: 'Low Load',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        progress: 'bg-emerald-500',
        percentage,
      };
    } else if (percentage <= 75) {
      return {
        label: 'Moderate Load',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        progress: 'bg-amber-500',
        percentage,
      };
    } else {
      return {
        label: 'High Load',
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        progress: 'bg-rose-500',
        percentage,
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Facilities Directory
          </h2>
          <p className="text-xs text-slate-500">
            Network of PHCs, Area, District & Medical College Hospitals
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => onNavigate('admin_facilities')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs transition active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage & Simulate Loads</span>
          </button>
        )}
      </div>

      {/* Search & Service Filter Chips */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search facility name, type, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>

        {/* Specialty Filter Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          {serviceOptions.map((service) => (
            <button
              key={service}
              onClick={() => setSelectedService(service)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition shrink-0 ${
                selectedService === service
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Cards */}
      <div className="space-y-3">
        {filteredFacilities.map((fac) => {
          const isCurrent = fac.id === currentUser?.facility_id;
          const services = facilityServices.filter(
            (s) => s.facility_id === fac.id && s.available
          );
          const loadInfo = getLoadBadge(fac.current_load, fac.capacity);
          const distanceKm =
            fac.id === sourceFacility.id
              ? 0
              : calculateDistanceKm(
                  sourceFacility.latitude,
                  sourceFacility.longitude,
                  fac.latitude,
                  fac.longitude
                );

          return (
            <div
              key={fac.id}
              className={`bg-white rounded-3xl p-5 border shadow-sm transition space-y-3.5 ${
                isCurrent ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {fac.type}
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                        Your Facility
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {fac.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {distanceKm === 0 ? 'Current Location' : `${distanceKm} km away`}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {fac.contact}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${loadInfo.bg}`}
                >
                  {loadInfo.label} ({loadInfo.percentage}%)
                </span>
              </div>

              {/* Bed Capacity Progress Bar */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-slate-400" />
                    Bed / Patient Capacity
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {fac.current_load} / {fac.capacity} occupied
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${loadInfo.progress}`}
                    style={{ width: `${Math.min(100, loadInfo.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Available Clinical Services */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Available Services & Specialties
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {services.length === 0 ? (
                    <span className="text-xs text-slate-400">Primary Outpatient Consultation</span>
                  ) : (
                    services.map((s) => (
                      <span
                        key={s.id}
                        className="text-xs font-medium px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-100 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        {s.service_name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 truncate">
                {fac.address}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
