export type SyncStatus = 'Synced' | 'Pending' | 'Offline';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Gender = 'Male' | 'Female' | 'Other';

export type VitalStatus = 'Normal' | 'Elevated' | 'Warning' | 'Critical';

export type MedicalCategory =
  | 'Chronic'
  | 'Acute'
  | 'Surgical'
  | 'Allergy'
  | 'Family History'
  | 'Vaccination';

export type MedicalSeverity = 'Mild' | 'Moderate' | 'Severe';

export type MedicalRecordStatus =
  | 'Active'
  | 'Resolved'
  | 'Under Observation'
  | 'Controlled';

export type AppointmentType =
  | 'Consultation'
  | 'Follow-up'
  | 'Lab Test'
  | 'Specialist Referral'
  | 'Vaccination'
  | 'Emergency';

export type AppointmentStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'
  | 'In-Progress'
  | 'No-Show';

export interface VitalsRecord {
  id: string;
  patientId: string;
  timestamp: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  spo2: number;
  temperature: number; // in °C
  respiratoryRate?: number;
  status: VitalStatus;
  notes?: string;
  recordedBy?: string;
  syncStatus: SyncStatus;
}

export interface MedicalHistoryItem {
  id: string;
  patientId: string;
  condition: string;
  category: MedicalCategory;
  diagnosisDate: string;
  status: MedicalRecordStatus;
  notes?: string;
  prescriptions?: string[];
  severity: MedicalSeverity;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface Appointment {
  id: string;
  patientId: string;
  title: string;
  type: AppointmentType;
  doctorName: string;
  facilityName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: AppointmentStatus;
  notes?: string;
  syncStatus: SyncStatus;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodType: BloodGroup;
  phone: string;
  email?: string;
  address: string;
  emergencyContact: EmergencyContact;
  avatarUrl?: string;
  vitals: VitalsRecord[];
  medicalHistory: MedicalHistoryItem[];
  appointments: Appointment[];
  allergies: string[];
  chronicConditions: string[];
  syncStatus: SyncStatus;
  lastUpdated: string;
  createdAt: string;
}

export interface VitalThresholds {
  // Blood Pressure (mmHg)
  bpSystolicElevated: number;
  bpSystolicWarning: number;
  bpSystolicCritical: number;
  bpDiastolicElevated: number;
  bpDiastolicWarning: number;
  bpDiastolicCritical: number;

  // Heart Rate (BPM)
  hrLowCritical: number;
  hrLowWarning: number;
  hrHighWarning: number;
  hrHighCritical: number;

  // Oxygen Saturation (%)
  spo2CriticalMin: number;
  spo2WarningMin: number;

  // Body Temperature (°C)
  tempLowWarning: number;
  tempHighWarning: number;
  tempHighCritical: number;

  // Respiratory Rate (breaths/min)
  respRateLowWarning: number;
  respRateHighWarning: number;

  // Active Preset identifier
  presetName?: string;
}

export interface VitalAlert {
  metric: 'bp' | 'hr' | 'spo2' | 'temp' | 'resp';
  severity: 'Warning' | 'Critical' | 'Elevated';
  title: string;
  message: string;
  currentValue: string | number;
  thresholdValue: string | number;
}

export interface VitalMetricAssessment {
  status: VitalStatus;
  label: string;
  color: string;
  bg: string;
  border: string;
  isBreached: boolean;
  alertMessage?: string;
}

// Explicit Component Props Interfaces

export interface VitalsWidgetProps {
  latestVitals?: VitalsRecord;
  vitalsHistory?: VitalsRecord[];
  onAddVitals?: (vitals: Omit<VitalsRecord, 'id' | 'timestamp' | 'syncStatus' | 'status'>) => Promise<void> | void;
  onDeleteVitals?: (id: string) => Promise<void> | void;
  isLoading?: boolean;
  syncStatus?: SyncStatus;
  thresholds?: VitalThresholds;
  onOpenThresholdSettings?: () => void;
}

export interface MedicalHistoryTableProps {
  records: MedicalHistoryItem[];
  onUpdateStatus: (id: string, newStatus: MedicalRecordStatus) => Promise<void> | void;
  onDeleteRecord: (id: string) => Promise<void> | void;
  onAddRecord?: (record: Omit<MedicalHistoryItem, 'id' | 'updatedAt' | 'syncStatus'>) => Promise<void> | void;
  isLoading?: boolean;
}

export interface AppointmentLogProps {
  appointments: Appointment[];
  onAddAppointment?: (appointment: Omit<Appointment, 'id' | 'syncStatus'>) => Promise<void> | void;
  onUpdateStatus?: (id: string, status: AppointmentStatus) => Promise<void> | void;
  onDeleteAppointment?: (id: string) => Promise<void> | void;
  isLoading?: boolean;
}

export interface PatientProfileViewProps {
  patientId?: string;
  onNavigate?: (view: string, params?: Record<string, any>) => void;
  onBack?: () => void;
}
