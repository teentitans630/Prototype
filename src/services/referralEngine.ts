import { Facility, FacilityService } from '../types';
import {
  PriorityLevel,
  ReferralRequest,
  TeleTriageRecord,
  PoCDiagnosticTest,
  MobileUnit,
  TransportArrangement,
  ReferralLifecycleStage,
} from '../types/ruralCare';

export interface FacilityRoutingScore {
  facility: Facility;
  distanceKm: number;
  estimatedTravelMinutes: number;
  availableBeds: number;
  occupancyRatePct: number;
  hasRequiredSpecialty: boolean;
  specialtyServices: string[];
  totalScore: number; // 0 - 100 (Higher is better match)
  suitabilityReason: string;
  isRecommended: boolean;
  estimated108ResponseMinutes: number;
  recommendedTransport: TransportArrangement;
}

export interface RoutingCriteria {
  originCoordinates: {
    lat: number;
    lng: number;
  };
  priority: PriorityLevel;
  requiredSpecialty: string;
  patientAge: number;
  isPediatricOrObstetric?: boolean;
  requireIcuOrVentilator?: boolean;
}

/**
 * Calculates Haversine distance in kilometers between two geo-coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Estimates road transit time in minutes assuming rural/semi-urban average speeds
 */
export function estimateTransitMinutes(distanceKm: number, isEmergency: boolean): number {
  // Average emergency speed (with siren/priority) ~ 50 km/h; regular ~ 35 km/h
  const avgSpeed = isEmergency ? 48 : 34;
  const baseMinutes = (distanceKm / avgSpeed) * 60;
  // Add 5 min overhead for dispatch/traffic
  return Math.max(8, Math.round(baseMinutes + 5));
}

/**
 * Automated Referral Routing Logic
 * Evaluates candidate secondary/tertiary hospitals based on specialty availability,
 * bed/ICU headroom, physical proximity, and triage severity level.
 */
