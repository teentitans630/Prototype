import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  HeartHandshake,
  Droplet,
  AlertTriangle,
  Activity,
  Send,
  Calendar,
  Building2,
  ChevronRight,
  FileHeart,
} from 'lucide-react';

interface PatientProfileViewProps {
  patientId: string;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patientId,
  onNavigate,
}) => {
  const { getPatientById, referrals, facilities } = useApp();
  const patient = getPatientById(patientId);

  if (!patient) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center text-slate-500">
        <p className="text-sm font-semibold">Patient record not found.</p>
        <button
          onClick={() => onNavigate('patients')}
          className="mt-4 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  const patientReferrals = referrals.filter((r) => r.patient_id === patient.id);

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

  const age = calculateAge(patient.date_of_birth);

  return (
    <div className="space-y-4">
      {/* Top Bar with Back & Referral Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('patients')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-none">
              Patient EHR Profile
            </h2>
            <span className="font-mono text-xs font-semibold text-teal-800">
              {patient.patient_code}
            </span>
          </div>
        </div>

        <button
          id="btn-create-referral-for-patient"
          onClick={() => onNavigate('create_referral', { patientId: patient.id })}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Create Referral</span>
        </button>
      </div>

      {/* Patient Main Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 uppercase">
              Registered Patient
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {patient.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {age} years • {patient.gender} • DOB: {patient.date_of_birth || 'Not recorded'}
            </p>
          </div>

          {patient.blood_group && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Blood Group</span>
              <span className="text-sm font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 flex items-center gap-1 mt-0.5">
                <Droplet className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                {patient.blood_group}
              </span>
            </div>
          )}
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span><strong className="text-slate-700">Phone:</strong> {patient.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-700">Emergency:</strong> {patient.emergency_contact || 'None specified'}
            </span>
          </div>

          <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span><strong className="text-slate-700">Address:</strong> {patient.address || 'Local jurisdiction'}</span>
          </div>
        </div>

        {/* Medical and Allergy Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <FileHeart className="w-3.5 h-3.5 text-amber-600" />
              <span>Medical History</span>
            </div>
            <p className="text-xs text-slate-700">
              {patient.medical_history || 'No chronic conditions recorded.'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
            <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Allergies</span>
            </div>
            <p className="text-xs text-slate-700">
              {patient.allergies || 'No known allergies reported.'}
            </p>
          </div>
        </div>
      </div>

      {/* Referral History Section */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Referral History</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {patientReferrals.length}
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              All triage and hospital transfers logged for this patient
            </p>
          </div>

          <button
            onClick={() => onNavigate('create_referral', { patientId: patient.id })}
            className="text-xs font-bold text-teal-700 hover:text-teal-900"
          >
            + New Referral
          </button>
        </div>

        {patientReferrals.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-slate-600">No referrals initiated yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Create a referral if patient requires secondary/tertiary hospital care</p>
            <button
              onClick={() => onNavigate('create_referral', { patientId: patient.id })}
              className="mt-3 px-3 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-bold"
            >
              Start Referral
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {patientReferrals.map((ref) => {
              const dest = facilities.find((f) => f.id === ref.destination_facility_id);
              const formattedDate = new Date(ref.created_at).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={ref.id}
                  onClick={() => onNavigate('referral_detail', { id: ref.id })}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 transition cursor-pointer flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-950 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        {ref.referral_code}
                      </span>
                      <PriorityBadge priority={ref.priority} size="sm" />
                    </div>
                    <StatusBadge status={ref.status} size="sm" />
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {ref.diagnosis}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {ref.chief_complaint}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 truncate max-w-[200px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">
                        {dest?.name || 'Destination Facility'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 shrink-0">
                      <Calendar className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
