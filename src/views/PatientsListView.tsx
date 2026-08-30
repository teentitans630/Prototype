import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserPlus,
  Search,
  ChevronRight,
  Phone,
  Calendar,
  Droplet,
  FileText,
  Activity,
} from 'lucide-react';
import { Patient } from '../types';

interface PatientsListViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const PatientsListView: React.FC<PatientsListViewProps> = ({ onNavigate }) => {
  const { currentUser, patients, referrals } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Doctor role is restricted from patient registration
  const canRegister = currentUser?.role === 'hospital_staff' || currentUser?.role === 'admin';

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const filteredPatients = patients.filter((p) => {
    const query = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      p.patient_code.toLowerCase().includes(query) ||
      (p.blood_group && p.blood_group.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header with Search & Register button */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Patient Registry
            </h2>
            <p className="text-xs text-slate-500">
              Registered primary healthcare patients
            </p>
          </div>
          {canRegister && (
            <button
              id="btn-register-new-patient"
              onClick={() => onNavigate('new_patient')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register Patient</span>
            </button>
          )}
        </div>

        {/* Live Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone, or PAT- code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>
      </div>

      {/* Patient Cards (Mobile first) */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold text-slate-600">No patients found</p>
          <p className="text-xs text-slate-400 mt-1">Try a different name or register a new patient</p>
          <button
            onClick={() => onNavigate('new_patient')}
            className="mt-4 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold"
          >
            Register Patient Now
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPatients.map((patient) => {
            const age = calculateAge(patient.date_of_birth);
            const patientReferrals = referrals.filter((r) => r.patient_id === patient.id);

            return (
              <div
                key={patient.id}
                onClick={() => onNavigate('patient_profile', { id: patient.id })}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-teal-400 hover:bg-teal-50/20 transition cursor-pointer flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        {patient.patient_code}
                      </span>
                      {patient.blood_group && (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-0.5">
                          <Droplet className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                          {patient.blood_group}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {patient.name}
                    </h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 self-center" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{age} yrs • {patient.gender}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span className="font-semibold text-teal-900">
                      {patientReferrals.length} referral{patientReferrals.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {patient.medical_history && (
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    <span className="font-semibold text-slate-700">History:</span> {patient.medical_history}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