export function evaluateReferralRouting(
  criteria: RoutingCriteria,
  facilities: Facility[],
  facilityServices: FacilityService[]
): FacilityRoutingScore[] {
  const scoredFacilities = facilities.map((facility) => {
    const distanceKm = calculateDistanceKm(
      criteria.originCoordinates.lat,
      criteria.originCoordinates.lng,
      facility.latitude,
      facility.longitude
    );

    const isEmergency = criteria.priority === 'Emergency' || criteria.priority === 'Urgent';
    const estimatedTravelMinutes = estimateTransitMinutes(distanceKm, isEmergency);
    const availableBeds = Math.max(0, facility.capacity - facility.current_load);
    const occupancyRatePct = facility.capacity > 0 ? (facility.current_load / facility.capacity) * 100 : 100;

    // Check specialties
    const servicesForFacility = facilityServices
      .filter((s) => s.facility_id === facility.id && s.available)
      .map((s) => s.service_name);

    const hasRequiredSpecialty =
      !criteria.requiredSpecialty ||
      criteria.requiredSpecialty === 'General Medicine' ||
      servicesForFacility.some((s) =>
        s.toLowerCase().includes(criteria.requiredSpecialty.toLowerCase())
      ) ||
      (criteria.requireIcuOrVentilator && facility.type === 'Medical College Hospital');

    // SCORING ALGORITHM (0 - 100 points)
    // 1. Specialty Capability (35 pts)
    let specialtyScore = 0;
    if (hasRequiredSpecialty) {
      specialtyScore = 35;
      if (facility.type === 'Medical College Hospital' && criteria.priority === 'Emergency') {
        specialtyScore += 5; // Bonus for tertiary capability on emergency
      }
    } else {
      specialtyScore = 5; // Major penalty if required specialty is missing
    }

    // 2. Bed & Critical Care Capacity (30 pts)
    let capacityScore = 0;
    if (occupancyRatePct < 70) {
      capacityScore = 30;
    } else if (occupancyRatePct < 85) {
      capacityScore = 20;
    } else if (occupancyRatePct < 95) {
      capacityScore = 10;
    } else {
      capacityScore = 0; // Near saturated
    }

    // 3. Proximity & Travel Time (35 pts)
    let proximityScore = 0;
    if (distanceKm < 10) {
      proximityScore = 35;
    } else if (distanceKm < 25) {
      proximityScore = 25;
    } else if (distanceKm < 45) {
      proximityScore = 15;
    } else {
      proximityScore = Math.max(2, 35 - Math.round(distanceKm * 0.5));
    }

    // Priority Tier Adjustments
    if (criteria.priority === 'Emergency') {
      // In emergency, travel time matters heavily, but tertiary capabilities are essential
      if (facility.type === 'PHC') {
        proximityScore = Math.min(proximityScore, 5); // PHC cannot handle true emergency referrals
      }
    }

    const totalScore = Math.min(100, Math.max(0, specialtyScore + capacityScore + proximityScore));

    // Suitability reason generation
    let suitabilityReason = '';
    if (criteria.priority === 'Emergency' && facility.type === 'Medical College Hospital') {
      suitabilityReason = `Optimal tertiary trauma/ICU capability (${availableBeds} beds open, ~${estimatedTravelMinutes}m transit)`;
    } else if (hasRequiredSpecialty && occupancyRatePct < 75) {
      suitabilityReason = `Direct ${criteria.requiredSpecialty} availability with strong bed headroom (${Math.round(100 - occupancyRatePct)}% free)`;
    } else if (!hasRequiredSpecialty) {
      suitabilityReason = `Limited: ${criteria.requiredSpecialty} not fully staffed at this center`;
    } else {
      suitabilityReason = `Acceptable secondary center (~${estimatedTravelMinutes} min transit)`;
    }

    // Recommended Transport
    let recommendedTransport: TransportArrangement = '104 Mobile Medical Van';
    if (criteria.priority === 'Emergency') {
      recommendedTransport = '108 Emergency Ambulance';
    } else if (criteria.priority === 'Urgent') {
      recommendedTransport = distanceKm > 20 ? '108 Emergency Ambulance' : '104 Mobile Medical Van';
    } else if (distanceKm < 8) {
      recommendedTransport = 'Local Govt Transport';
    }

    const estimated108ResponseMinutes = Math.max(6, Math.round(distanceKm * 0.4 + 4));

    return {
      facility,
      distanceKm,
      estimatedTravelMinutes,
      availableBeds,
      occupancyRatePct: Math.round(occupancyRatePct),
      hasRequiredSpecialty,
      specialtyServices: servicesForFacility,
      totalScore,
      suitabilityReason,
      isRecommended: false,
      estimated108ResponseMinutes,
      recommendedTransport,
    };
  });

  // Sort descending by total score
  const sorted = scoredFacilities.sort((a, b) => b.totalScore - a.totalScore);
  if (sorted.length > 0) {
    sorted[0].isRecommended = true;
  }

  return sorted;
}

/**
 * Mock Seed Data for Rural Tele-Triage Records
 */
