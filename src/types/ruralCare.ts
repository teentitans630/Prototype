export type PriorityLevel = 'Low' | 'Moderate' | 'Urgent' | 'Emergency';

export type SyncStatus = 'Synced' | 'Pending' | 'Offline' | 'Failed';

export type HealthcareWorkerRole =
  | 'ASHA'
  | 'ANM'
  | 'CHO'
  | 'MPHW'
  | 'Medical Officer'
  | 'Staff Nurse'
  | 'Community Health Volunteer';

export interface VitalsSnapshot {
  temperatureF: number;
  systolicBp: number;
  diastolicBp: number;
  heartRateBpm: number;
  spo2Pct: number;
  respiratoryRateBpm: number;
  bloodGlucoseMgDl?: number;
  hemoglobinGPerDl?: number;
  capturedAt: string;
}

export interface DiagnosticMedia {
  id: string;
  type: 'photo' | 'audio_note' | 'ecg_strip' | 'skin_lesion' | 'throat_image';
  title: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  fileSizeBytes: number;
  capturedAt: string;
  isUploaded: boolean;
}

export interface TeleTriageRecord {
  id: string;
  triageCode: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  patientAddress: string;
  villageName: string;
  subCenterOrWard: string;
  district: string;
  workerId: string;
  workerName: string;
  workerRole: HealthcareWorkerRole;
  chiefComplaint: string;
  symptoms: string[];
  symptomDuration: string;
  vitals: VitalsSnapshot;
  priority: PriorityLevel;
  suspectedCondition: string;
  diagnosticMedia: DiagnosticMedia[];
  fieldNotes: string;
  specialistNotes?: string;
  assignedSpecialistId?: string;
  assignedSpecialistName?: string;
  assignedSpecialty?: string;
  recommendedAction?: 'Home Isolation with Follow-up' | 'PHC Day Care' | 'Urgent Tertiary Referral' | 'Ambulance 108 Evacuation';
  syncStatus: SyncStatus;
  createdAt: string;
  reviewedAt?: string;
}

export type PoCTestType =
  | 'Malaria Rapid Antigen (Pf/Pv)'
  | 'Dengue NS1 / IgM Rapid'
  | 'Random Blood Glucose (RBG)'
  | 'Hemoglobin (Hb) Meter'
  | 'Urine Albumin & Sugar Strip'
  | 'HIV 1/2 Antibody Rapid'
  | 'Syphilis TP Rapid'
  | 'Typhoid IgM/IgG Card'
  | 'COVID-19 Ag Rapid'
  | 'Vibrio Cholerae RDT';

export type SampleTransportStatus =
  | 'Not Applicable'
  | 'Sample Collected'
  | 'In Cold Chain Transport'
  | 'Received at District Lab'
  | 'Analyzed & Verified';

export interface PoCDiagnosticTest {
  id: string;
  testCode: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  villageName: string;
  testType: PoCTestType;
  kitManufacturer: string;
  kitBatchNumber: string;
  expiryDate: string;
  result: 'Negative' | 'Positive' | 'Inconclusive' | 'Normal' | 'Elevated' | 'Critical';
  quantitativeValue?: string;
  referenceRange?: string;
  conductedByWorker: string;
  workerRole: HealthcareWorkerRole;
  facilityOrVillage: string;
  conductedAt: string;
  sampleTransportStatus: SampleTransportStatus;
  coldChainTempCelsius?: number;
  coldChainTargetMinCelsius?: number;
  coldChainTargetMaxCelsius?: number;
  syncStatus: SyncStatus;
  resultPhotoUrl?: string;
  clinicalImplication: string;
  statutoryFlagged?: boolean;
}

export type TransportArrangement =
  | '108 Emergency Ambulance'
  | '104 Mobile Medical Van'
  | 'Local Govt Transport'
  | 'Family Arranged Vehicle'
  | 'Awaiting Dispatch';

export type ReferralLifecycleStage =
  | 'Initiated'
  | 'Specialist Accepted'
  | 'Transport In Transit'
  | 'Arrived & Triaged'
  | 'Admitted'
  | 'Completed'
  | 'Declined';

export interface ReferralRequest {
  id: string;
  referralCode: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  originFacilityId: string;
  originFacilityName: string;
  originVillageOrDistrict: string;
  destinationFacilityId: string;
  destinationFacilityName: string;
  specialtyRequired: string;
  priority: PriorityLevel;
  clinicalSummary: string;
  provisionalDiagnosis: string;
  transportArrangement: TransportArrangement;
  transportVehicleNumber?: string;
  transportDriverContact?: string;
  transportEtaMinutes?: number;
  allocatedBedType?: 'ICU' | 'High Dependency Unit (HDU)' | 'General Ward' | 'Isolation / Fever Bay' | 'Emergency Resuscitation';
  bedReservationCode?: string;
  specialistDoctorName?: string;
  specialistContact?: string;
  status: ReferralLifecycleStage;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface MobileSpecialist {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  phone: string;
  languages: string[];
}

export interface RouteStop {
  id: string;
  timeWindow: string;
  village: string;
  landmark: string;
  expectedPatients: number;
  servicesOffered: string[];
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Delayed';
}

export interface MobileEquipment {
  id: string;
  name: string;
  category: 'Diagnostic' | 'Surgical' | 'Pharmacy' | 'Telemedicine';
  status: 'Operational' | 'Low Stock' | 'Calibration Due' | 'Offline';
  quantity: number;
  unit: string;
}

export interface MobileUnit {
  id: string;
  unitCode: string;
  name: string;
  vehicleRegistration: string;
  baseHospital: string;
  currentLocation: {
    lat: number;
    lng: number;
    village: string;
    landmark: string;
  };
  status: 'Active on Route' | 'Camp in Progress' | 'Maintenance' | 'Returning to Base';
  onDutySpecialists: MobileSpecialist[];
  operatingHours: string;
  todayRouteSchedule: RouteStop[];
  equipmentInventory: MobileEquipment[];
  telemedicineBandwidth: '4G LTE' | 'Satellite VSAT' | 'Offline Mesh / Store & Forward';
  batterySolarStatusPct: number;
  oxygenCylindersAboard: number;
  contactNumber: string;
  distanceFromUserKm?: number;
}
