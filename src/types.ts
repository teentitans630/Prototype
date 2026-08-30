export type UserRole = 'phc_doctor' | 'hospital_staff' | 'admin' | 'patient';

export type ReferralPriority = 'emergency' | 'urgent' | 'routine';

export type ReferralStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'patient_arrived'
  | 'under_treatment'
  | 'completed'
  | 'referred_further';

export type RejectionReasonCode =
  | 'No specialist available'
  | 'Facility capacity full'
  | 'Service unavailable'
  | 'Other';

export interface Facility {
  id: string;
  name: string;
  type: 'PHC' | 'District Hospital' | 'Medical College Hospital' | 'Area Hospital' | 'Sub-District Hospital';
  address: string;
  latitude: number;
  longitude: number;
  contact: string;
  capacity: number;
  current_load: number;
  created_at: string;
}

export interface FacilityService {
  id: string;
  facility_id: string;
  service_name: string;
  available: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  facility_id: string | null;
  facility_name?: string;
  patient_id?: string;
  avatar?: string;
  phone?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  patient_code: string;
  name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  emergency_contact?: string;
  emergency_relation?: string;
  blood_group: string;
  medical_history: string;
  allergies: string;
  medications?: string;
  chronic_conditions?: string;
  recent_vitals?: {
    bp?: string;
    blood_pressure?: string;
    hr?: string;
    heart_rate?: string;
    spo2?: string;
    temp?: string;
    temperature?: string;
    resp?: string;
    updated_at?: string;
  };
  created_at: string;
}

export interface HospitalInventoryItem {
  id: string;
  facility_id: string;
  name: string;
  category: 'Medicine' | 'Equipment' | 'Consumable' | 'Blood Product';
  current_stock: number;
  min_threshold: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Critical' | 'Out of Stock';
  last_updated: string;
}

export interface Referral {
  id: string;
  referral_code: string;
  patient_id: string;
  doctor_id: string;
  source_facility_id: string;
  destination_facility_id: string;
  chief_complaint: string;
  symptoms: string;
  diagnosis: string;
  duration: string;
  current_treatment: string;
  relevant_history: string;
  doctor_notes: string;
  temperature: string;
  blood_pressure: string;
  heart_rate: string;
  spo2: string;
  priority: ReferralPriority;
  status: ReferralStatus;
  rejection_reason?: string;
  rejection_notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields for ease of display
  patient?: Patient;
  source_facility?: Facility;
  destination_facility?: Facility;
  doctor_name?: string;
}

export interface ReferralStatusHistory {
  id: string;
  referral_id: string;
  status: ReferralStatus;
  updated_by: string;
  updated_by_name: string;
  updated_by_role: UserRole;
  remarks?: string;
  created_at: string;
}

export interface FacilityMatchScore {
  facility: Facility;
  services: string[];
  totalScore: number; // 0 - 100
  specialtyScore: number; // 0 - 40
  distanceScore: number; // 0 - 20
  capacityScore: number; // 0 - 20
  urgencyScore: number; // 0 - 20
  distanceKm: number;
  loadPercentage: number;
  loadCategory: 'Low' | 'Moderate' | 'High';
  estimatedWaitMinutes: number;
  reasons: string[];
  inferredSpecialty: string;
}