export const DEFAULT_TELE_TRIAGE_RECORDS: TeleTriageRecord[] = [
  {
    id: 'tt-001',
    triageCode: 'TRI-RUR-8801',
    patientId: 'pat-001',
    patientName: 'Ravi Kumar',
    patientAge: 45,
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    patientAddress: 'H.No 3-45, Ramachandrapuram Village, Sangareddy Dist',
    villageName: 'Ramachandrapuram',
    subCenterOrWard: 'Sub-Center II',
    district: 'Sangareddy',
    workerId: 'hw-asha-04',
    workerName: 'Lakshmi Devi',
    workerRole: 'ASHA',
    chiefComplaint: 'Acute chest tightness with sweating, radiating to jaw for 2 hours',
    symptoms: ['Chest Pain', 'Diaphoresis', 'Shortness of Breath', 'Nausea'],
    symptomDuration: '2.5 hours',
    vitals: {
      temperatureF: 98.6,
      systolicBp: 154,
      diastolicBp: 96,
      heartRateBpm: 104,
      spo2Pct: 94,
      respiratoryRateBpm: 24,
      bloodGlucoseMgDl: 168,
      capturedAt: '2026-09-01T08:30:00Z',
    },
    priority: 'Emergency',
    suspectedCondition: 'Acute Coronary Syndrome (STEMI)',
    diagnosticMedia: [
      {
        id: 'dm-01',
        type: 'ecg_strip',
        title: 'Single-Lead Portable ECG',
        url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=60',
        caption: 'ST segment elevation observed in lead II/V2 equivalent',
        fileSizeBytes: 420000,
        capturedAt: '2026-09-01T08:32:00Z',
        isUploaded: true,
      },
    ],
    fieldNotes: 'Sublingual Sorbitrate 5mg given. Aspirin 325mg chewed. Awaiting tele-cardiologist confirmation.',
    specialistNotes: 'Confirmed STEMI pattern. Immediate 108 transfer to GMC Cath Lab with Heparin bolus.',
    assignedSpecialistId: 'doc-cardio-01',
    assignedSpecialistName: 'Dr. S. K. Murthy (Cardiology)',
    assignedSpecialty: 'Cardiology',
    recommendedAction: 'Ambulance 108 Evacuation',
    syncStatus: 'Synced',
    createdAt: '2026-09-01T08:30:00Z',
    reviewedAt: '2026-09-01T08:38:00Z',
  },
  {
    id: 'tt-002',
    triageCode: 'TRI-RUR-8802',
    patientId: 'pat-002',
    patientName: 'Sunita Bai',
    patientAge: 27,
    patientGender: 'Female',
    patientPhone: '+91 98480 11223',
    patientAddress: 'H.No 1-12, Borabanda Tanda, Medak Dist',
    villageName: 'Borabanda Tanda',
    subCenterOrWard: 'Ward 3',
    district: 'Medak',
    workerId: 'hw-anm-02',
    workerName: 'Anita Kumari',
    workerRole: 'ANM',
    chiefComplaint: 'High fever for 4 days with retro-orbital pain and petechiae on arms',
    symptoms: ['High Fever (>103°F)', 'Retro-orbital Headache', 'Severe Arthralgia', 'Petechial Rash'],
    symptomDuration: '4 days',
    vitals: {
      temperatureF: 103.2,
      systolicBp: 102,
      diastolicBp: 68,
      heartRateBpm: 112,
      spo2Pct: 97,
      respiratoryRateBpm: 20,
      capturedAt: '2026-09-01T09:15:00Z',
    },
    priority: 'Urgent',
    suspectedCondition: 'Dengue Hemorrhagic Fever with Thrombocytopenia',
    diagnosticMedia: [
      {
        id: 'dm-02',
        type: 'skin_lesion',
        title: 'Forearm Petechial Rash',
        url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=60',
        caption: 'Multiple petechial hemorrhages after tourniquet test',
        fileSizeBytes: 650000,
        capturedAt: '2026-09-01T09:18:00Z',
        isUploaded: true,
      },
    ],
    fieldNotes: 'Tourniquet test positive. Rapid NS1 Ag Positive. Fluid replacement started with ORS.',
    specialistNotes: 'Platelet estimation urgently required. Admit to Area Hospital isolation ward.',
    assignedSpecialistId: 'doc-med-02',
    assignedSpecialistName: 'Dr. Aruna Reddy (Internal Med)',
    assignedSpecialty: 'Internal Medicine',
    recommendedAction: 'Urgent Tertiary Referral',
    syncStatus: 'Synced',
    createdAt: '2026-09-01T09:15:00Z',
    reviewedAt: '2026-09-01T09:22:00Z',
  },
  {
    id: 'tt-003',
    triageCode: 'TRI-RUR-8803',
    patientId: 'pat-003',
    patientName: 'Malleshappa Goud',
    patientAge: 62,
    patientGender: 'Male',
    patientPhone: '+91 97000 55443',
    patientAddress: 'Village Palamakula, Shamshabad Rural',
    villageName: 'Palamakula',
    subCenterOrWard: 'Block C',
    district: 'Ranga Reddy',
    workerId: 'hw-cho-01',
    workerName: 'Venkatesh Babu',
    workerRole: 'CHO',
    chiefComplaint: 'Uncontrolled chronic cough with low grade evening fever for 3 weeks',
    symptoms: ['Productive Cough > 3 weeks', 'Evening Pyrexia', 'Weight Loss', 'Night Sweats'],
    symptomDuration: '21 days',
    vitals: {
      temperatureF: 99.8,
      systolicBp: 126,
      diastolicBp: 78,
      heartRateBpm: 84,
      spo2Pct: 96,
      respiratoryRateBpm: 18,
      capturedAt: '2026-09-01T10:00:00Z',
    },
    priority: 'Moderate',
    suspectedCondition: 'Pulmonary Tuberculosis (NTEP)',
    diagnosticMedia: [],
    fieldNotes: 'Sputum container provided for CBNAAT sample collection.',
    assignedSpecialty: 'Pulmonology / NTEP',
    recommendedAction: 'PHC Day Care',
    syncStatus: 'Pending',
    createdAt: '2026-09-01T10:00:00Z',
  },
];

