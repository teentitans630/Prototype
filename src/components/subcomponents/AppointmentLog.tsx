import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  X,
  Stethoscope,
  Building2,
  CalendarCheck,
  ChevronRight,
} from 'lucide-react';
import {
  AppointmentLogProps,
  Appointment,
  AppointmentType,
  AppointmentStatus,
} from '../../types/patient';

interface AppointmentFormState {
  title: string;
  type: AppointmentType;
  doctorName: string;
  facilityName: string;
  scheduledDate: string;
  scheduledTime: string;
  notes: string;
}

const INITIAL_FORM: AppointmentFormState = {
  title: '',
  type: 'Consultation',
  doctorName: 'Dr. Priya Sharma',
  facilityName: 'Bellary Rural Primary Health Centre',
  scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  scheduledTime: '10:00 AM',
  notes: '',
};

export const AppointmentLog: React.FC<AppointmentLogProps> = ({
  appointments = [],
  onAddAppointment,
  onUpdateStatus,
  onDeleteAppointment,
  isLoading = false,
}) => {
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<AppointmentFormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const upcomingList = useMemo(() => {
    return appointments
      .filter((a) => a.scheduledDate >= todayStr && a.status === 'Scheduled')
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [appointments, todayStr]);

  const pastList = useMemo(() => {
    return appointments
      .filter((a) => a.scheduledDate < todayStr || a.status !== 'Scheduled')
      .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
  }, [appointments, todayStr]);

  const displayedList = useMemo(() => {
    if (tab === 'upcoming') return upcomingList;
    if (tab === 'past') return pastList;
    return appointments;
  }, [tab, upcomingList, pastList, appointments]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Appointment title is required');
      return;
    }
    if (!formData.doctorName.trim()) {
      setFormError('Clinician name is required');
      return;
    }
    if (!formData.facilityName.trim()) {
      setFormError('Facility name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onAddAppointment) {
        await onAddAppointment({
          patientId: appointments[0]?.patientId || 'pat-001',
          title: formData.title.trim(),
          type: formData.type,
          doctorName: formData.doctorName.trim(),
          facilityName: formData.facilityName.trim(),
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          status: 'Scheduled',
          notes: formData.notes.trim() || undefined,
        });
      }
      setIsAddModalOpen(false);
      setFormData(INITIAL_FORM);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to schedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In-Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'No-Show':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTypeBadge = (type: AppointmentType) => {
    switch (type) {
      case 'Specialist Referral':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Emergency':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Lab Test':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Follow-up':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Vaccination':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Consultation':
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Clinical Visits & Appointments Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracking scheduled appointments, consultations, and lab diagnostic tests
            </p>
          </div>

          {onAddAppointment && (
            <button
              id="btn-schedule-appointment"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Visit</span>
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'upcoming'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Upcoming Visits</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-200/60 text-teal-900 text-[10px]">
              {upcomingList.length}
            </span>
          </button>

          <button
            onClick={() => setTab('past')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'past'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Past / Completed</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {pastList.length}
            </span>
          </button>

          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              tab === 'all'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All ({appointments.length})</span>
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {displayedList.length > 0 ? (
          displayedList.map((apt) => (
            <div
              key={apt.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-200 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{apt.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeBadge(
                        apt.type
                      )}`}
                    >
                      {apt.type}
                    </span>
                  </div>

                  <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">{apt.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[200px]">{apt.facilityName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">
                        {new Date(apt.scheduledDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.scheduledTime}</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {apt.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Status & Actions */}
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getStatusBadge(
                      apt.status
                    )}`}
                  >
                    {apt.status}
                  </span>

                  {apt.syncStatus && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      • {apt.syncStatus}
                    </span>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-1.5">
                  {apt.status === 'Scheduled' && onUpdateStatus && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'Completed')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1"
                        title="Mark Completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'Cancelled')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition flex items-center gap-1"
                        title="Cancel Appointment"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  {onDeleteAppointment && (
                    <button
                      onClick={() => onDeleteAppointment(apt.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Delete appointment entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center">
            <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Appointments in this tab</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Click &quot;Schedule Visit&quot; to book a clinical encounter or referral consult.
            </p>
          </div>
        )}
      </div>

      {/* Schedule Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Schedule Clinical Encounter</h3>
                  <p className="text-xs text-slate-500">Book consult, lab visit, or specialist screening</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visit Title / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Ophthalmology Retinopathy Screening, Monthly Follow-up"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Encounter Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Encounter Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as AppointmentType })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Consultation">General Consultation</option>
                  <option value="Specialist Referral">Specialist Referral</option>
                  <option value="Follow-up">Follow-up Visit</option>
                  <option value="Lab Test">Diagnostic Lab Test</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Emergency">Emergency Triage</option>
                </select>
              </div>

              {/* Clinician & Facility */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinician / Doctor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.facilityName}
                    onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time Slot *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preparation & Clinical Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Fasting required 8 hours prior. Bring previous ECG reports."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Booking...' : 'Schedule Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
