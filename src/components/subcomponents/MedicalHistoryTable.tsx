import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Pill,
  Calendar,
  X,
  Sparkles,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import {
  MedicalHistoryTableProps,
  MedicalHistoryItem,
  MedicalCategory,
  MedicalRecordStatus,
  MedicalSeverity,
} from '../../types/patient';

interface NewRecordFormState {
  condition: string;
  category: MedicalCategory;
  diagnosisDate: string;
  status: MedicalRecordStatus;
  severity: MedicalSeverity;
  prescriptions: string;
  notes: string;
}

const INITIAL_FORM: NewRecordFormState = {
  condition: '',
  category: 'Chronic',
  diagnosisDate: new Date().toISOString().split('T')[0],
  status: 'Active',
  severity: 'Moderate',
  prescriptions: '',
  notes: '',
};

export const MedicalHistoryTable: React.FC<MedicalHistoryTableProps> = ({
  records = [],
  onUpdateStatus,
  onDeleteRecord,
  onAddRecord,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewRecordFormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.notes && rec.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rec.prescriptions &&
          rec.prescriptions.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory = categoryFilter === 'All' || rec.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [records, searchQuery, categoryFilter, statusFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.condition.trim()) {
      setFormError('Condition name is required');
      return;
    }

    const prescriptionList = formData.prescriptions
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      if (onAddRecord) {
        await onAddRecord({
          patientId: records[0]?.patientId || 'pat-001',
          condition: formData.condition.trim(),
          category: formData.category,
          diagnosisDate: formData.diagnosisDate || new Date().toISOString().split('T')[0],
          status: formData.status,
          severity: formData.severity,
          prescriptions: prescriptionList.length > 0 ? prescriptionList : undefined,
          notes: formData.notes.trim() || undefined,
        });
      }
      setIsAddModalOpen(false);
      setFormData(INITIAL_FORM);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add medical record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: MedicalRecordStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Controlled':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Under Observation':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Resolved':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSeverityBadge = (severity: MedicalSeverity) => {
    switch (severity) {
      case 'Severe':
        return 'bg-red-100 text-red-800';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800';
      case 'Mild':
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryBadge = (category: MedicalCategory) => {
    switch (category) {
      case 'Allergy':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Chronic':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Acute':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Surgical':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Vaccination':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Family History':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Medical History & Clinical Diagnoses</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredRecords.length} of {records.length} documented records
            </p>
          </div>

          {onAddRecord && (
            <button
              id="btn-add-medical-record"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search condition, notes, medications..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
            >
              <option value="All">All Categories</option>
              <option value="Chronic">Chronic Conditions</option>
              <option value="Acute">Acute Episodes</option>
              <option value="Allergy">Allergies & Contraindications</option>
              <option value="Surgical">Surgical History</option>
              <option value="Vaccination">Vaccinations</option>
              <option value="Family History">Family History</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Controlled">Controlled</option>
              <option value="Under Observation">Under Observation</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Diagnosis & Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Diagnosis Date</th>
                <th className="py-3 px-4">Prescriptions / Regimen</th>
                <th className="py-3 px-4">Status & Sync</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    {/* Diagnosis & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {item.category === 'Allergy' ? (
                            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{item.condition}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryBadge(
                                item.category
                              )}`}
                            >
                              {item.category}
                            </span>
                            {item.notes && (
                              <span className="text-[11px] text-slate-500 line-clamp-1 max-w-xs" title={item.notes}>
                                {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4 align-top">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>

                    {/* Diagnosis Date */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(item.diagnosisDate).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Prescriptions */}
                    <td className="py-3.5 px-4 align-top">
                      {item.prescriptions && item.prescriptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.prescriptions.map((med, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              <Pill className="w-2.5 h-2.5 text-slate-400" />
                              {med}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None recorded</span>
                      )}
                    </td>

                    {/* Status dropdown & sync */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1">
                        <div className="relative inline-block">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              onUpdateStatus(item.id, e.target.value as MedicalRecordStatus)
                            }
                            className={`text-[11px] font-bold py-1 pl-2.5 pr-6 rounded-lg border appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500 ${getStatusBadge(
                              item.status
                            )}`}
                          >
                            <option value="Active">Active</option>
                            <option value="Controlled">Controlled</option>
                            <option value="Under Observation">Under Observation</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                        {item.syncStatus && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${item.syncStatus === 'Synced' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span>{item.syncStatus}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 align-top text-right">
                      {deletingId === item.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={async () => {
                              await onDeleteRecord(item.id);
                              setDeletingId(null);
                            }}
                            className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
                    <p className="font-semibold text-slate-600">No matching medical records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing filters or search terms</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Clinical Medical Record</h3>
                  <p className="text-xs text-slate-500">Document diagnosis, medications, or allergies</p>
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
              {/* Condition Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Condition / Diagnosis Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="e.g. Type 2 Diabetes Mellitus, Penicillin Allergy"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Category & Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as MedicalCategory })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Chronic">Chronic Condition</option>
                    <option value="Acute">Acute Episode</option>
                    <option value="Allergy">Allergy / Adverse Reaction</option>
                    <option value="Surgical">Surgical Procedure</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Family History">Family History</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as MedicalSeverity })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>

              {/* Status & Diagnosis Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MedicalRecordStatus })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Controlled">Controlled</option>
                    <option value="Under Observation">Under Observation</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Diagnosis Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.diagnosisDate}
                    onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Prescriptions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Prescriptions / Dosages (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.prescriptions}
                  onChange={(e) => setFormData({ ...formData, prescriptions: e.target.value })}
                  placeholder="e.g. Metformin 500mg BD, Telmisartan 40mg OD"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Observations & Diagnostic Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Confirmed with fasting blood work. Patient counseled on diet."
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
                  {isSubmitting ? 'Saving...' : 'Add Medical Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