/**
 * Mock Seed Data for Point-of-Care Diagnostic Tests
 */
export const DEFAULT_POC_DIAGNOSTICS: PoCDiagnosticTest[] = [
  {
    id: 'poc-001',
    testCode: 'POC-MAL-4101',
    patientId: 'pat-001',
    patientName: 'Ravi Kumar',
    patientAge: 45,
    patientGender: 'Male',
    villageName: 'Ramachandrapuram',
    testType: 'Malaria Rapid Antigen (Pf/Pv)',
    kitManufacturer: 'SD Biosensor Standard Q',
    kitBatchNumber: 'MAL-2026-08B',
    expiryDate: '2027-12-31',
    result: 'Negative',
    conductedByWorker: 'Lakshmi Devi',
    workerRole: 'ASHA',
    facilityOrVillage: 'Ramachandrapuram Sub-Center',
    conductedAt: '2026-09-01T08:35:00Z',
    sampleTransportStatus: 'Not Applicable',
    syncStatus: 'Synced',
    clinicalImplication: 'Plasmodium Falciparum / Vivax antigen not detected. Rule out acute malaria.',
  },
  {
    id: 'poc-002',
    testCode: 'POC-DEN-4102',
    patientId: 'pat-002',
    patientName: 'Sunita Bai',
    patientAge: 27,
    patientGender: 'Female',
    villageName: 'Borabanda Tanda',
    testType: 'Dengue NS1 / IgM Rapid',
    kitManufacturer: 'J. Mitra & Co. Tri-Line',
    kitBatchNumber: 'DEN-9941X',
    expiryDate: '2027-06-30',
    result: 'Positive',
    quantitativeValue: 'NS1 Ag (+) Reactive, IgM (-)',
    referenceRange: 'Non-Reactive',
    conductedByWorker: 'Anita Kumari',
    workerRole: 'ANM',
    facilityOrVillage: 'Borabanda Health Post',
    conductedAt: '2026-09-01T09:20:00Z',
    sampleTransportStatus: 'In Cold Chain Transport',
    coldChainTempCelsius: 4.2,
    coldChainTargetMinCelsius: 2,
    coldChainTargetMaxCelsius: 8,
    syncStatus: 'Synced',
    clinicalImplication: 'Acute early-phase Dengue viremia confirmed. Platelet serial monitoring advised.',
    statutoryFlagged: true,
  },
  {
    id: 'poc-003',
    testCode: 'POC-GLU-4103',
    patientId: 'pat-003',
    patientName: 'Malleshappa Goud',
    patientAge: 62,
    patientGender: 'Male',
    villageName: 'Palamakula',
    testType: 'Random Blood Glucose (RBG)',
    kitManufacturer: 'Accu-Chek Instant Strip',
    kitBatchNumber: 'GLU-8812B',
    expiryDate: '2028-01-15',
    result: 'Elevated',
    quantitativeValue: '214 mg/dL',
    referenceRange: '70 - 140 mg/dL',
    conductedByWorker: 'Venkatesh Babu',
    workerRole: 'CHO',
    facilityOrVillage: 'Palamakula Ayushman Arogya Mandir',
    conductedAt: '2026-09-01T10:05:00Z',
    sampleTransportStatus: 'Not Applicable',
    syncStatus: 'Synced',
    clinicalImplication: 'Hyperglycemia detected. Schedule fasting blood glucose and HbA1c workup.',
  },
  {
    id: 'poc-004',
    testCode: 'POC-HB-4104',
    patientId: 'pat-004',
    patientName: 'Kavitha M.',
    patientAge: 22,
    patientGender: 'Female',
    villageName: 'Kondapur Tanda',
    testType: 'Hemoglobin (Hb) Meter',
    kitManufacturer: 'HemoCue Hb 201+',
    kitBatchNumber: 'HB-7740Q',
    expiryDate: '2027-10-31',
    result: 'Critical',
    quantitativeValue: '6.8 g/dL',
    referenceRange: '12.0 - 15.5 g/dL',
    conductedByWorker: 'Lakshmi Devi',
    workerRole: 'ASHA',
    facilityOrVillage: 'Kondapur Anganwadi',
    conductedAt: '2026-09-01T10:45:00Z',
    sampleTransportStatus: 'Not Applicable',
    syncStatus: 'Pending',
    clinicalImplication: 'Severe Nutritional Anemia in antenatal mother. Requires urgent IV Iron Sucrose at DH.',
    statutoryFlagged: true,
  },
];

/**
 * Mock Seed Data for Priority Referral Requests
 */
export const DEFAULT_REFERRAL_REQUESTS: ReferralRequest[] = [
  {
    id: 'ref-req-001',
    referralCode: 'REF-EMG-9001',
    patientId: 'pat-001',
    patientName: 'Ravi Kumar',
    patientAge: 45,
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    originFacilityId: 'fac-phc-01',
    originFacilityName: 'PHC Kukatpally / Ramachandrapuram',
    originVillageOrDistrict: 'Sangareddy Rural',
    destinationFacilityId: 'fac-gmc-03',
    destinationFacilityName: 'Government Medical College Hospital',
    specialtyRequired: 'Cardiology (Cath Lab)',
    priority: 'Emergency',
    clinicalSummary: 'STEMI anterior wall with hemodynamic instability. Tele-ECG validated.',
    provisionalDiagnosis: 'Acute Anterior STEMI',
    transportArrangement: '108 Emergency Ambulance',
    transportVehicleNumber: 'TS-09-EM-1082',
    transportDriverContact: '+91 98480 00108',
    transportEtaMinutes: 14,
    allocatedBedType: 'ICU',
    bedReservationCode: 'BED-GMC-ICU-08',
    specialistDoctorName: 'Dr. S. K. Murthy',
    specialistContact: '040-24600003 (Ext 102)',
    status: 'Transport In Transit',
    syncStatus: 'Synced',
    createdAt: '2026-09-01T08:35:00Z',
    updatedAt: '2026-09-01T08:42:00Z',
  },
  {
    id: 'ref-req-002',
    referralCode: 'REF-URG-9002',
    patientId: 'pat-002',
    patientName: 'Sunita Bai',
    patientAge: 27,
    patientGender: 'Female',
    patientPhone: '+91 98480 11223',
    originFacilityId: 'fac-phc-01',
    originFacilityName: 'Borabanda Sub-Center',
    originVillageOrDistrict: 'Medak Dist',
    destinationFacilityId: 'fac-dh-02',
    destinationFacilityName: 'District Hospital',
    specialtyRequired: 'Internal Medicine (Fever HDU)',
    priority: 'Urgent',
    clinicalSummary: 'Rapid NS1 Positive Dengue fever with petechial bleeding and thrombocytopenia.',
    provisionalDiagnosis: 'Dengue Hemorrhagic Fever',
    transportArrangement: '104 Mobile Medical Van',
    transportVehicleNumber: 'TS-07-MV-1044',
    transportEtaMinutes: 28,
    allocatedBedType: 'High Dependency Unit (HDU)',
    bedReservationCode: 'BED-DH-HDU-04',
    specialistDoctorName: 'Dr. Aruna Reddy',
    status: 'Specialist Accepted',
    syncStatus: 'Synced',
    createdAt: '2026-09-01T09:25:00Z',
    updatedAt: '2026-09-01T09:30:00Z',
  },
  {
    id: 'ref-req-003',
    referralCode: 'REF-MOD-9003',
    patientId: 'pat-003',
    patientName: 'Malleshappa Goud',
    patientAge: 62,
    patientGender: 'Male',
    patientPhone: '+91 97000 55443',
    originFacilityId: 'fac-phc-01',
    originFacilityName: 'Palamakula Ayushman Mandir',
    originVillageOrDistrict: 'Ranga Reddy',
    destinationFacilityId: 'fac-ah-04',
    destinationFacilityName: 'Area Hospital Miyapur',
    specialtyRequired: 'Pulmonology',
    priority: 'Moderate',
    clinicalSummary: 'Chronic cough > 3 weeks for CBNAAT cartridge diagnosis and chest X-ray workup.',
    provisionalDiagnosis: 'Suspected Pulmonary TB',
    transportArrangement: 'Local Govt Transport',
    allocatedBedType: 'General Ward',
    status: 'Initiated',
    syncStatus: 'Pending',
    createdAt: '2026-09-01T10:10:00Z',
    updatedAt: '2026-09-01T10:10:00Z',
  },
];

/**
 * Mock Seed Data for Mobile Health Units
 */
export const DEFAULT_MOBILE_UNITS: MobileUnit[] = [
  {
    id: 'mmu-001',
    unitCode: 'MMU-TEL-01',
    name: 'Dhanvantari Rural Mobile Clinic 01',
    vehicleRegistration: 'TS-09-HC-4001',
    baseHospital: 'District Hospital Sangareddy',
    currentLocation: {
      lat: 17.512,
      lng: 78.348,
      village: 'Ramachandrapuram Rural',
      landmark: 'Near Gram Panchayat Office',
    },
    status: 'Camp in Progress',
    onDutySpecialists: [
      {
        id: 'spec-01',
        name: 'Dr. Harish Varma',
        specialty: 'General Physician & Diabetologist',
        qualification: 'MBBS, MD (Gen Med)',
        phone: '+91 94401 22334',
        languages: ['Telugu', 'Hindi', 'English'],
      },
      {
        id: 'spec-02',
        name: 'Dr. Deepa Nair',
        specialty: 'Obstetrician & Gynecologist',
        qualification: 'MBBS, DGO',
        phone: '+91 94401 55667',
        languages: ['Telugu', 'Malayalam', 'English'],
      },
    ],
    operatingHours: '08:00 AM - 04:30 PM',
    todayRouteSchedule: [
      {
        id: 'rs-01',
        timeWindow: '08:30 - 11:30 AM',
        village: 'Ramachandrapuram',
        landmark: 'Panchayat Bhavan',
        expectedPatients: 45,
        servicesOffered: ['NCD Screening', 'ANC Checkup', 'PoC Labs', 'Free Pharmacy'],
        status: 'In Progress',
      },
      {
        id: 'rs-02',
        timeWindow: '12:00 - 02:30 PM',
        village: 'Kondapur Tanda',
        landmark: 'Primary School Grounds',
        expectedPatients: 35,
        servicesOffered: ['Pediatric Immunization', 'Fever Triage', 'Tele-Consultation'],
        status: 'Scheduled',
      },
      {
        id: 'rs-03',
        timeWindow: '03:00 - 04:30 PM',
        village: 'Maddur Hamlet',
        landmark: 'Community Water Tank',
        expectedPatients: 20,
        servicesOffered: ['Geriatric Care', 'Refill Dispensing'],
        status: 'Scheduled',
      },
    ],
    equipmentInventory: [
      { id: 'eq-01', name: 'Digital 12-Lead Tele-ECG Machine', category: 'Diagnostic', status: 'Operational', quantity: 1, unit: 'Unit' },
      { id: 'eq-02', name: 'Rapid Malaria / Dengue Kit Packs', category: 'Diagnostic', status: 'Operational', quantity: 80, unit: 'Tests' },
      { id: 'eq-03', name: 'Hemoglobinometer & Strips', category: 'Diagnostic', status: 'Operational', quantity: 150, unit: 'Strips' },
      { id: 'eq-04', name: 'Portable Ultrasound Probe (Point-of-Care)', category: 'Diagnostic', status: 'Operational', quantity: 1, unit: 'Probe' },
      { id: 'eq-05', name: 'High-Flow Oxygen Concentrator (10L)', category: 'Surgical', status: 'Operational', quantity: 2, unit: 'Cylinders' },
      { id: 'eq-06', name: 'Essential NCD Medicine Kit', category: 'Pharmacy', status: 'Operational', quantity: 300, unit: 'Courses' },
    ],
    telemedicineBandwidth: 'Satellite VSAT',
    batterySolarStatusPct: 92,
    oxygenCylindersAboard: 2,
    contactNumber: '+91 94401 88990',
    distanceFromUserKm: 3.4,
  },
  {
    id: 'mmu-002',
    unitCode: 'MMU-TEL-02',
    name: 'Arogya Vahini Mobile Emergency Unit 02',
    vehicleRegistration: 'TS-08-HC-4002',
    baseHospital: 'Government Medical College Hospital',
    currentLocation: {
      lat: 17.432,
      lng: 78.411,
      village: 'Borabanda Outskirts',
      landmark: 'Opposite State Water Pump',
    },
    status: 'Active on Route',
    onDutySpecialists: [
      {
        id: 'spec-03',
        name: 'Dr. Mohammed Tariq',
        specialty: 'Emergency Physician',
        qualification: 'MBBS, MEM (Emergency)',
        phone: '+91 94402 33445',
        languages: ['Telugu', 'Urdu', 'English'],
      },
      {
        id: 'spec-04',
        name: 'Sister Nirmala',
        specialty: 'Critical Care Nurse',
        qualification: 'B.Sc Nursing',
        phone: '+91 94402 88991',
        languages: ['Telugu', 'English'],
      },
    ],
    operatingHours: '07:30 AM - 06:00 PM',
    todayRouteSchedule: [
      {
        id: 'rs-04',
        timeWindow: '08:00 - 10:30 AM',
        village: 'Borabanda Tanda',
        landmark: 'Anganwadi Center 4',
        expectedPatients: 50,
        servicesOffered: ['Fever Surveillance', 'Epidemic Screening', 'PoC Dengue'],
        status: 'Completed',
      },
      {
        id: 'rs-05',
        timeWindow: '11:00 - 02:00 PM',
        village: 'Allwyn Colony Rural',
        landmark: 'Bus Stop Junction',
        expectedPatients: 40,
        servicesOffered: ['Emergency Triage', 'Nebulization', 'IV Fluids'],
        status: 'In Progress',
      },
      {
        id: 'rs-06',
        timeWindow: '02:30 - 05:30 PM',
        village: 'Hafeezpet Slum Sector',
        landmark: 'Community Hall',
        expectedPatients: 60,
        servicesOffered: ['General Outpatient', 'Tele-Consultation'],
        status: 'Scheduled',
      },
    ],
    equipmentInventory: [
      { id: 'eq-07', name: 'Automated External Defibrillator (AED)', category: 'Surgical', status: 'Operational', quantity: 1, unit: 'Unit' },
      { id: 'eq-08', name: 'Point-of-Care Blood Gas Analyzer', category: 'Diagnostic', status: 'Operational', quantity: 1, unit: 'Device' },
      { id: 'eq-09', name: 'Cold Chain Vaccine / Serum Carrier (2-8°C)', category: 'Pharmacy', status: 'Operational', quantity: 2, unit: 'Boxes' },
      { id: 'eq-10', name: 'Satellite VSAT Tele-Medicine Terminal', category: 'Telemedicine', status: 'Operational', quantity: 1, unit: 'Terminal' },
    ],
    telemedicineBandwidth: '4G LTE',
    batterySolarStatusPct: 78,
    oxygenCylindersAboard: 3,
    contactNumber: '+91 94402 99001',
    distanceFromUserKm: 5.8,
  },
];
