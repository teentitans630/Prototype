import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Patient,
  VitalsRecord,
  MedicalHistoryItem,
  Appointment,
  SyncStatus,
  VitalStatus,
  MedicalRecordStatus,
  AppointmentStatus,
  VitalThresholds,
  VitalAlert,
  VitalMetricAssessment,
} from '../types/patient';

export const DEFAULT_VITAL_THRESHOLDS: VitalThresholds = {
  bpSystolicElevated: 120,
  bpSystolicWarning: 140,
  bpSystolicCritical: 160,
  bpDiastolicElevated: 80,
  bpDiastolicWarning: 90,
  bpDiastolicCritical: 100,

  hrLowCritical: 45,
  hrLowWarning: 55,
  hrHighWarning: 100,
  hrHighCritical: 120,

  spo2CriticalMin: 90,
  spo2WarningMin: 94,

  tempLowWarning: 36.0,
  tempHighWarning: 38.0,
  tempHighCritical: 39.0,

  respRateLowWarning: 12,
  respRateHighWarning: 24,

  presetName: 'Standard Adult (AHA/WHO)',
};

export const CLINICAL_PRESETS: Record<string, { name: string; description: string; thresholds: VitalThresholds }> = {
  standard: {
    name: 'Standard Adult (AHA/WHO)',
    description: 'Standard clinical thresholds based on WHO and AHA guidelines for general adult triage.',
    thresholds: { ...DEFAULT_VITAL_THRESHOLDS, presetName: 'Standard Adult (AHA/WHO)' },
  },
  hypertensive: {
    name: 'Hypertensive Risk / Strict BP',
    description: 'Tighter blood pressure thresholds for managing chronic hypertension and cardiovascular risk.',
    thresholds: {
      ...DEFAULT_VITAL_THRESHOLDS,
      bpSystolicElevated: 115,
      bpSystolicWarning: 130,
      bpSystolicCritical: 150,
      bpDiastolicElevated: 75,
      bpDiastolicWarning: 85,
      bpDiastolicCritical: 95,
      hrHighWarning: 95,
      presetName: 'Hypertensive Risk / Strict BP',
    },
  },
  icu_sensitive: {
    name: 'Acute Care / High Sensitivity',
    description: 'Sensitive thresholds for early detection of hemodynamic decompensation and rapid response triggers.',
    thresholds: {
      ...DEFAULT_VITAL_THRESHOLDS,
      bpSystolicElevated: 110,
      bpSystolicWarning: 135,
      bpSystolicCritical: 150,
      bpDiastolicElevated: 75,
      bpDiastolicWarning: 85,
      bpDiastolicCritical: 95,
      hrLowWarning: 60,
      hrHighWarning: 90,
      hrHighCritical: 110,
      spo2WarningMin: 95,
      spo2CriticalMin: 92,
      tempHighWarning: 37.8,
      tempHighCritical: 38.5,
      respRateLowWarning: 14,
      respRateHighWarning: 22,
      presetName: 'Acute Care / High Sensitivity',
    },
  },
  geriatric: {
    name: 'Geriatric Care Protocol',
    description: 'Adjusted parameters for elderly patients accounting for arterial stiffness and altered baselines.',
    thresholds: {
      ...DEFAULT_VITAL_THRESHOLDS,
      bpSystolicElevated: 130,
      bpSystolicWarning: 150,
      bpSystolicCritical: 170,
      bpDiastolicElevated: 85,
      bpDiastolicWarning: 95,
      bpDiastolicCritical: 105,
      hrLowCritical: 45,
      hrHighWarning: 95,
      spo2WarningMin: 93,
      spo2CriticalMin: 89,
      tempLowWarning: 35.8,
      tempHighWarning: 37.7,
      tempHighCritical: 38.4,
      presetName: 'Geriatric Care Protocol',
    },
  },
};

// Helper to determine vital status automatically with configured thresholds
export function calculateVitalStatus(
  bpSys: number,
  bpDia: number,
  hr: number,
  spo2: number,
  temp: number,
  thresholds: VitalThresholds = DEFAULT_VITAL_THRESHOLDS
): VitalStatus {
  // Check Critical
  if (
    bpSys >= thresholds.bpSystolicCritical ||
    bpDia >= thresholds.bpDiastolicCritical ||
    spo2 < thresholds.spo2CriticalMin ||
    temp >= thresholds.tempHighCritical ||
    hr > thresholds.hrHighCritical ||
    hr < thresholds.hrLowCritical
  ) {
    return 'Critical';
  }

  // Check Warning
  if (
    bpSys >= thresholds.bpSystolicWarning ||
    bpDia >= thresholds.bpDiastolicWarning ||
    spo2 < thresholds.spo2WarningMin ||
    temp >= thresholds.tempHighWarning ||
    temp < thresholds.tempLowWarning ||
    hr > thresholds.hrHighWarning ||
    hr < thresholds.hrLowWarning
  ) {
    return 'Warning';
  }

  // Check Elevated
  if (
    bpSys >= thresholds.bpSystolicElevated ||
    bpDia >= thresholds.bpDiastolicElevated ||
    temp > 37.5
  ) {
    return 'Elevated';
  }

  return 'Normal';
}

// Evaluate detailed metric assessments against thresholds
export function evaluateAllVitalMetrics(
  vitals: VitalsRecord,
  thresholds: VitalThresholds = DEFAULT_VITAL_THRESHOLDS
): {
  bp: VitalMetricAssessment;
  hr: VitalMetricAssessment;
  spo2: VitalMetricAssessment;
  temp: VitalMetricAssessment;
  resp?: VitalMetricAssessment;
  alerts: VitalAlert[];
  overallStatus: VitalStatus;
} {
  const alerts: VitalAlert[] = [];

  // Blood pressure evaluation
  let bpStatus: VitalStatus = 'Normal';
  let bpLabel = 'Optimal';
  let bpColor = 'text-emerald-700';
  let bpBg = 'bg-emerald-50';
  let bpBorder = 'border-emerald-200';
  let bpBreached = false;
  let bpAlertMsg: string | undefined;

  if (vitals.bloodPressureSystolic >= thresholds.bpSystolicCritical || vitals.bloodPressureDiastolic >= thresholds.bpDiastolicCritical) {
    bpStatus = 'Critical';
    bpLabel = 'Critical HTN';
    bpColor = 'text-red-700';
    bpBg = 'bg-red-50';
    bpBorder = 'border-red-300';
    bpBreached = true;
    bpAlertMsg = `Exceeds critical limit (Sys ≥${thresholds.bpSystolicCritical} or Dia ≥${thresholds.bpDiastolicCritical})`;
    alerts.push({
      metric: 'bp',
      severity: 'Critical',
      title: 'Critical Blood Pressure Alert',
      message: `BP ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg exceeds critical threshold (${thresholds.bpSystolicCritical}/${thresholds.bpDiastolicCritical} mmHg). Immediate intervention indicated.`,
      currentValue: `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}`,
      thresholdValue: `${thresholds.bpSystolicCritical}/${thresholds.bpDiastolicCritical}`,
    });
  } else if (vitals.bloodPressureSystolic >= thresholds.bpSystolicWarning || vitals.bloodPressureDiastolic >= thresholds.bpDiastolicWarning) {
    bpStatus = 'Warning';
    bpLabel = 'Stage 1/2 HTN';
    bpColor = 'text-amber-700';
    bpBg = 'bg-amber-50';
    bpBorder = 'border-amber-300';
    bpBreached = true;
    bpAlertMsg = `Exceeds warning threshold (Sys ≥${thresholds.bpSystolicWarning} or Dia ≥${thresholds.bpDiastolicWarning})`;
    alerts.push({
      metric: 'bp',
      severity: 'Warning',
      title: 'Elevated Blood Pressure Warning',
      message: `BP ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg exceeds warning threshold (${thresholds.bpSystolicWarning}/${thresholds.bpDiastolicWarning} mmHg).`,
      currentValue: `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}`,
      thresholdValue: `${thresholds.bpSystolicWarning}/${thresholds.bpDiastolicWarning}`,
    });
  } else if (vitals.bloodPressureSystolic >= thresholds.bpSystolicElevated || vitals.bloodPressureDiastolic >= thresholds.bpDiastolicElevated) {
    bpStatus = 'Elevated';
    bpLabel = 'Prehypertensive';
    bpColor = 'text-orange-700';
    bpBg = 'bg-orange-50';
    bpBorder = 'border-orange-200';
    bpBreached = true;
    bpAlertMsg = `Exceeds optimal baseline (Sys ≥${thresholds.bpSystolicElevated})`;
  }

  // Heart rate evaluation
  let hrStatus: VitalStatus = 'Normal';
  let hrLabel = 'Normal Rhythm';
  let hrColor = 'text-emerald-700';
  let hrBg = 'bg-emerald-50';
  let hrBorder = 'border-emerald-200';
  let hrBreached = false;
  let hrAlertMsg: string | undefined;

  if (vitals.heartRate >= thresholds.hrHighCritical) {
    hrStatus = 'Critical';
    hrLabel = 'Severe Tachycardia';
    hrColor = 'text-red-700';
    hrBg = 'bg-red-50';
    hrBorder = 'border-red-300';
    hrBreached = true;
    hrAlertMsg = `Heart rate ≥${thresholds.hrHighCritical} BPM critical limit`;
    alerts.push({
      metric: 'hr',
      severity: 'Critical',
      title: 'Critical Tachycardia Alert',
      message: `Pulse of ${vitals.heartRate} BPM is dangerously high (Critical threshold: >${thresholds.hrHighCritical} BPM).`,
      currentValue: vitals.heartRate,
      thresholdValue: thresholds.hrHighCritical,
    });
  } else if (vitals.heartRate <= thresholds.hrLowCritical) {
    hrStatus = 'Critical';
    hrLabel = 'Severe Bradycardia';
    hrColor = 'text-red-700';
    hrBg = 'bg-red-50';
    hrBorder = 'border-red-300';
    hrBreached = true;
    hrAlertMsg = `Heart rate ≤${thresholds.hrLowCritical} BPM critical limit`;
    alerts.push({
      metric: 'hr',
      severity: 'Critical',
      title: 'Critical Bradycardia Alert',
      message: `Pulse of ${vitals.heartRate} BPM is critically depressed (Critical low: <${thresholds.hrLowCritical} BPM).`,
      currentValue: vitals.heartRate,
      thresholdValue: thresholds.hrLowCritical,
    });
  } else if (vitals.heartRate >= thresholds.hrHighWarning) {
    hrStatus = 'Warning';
    hrLabel = 'Tachycardia';
    hrColor = 'text-amber-700';
    hrBg = 'bg-amber-50';
    hrBorder = 'border-amber-300';
    hrBreached = true;
    hrAlertMsg = `Pulse exceeds warning threshold (>${thresholds.hrHighWarning} BPM)`;
    alerts.push({
      metric: 'hr',
      severity: 'Warning',
      title: 'Tachycardia Warning',
      message: `Heart rate of ${vitals.heartRate} BPM exceeds warning threshold (${thresholds.hrHighWarning} BPM).`,
      currentValue: vitals.heartRate,
      thresholdValue: thresholds.hrHighWarning,
    });
  } else if (vitals.heartRate <= thresholds.hrLowWarning) {
    hrStatus = 'Warning';
    hrLabel = 'Bradycardia';
    hrColor = 'text-blue-700';
    hrBg = 'bg-blue-50';
    hrBorder = 'border-blue-300';
    hrBreached = true;
    hrAlertMsg = `Pulse below warning threshold (<${thresholds.hrLowWarning} BPM)`;
    alerts.push({
      metric: 'hr',
      severity: 'Warning',
      title: 'Bradycardia Warning',
      message: `Heart rate of ${vitals.heartRate} BPM is below expected baseline (<${thresholds.hrLowWarning} BPM).`,
      currentValue: vitals.heartRate,
      thresholdValue: thresholds.hrLowWarning,
    });
  }

  // SpO2 evaluation
  let spo2Status: VitalStatus = 'Normal';
  let spo2Label = 'Adequate Oxygenation';
  let spo2Color = 'text-emerald-700';
  let spo2Bg = 'bg-emerald-50';
  let spo2Border = 'border-emerald-200';
  let spo2Breached = false;
  let spo2AlertMsg: string | undefined;

  if (vitals.spo2 <= thresholds.spo2CriticalMin) {
    spo2Status = 'Critical';
    spo2Label = 'Critical Hypoxemia';
    spo2Color = 'text-red-700';
    spo2Bg = 'bg-red-50';
    spo2Border = 'border-red-300';
    spo2Breached = true;
    spo2AlertMsg = `SpO2 ≤${thresholds.spo2CriticalMin}% requires oxygen therapy`;
    alerts.push({
      metric: 'spo2',
      severity: 'Critical',
      title: 'Critical Hypoxia Alert',
      message: `SpO2 saturation is ${vitals.spo2}% (Critical threshold: ≤${thresholds.spo2CriticalMin}%). Administer supplemental O2 and evaluate airway immediately.`,
      currentValue: `${vitals.spo2}%`,
      thresholdValue: `≤${thresholds.spo2CriticalMin}%`,
    });
  } else if (vitals.spo2 <= thresholds.spo2WarningMin) {
    spo2Status = 'Warning';
    spo2Label = 'Sub-optimal Saturation';
    spo2Color = 'text-amber-700';
    spo2Bg = 'bg-amber-50';
    spo2Border = 'border-amber-300';
    spo2Breached = true;
    spo2AlertMsg = `SpO2 ≤${thresholds.spo2WarningMin}% below safe target`;
    alerts.push({
      metric: 'spo2',
      severity: 'Warning',
      title: 'Low Oxygen Saturation Warning',
      message: `SpO2 of ${vitals.spo2}% is below warning threshold (${thresholds.spo2WarningMin}%).`,
      currentValue: `${vitals.spo2}%`,
      thresholdValue: `≤${thresholds.spo2WarningMin}%`,
    });
  }

  // Temperature evaluation
  let tempStatus: VitalStatus = 'Normal';
  let tempLabel = 'Normothermic';
  let tempColor = 'text-emerald-700';
  let tempBg = 'bg-emerald-50';
  let tempBorder = 'border-emerald-200';
  let tempBreached = false;
  let tempAlertMsg: string | undefined;

  if (vitals.temperature >= thresholds.tempHighCritical) {
    tempStatus = 'Critical';
    tempLabel = 'High Pyrexia / Hyperthermia';
    tempColor = 'text-red-700';
    tempBg = 'bg-red-50';
    tempBorder = 'border-red-300';
    tempBreached = true;
    tempAlertMsg = `Temp ≥${thresholds.tempHighCritical}°C severe fever`;
    alerts.push({
      metric: 'temp',
      severity: 'Critical',
      title: 'High Pyrexia Alert',
      message: `Temperature of ${vitals.temperature.toFixed(1)}°C exceeds critical threshold (≥${thresholds.tempHighCritical}°C).`,
      currentValue: `${vitals.temperature.toFixed(1)}°C`,
      thresholdValue: `≥${thresholds.tempHighCritical}°C`,
    });
  } else if (vitals.temperature >= thresholds.tempHighWarning) {
    tempStatus = 'Warning';
    tempLabel = 'Fever';
    tempColor = 'text-amber-700';
    tempBg = 'bg-amber-50';
    tempBorder = 'border-amber-300';
    tempBreached = true;
    tempAlertMsg = `Temp ≥${thresholds.tempHighWarning}°C febrile episode`;
    alerts.push({
      metric: 'temp',
      severity: 'Warning',
      title: 'Fever / Pyrexia Warning',
      message: `Temperature of ${vitals.temperature.toFixed(1)}°C exceeds febrile warning threshold (${thresholds.tempHighWarning}°C).`,
      currentValue: `${vitals.temperature.toFixed(1)}°C`,
      thresholdValue: `≥${thresholds.tempHighWarning}°C`,
    });
  } else if (vitals.temperature <= thresholds.tempLowWarning) {
    tempStatus = 'Warning';
    tempLabel = 'Hypothermia';
    tempColor = 'text-blue-700';
    tempBg = 'bg-blue-50';
    tempBorder = 'border-blue-300';
    tempBreached = true;
    tempAlertMsg = `Temp ≤${thresholds.tempLowWarning}°C hypothermic`;
    alerts.push({
      metric: 'temp',
      severity: 'Warning',
      title: 'Hypothermia Warning',
      message: `Temperature of ${vitals.temperature.toFixed(1)}°C is below normal body temperature limit (≤${thresholds.tempLowWarning}°C).`,
      currentValue: `${vitals.temperature.toFixed(1)}°C`,
      thresholdValue: `≤${thresholds.tempLowWarning}°C`,
    });
  }

  // Respiratory rate evaluation (if recorded)
  let respAssessment: VitalMetricAssessment | undefined;
  if (vitals.respiratoryRate !== undefined) {
    let rStatus: VitalStatus = 'Normal';
    let rLabel = 'Normal Respiration';
    let rColor = 'text-emerald-700';
    let rBg = 'bg-emerald-50';
    let rBorder = 'border-emerald-200';
    let rBreached = false;
    let rAlertMsg: string | undefined;

    if (vitals.respiratoryRate >= thresholds.respRateHighWarning) {
      rStatus = 'Warning';
      rLabel = 'Tachypnea';
      rColor = 'text-amber-700';
      rBg = 'bg-amber-50';
      rBorder = 'border-amber-300';
      rBreached = true;
      rAlertMsg = `Rate ≥${thresholds.respRateHighWarning} breaths/min`;
      alerts.push({
        metric: 'resp',
        severity: 'Warning',
        title: 'Tachypnea Warning',
        message: `Respiratory rate of ${vitals.respiratoryRate} breaths/min exceeds threshold (${thresholds.respRateHighWarning}/min).`,
        currentValue: vitals.respiratoryRate,
        thresholdValue: thresholds.respRateHighWarning,
      });
    } else if (vitals.respiratoryRate <= thresholds.respRateLowWarning) {
      rStatus = 'Warning';
      rLabel = 'Bradypnea';
      rColor = 'text-blue-700';
      rBg = 'bg-blue-50';
      rBorder = 'border-blue-300';
      rBreached = true;
      rAlertMsg = `Rate ≤${thresholds.respRateLowWarning} breaths/min`;
      alerts.push({
        metric: 'resp',
        severity: 'Warning',
        title: 'Bradypnea Warning',
        message: `Respiratory rate of ${vitals.respiratoryRate} breaths/min is depressed (≤${thresholds.respRateLowWarning}/min).`,
        currentValue: vitals.respiratoryRate,
        thresholdValue: thresholds.respRateLowWarning,
      });
    }

    respAssessment = {
      status: rStatus,
      label: rLabel,
      color: rColor,
      bg: rBg,
      border: rBorder,
      isBreached: rBreached,
      alertMessage: rAlertMsg,
    };
  }

  const overallStatus = calculateVitalStatus(
    vitals.bloodPressureSystolic,
    vitals.bloodPressureDiastolic,
    vitals.heartRate,
    vitals.spo2,
    vitals.temperature,
    thresholds
  );

  return {
    bp: {
      status: bpStatus,
      label: bpLabel,
      color: bpColor,
      bg: bpBg,
      border: bpBorder,
      isBreached: bpBreached,
      alertMessage: bpAlertMsg,
    },
    hr: {
      status: hrStatus,
      label: hrLabel,
      color: hrColor,
      bg: hrBg,
      border: hrBorder,
      isBreached: hrBreached,
      alertMessage: hrAlertMsg,
    },
    spo2: {
      status: spo2Status,
      label: spo2Label,
      color: spo2Color,
      bg: spo2Bg,
      border: spo2Border,
      isBreached: spo2Breached,
      alertMessage: spo2AlertMsg,
    },
    temp: {
      status: tempStatus,
      label: tempLabel,
      color: tempColor,
      bg: tempBg,
      border: tempBorder,
      isBreached: tempBreached,
      alertMessage: tempAlertMsg,
    },
    resp: respAssessment,
    alerts,
    overallStatus,
  };
}

interface PatientContextType {
  patients: Patient[];
  activePatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  networkStatus: 'online' | 'offline' | 'simulated-slow';
  pendingSyncCount: number;
  vitalThresholds: VitalThresholds;
  setNetworkStatus: (status: 'online' | 'offline' | 'simulated-slow') => void;
  selectPatient: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  // Thresholds CRUD
  updateVitalThresholds: (thresholds: Partial<VitalThresholds>) => void;
  resetVitalThresholds: () => void;
  applyThresholdPreset: (presetKey: string) => void;
  // Vitals CRUD
  addVitalsRecord: (vitals: Omit<VitalsRecord, 'id' | 'timestamp' | 'syncStatus' | 'status'>) => Promise<void>;
  updateVitalsRecord: (id: string, updates: Partial<VitalsRecord>) => Promise<void>;
  deleteVitalsRecord: (id: string) => Promise<void>;
  // Medical Records CRUD
  addMedicalRecord: (record: Omit<MedicalHistoryItem, 'id' | 'updatedAt' | 'syncStatus'>) => Promise<void>;
  updateMedicalRecord: (id: string, updates: Partial<MedicalHistoryItem>) => Promise<void>;
  updateMedicalRecordStatus: (id: string, newStatus: MedicalRecordStatus) => Promise<void>;
  deleteMedicalRecord: (id: string) => Promise<void>;
  // Appointments CRUD
  addAppointment: (appointment: Omit<Appointment, 'id' | 'syncStatus'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  // Patient Demographics
  updatePatientDemographics: (updates: Partial<Patient>) => Promise<void>;
  // Sync
  syncPendingRecords: () => Promise<void>;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'smart_referral_patient_mgmt_state_v1';
const THRESHOLDS_STORAGE_KEY = 'smart_referral_vital_thresholds_v1';

const INITIAL_MOCK_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    mrn: 'MRN-2026-88941',
    firstName: 'Ramesh',
    lastName: 'Kumar',
    dateOfBirth: '1974-06-15',
    gender: 'Male',
    bloodType: 'O+',
    phone: '+91 98450 12345',
    email: 'ramesh.kumar@example.com',
    address: '42 Gandhi Nagar, Bellary Rural, Karnataka - 583101',
    emergencyContact: {
      name: 'Sunita Kumar',
      relation: 'Spouse',
      phone: '+91 98450 67890',
    },
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    allergies: ['Penicillin', 'Sulfa Drugs', 'Peanuts'],
    chronicConditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension', 'Mild Osteoarthritis'],
    syncStatus: 'Synced',
    lastUpdated: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: '2025-01-10T08:30:00.000Z',
    vitals: [
      {
        id: 'vit-001',
        patientId: 'pat-001',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        bloodPressureSystolic: 138,
        bloodPressureDiastolic: 88,
        heartRate: 78,
        spo2: 97,
        temperature: 37.1,
        respiratoryRate: 16,
        status: 'Elevated',
        recordedBy: 'Dr. Priya Sharma (PHC Bellary)',
        notes: 'Patient reported slight dizziness in morning. Followed up on medication adherence.',
        syncStatus: 'Synced',
      },
      {
        id: 'vit-002',
        patientId: 'pat-001',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        bloodPressureSystolic: 142,
        bloodPressureDiastolic: 92,
        heartRate: 84,
        spo2: 96,
        temperature: 37.4,
        respiratoryRate: 18,
        status: 'Warning',
        recordedBy: 'Nurse Anita',
        notes: 'Routine triage checkpoint before specialist consult.',
        syncStatus: 'Synced',
      },
      {
        id: 'vit-003',
        patientId: 'pat-001',
        timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
        bloodPressureSystolic: 128,
        bloodPressureDiastolic: 82,
        heartRate: 72,
        spo2: 98,
        temperature: 36.8,
        respiratoryRate: 15,
        status: 'Normal',
        recordedBy: 'Dr. Priya Sharma',
        notes: 'Stable post morning walk assessment.',
        syncStatus: 'Synced',
      },
      {
        id: 'vit-004',
        patientId: 'pat-001',
        timestamp: new Date(Date.now() - 86400000 * 25).toISOString(),
        bloodPressureSystolic: 132,
        bloodPressureDiastolic: 84,
        heartRate: 76,
        spo2: 97,
        temperature: 36.9,
        respiratoryRate: 16,
        status: 'Elevated',
        recordedBy: 'Community Health Worker Rekha',
        notes: 'Home visit vitals check.',
        syncStatus: 'Synced',
      },
    ],
    medicalHistory: [
      {
        id: 'med-001',
        patientId: 'pat-001',
        condition: 'Type 2 Diabetes Mellitus',
        category: 'Chronic',
        diagnosisDate: '2019-04-12',
        status: 'Controlled',
        notes: 'HbA1c last measured at 7.1%. Maintained on oral hypoglycemic agents.',
        prescriptions: ['Metformin 500mg BD', 'Glimepiride 1mg OD'],
        severity: 'Moderate',
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        syncStatus: 'Synced',
      },
      {
        id: 'med-002',
        patientId: 'pat-001',
        condition: 'Essential Hypertension',
        category: 'Chronic',
        diagnosisDate: '2021-08-20',
        status: 'Active',
        notes: 'Moderate systolic fluctuations. Advised low sodium diet and regular aerobic walk.',
        prescriptions: ['Telmisartan 40mg OD', 'Amlodipine 5mg OD'],
        severity: 'Moderate',
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        syncStatus: 'Synced',
      },
      {
        id: 'med-003',
        patientId: 'pat-001',
        condition: 'Acute Gastroenteritis',
        category: 'Acute',
        diagnosisDate: '2025-11-14',
        status: 'Resolved',
        notes: 'Treated with IV fluids, ORS, and empiric probiotics. Fully recovered.',
        prescriptions: ['ORS Sachet PRN', 'Zinc Sulfate 20mg OD'],
        severity: 'Moderate',
        updatedAt: '2025-11-20T10:00:00.000Z',
        syncStatus: 'Synced',
      },
      {
        id: 'med-004',
        patientId: 'pat-001',
        condition: 'Severe Penicillin Anaphylactoid Reaction',
        category: 'Allergy',
        diagnosisDate: '2015-02-10',
        status: 'Active',
        notes: 'Developed urticaria, facial angioedema, and dyspnea after Amoxicillin administration. Strict contraindication.',
        prescriptions: ['EpiPen (Emergency Carry)'],
        severity: 'Severe',
        updatedAt: '2024-06-01T12:00:00.000Z',
        syncStatus: 'Synced',
      },
      {
        id: 'med-005',
        patientId: 'pat-001',
        condition: 'Laparoscopic Appendectomy',
        category: 'Surgical',
        diagnosisDate: '2018-09-05',
        status: 'Resolved',
        notes: 'Uncomplicated laparoscopic removal at District Hospital. No postoperative incisional hernia.',
        prescriptions: [],
        severity: 'Mild',
        updatedAt: '2018-09-20T09:00:00.000Z',
        syncStatus: 'Synced',
      },
      {
        id: 'med-006',
        patientId: 'pat-001',
        condition: 'Bilateral Knee Osteoarthritis (Grade II)',
        category: 'Chronic',
        diagnosisDate: '2023-03-18',
        status: 'Under Observation',
        notes: 'Joint space narrowing on X-ray. Physical therapy ongoing. Avoid deep squatting.',
        prescriptions: ['Paracetamol 650mg SOS', 'Glucosamine-Chondroitin'],
        severity: 'Mild',
        updatedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        syncStatus: 'Synced',
      },
    ],
    appointments: [
      {
        id: 'apt-001',
        patientId: 'pat-001',
        title: 'Diabetic Foot & Retinopathy Screening',
        type: 'Specialist Referral',
        doctorName: 'Dr. Anand Verma (Ophthalmologist)',
        facilityName: 'District Hospital Bellary',
        scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        scheduledTime: '10:30 AM',
        status: 'Scheduled',
        notes: 'Annual fundoscopic dilated eye exam and peripheral neuropathy monofilament test.',
        syncStatus: 'Synced',
      },
      {
        id: 'apt-002',
        patientId: 'pat-001',
        title: 'Quarterly PHC Medication Review & Lipid Panel',
        type: 'Follow-up',
        doctorName: 'Dr. Priya Sharma',
        facilityName: 'Bellary Rural Primary Health Centre',
        scheduledDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
        scheduledTime: '09:00 AM',
        status: 'Scheduled',
        notes: 'Fasting blood glucose, serum creatinine, and BP titration.',
        syncStatus: 'Synced',
      },
      {
        id: 'apt-003',
        patientId: 'pat-001',
        title: 'Emergency Triage for Acute Hypertensive Spike',
        type: 'Emergency',
        doctorName: 'Dr. Sunil Rao',
        facilityName: 'Bellary Rural PHC - Triage Unit',
        scheduledDate: new Date(Date.now() - 86400000 * 18).toISOString().split('T')[0],
        scheduledTime: '04:15 PM',
        status: 'Completed',
        notes: 'BP stabilized with sublingual agent. Monitored for 3 hours before safe discharge.',
        syncStatus: 'Synced',
      },
      {
        id: 'apt-004',
        patientId: 'pat-001',
        title: 'HbA1c & Renal Function Lab Panel',
        type: 'Lab Test',
        doctorName: 'Lab Technician Geetha',
        facilityName: 'PHC Diagnostic Laboratory',
        scheduledDate: new Date(Date.now() - 86400000 * 45).toISOString().split('T')[0],
        scheduledTime: '08:00 AM',
        status: 'Completed',
        notes: 'Fasting draw collected. Results uploaded to EHR archive.',
        syncStatus: 'Synced',
      },
    ],
  },
  {
    id: 'pat-002',
    mrn: 'MRN-2026-91042',
    firstName: 'Lakshmi',
    lastName: 'Devi',
    dateOfBirth: '1988-11-22',
    gender: 'Female',
    bloodType: 'B+',
    phone: '+91 97412 34567',
    email: 'lakshmi.devi@example.com',
    address: '18 Kudligi Road, Sandur, Karnataka - 583119',
    emergencyContact: {
      name: 'Manjunath Devi',
      relation: 'Brother',
      phone: '+91 97412 88990',
    },
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    allergies: ['NSAIDs (Aspirin)', 'Shellfish'],
    chronicConditions: ['Hypothyroidism', 'Iron Deficiency Anemia'],
    syncStatus: 'Synced',
    lastUpdated: new Date(Date.now() - 3600000 * 6).toISOString(),
    createdAt: '2025-02-01T11:20:00.000Z',
    vitals: [
      {
        id: 'vit-201',
        patientId: 'pat-002',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        bloodPressureSystolic: 114,
        bloodPressureDiastolic: 74,
        heartRate: 68,
        spo2: 99,
        temperature: 36.6,
        respiratoryRate: 14,
        status: 'Normal',
        recordedBy: 'Nurse Fatima',
        notes: 'Vitals stable. Hemoglobin follow-up scheduled.',
        syncStatus: 'Synced',
      },
    ],
    medicalHistory: [
      {
        id: 'med-201',
        patientId: 'pat-002',
        condition: 'Primary Hypothyroidism',
        category: 'Chronic',
        diagnosisDate: '2020-01-15',
        status: 'Controlled',
        notes: 'TSH within normal range (2.4 uIU/mL).',
        prescriptions: ['Levothyroxine 50mcg OD (Fasting)'],
        severity: 'Mild',
        updatedAt: '2025-10-10T10:00:00.000Z',
        syncStatus: 'Synced',
      },
      {
        id: 'med-202',
        patientId: 'pat-002',
        condition: 'Nutritional Iron Deficiency Anemia',
        category: 'Chronic',
        diagnosisDate: '2024-05-12',
        status: 'Active',
        notes: 'Hb at 9.8 g/dL. Responding well to oral iron supplementation.',
        prescriptions: ['Ferrous Ascorbate + Folic Acid OD'],
        severity: 'Moderate',
        updatedAt: '2025-12-01T08:30:00.000Z',
        syncStatus: 'Synced',
      },
    ],
    appointments: [
      {
        id: 'apt-201',
        patientId: 'pat-002',
        title: 'Thyroid Profile & Complete Blood Count',
        type: 'Lab Test',
        doctorName: 'Dr. Priya Sharma',
        facilityName: 'Bellary Rural Primary Health Centre',
        scheduledDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        scheduledTime: '08:30 AM',
        status: 'Scheduled',
        notes: 'Fasting venous sample.',
        syncStatus: 'Synced',
      },
    ],
  },
];

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error hydrating patient state from localStorage:', e);
    }
    return INITIAL_MOCK_PATIENTS;
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    return patients[0]?.id || 'pat-001';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'simulated-slow'>('online');

  // Vital Sign Thresholds State & Persistence
  const [vitalThresholds, setVitalThresholds] = useState<VitalThresholds>(() => {
    try {
      const stored = localStorage.getItem(THRESHOLDS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_VITAL_THRESHOLDS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading thresholds from localStorage:', e);
    }
    return DEFAULT_VITAL_THRESHOLDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(vitalThresholds));
    } catch (e) {
      console.error('Failed to persist vital thresholds:', e);
    }
  }, [vitalThresholds]);

  const updateVitalThresholds = useCallback((updates: Partial<VitalThresholds>) => {
    setVitalThresholds((prev) => {
      const next = { ...prev, ...updates };
      if (!updates.presetName && prev.presetName && prev.presetName !== 'Custom') {
        next.presetName = 'Custom Configured';
      }
      return next;
    });
  }, []);

  const resetVitalThresholds = useCallback(() => {
    setVitalThresholds(DEFAULT_VITAL_THRESHOLDS);
    localStorage.removeItem(THRESHOLDS_STORAGE_KEY);
  }, []);

  const applyThresholdPreset = useCallback((presetKey: string) => {
    if (CLINICAL_PRESETS[presetKey]) {
      setVitalThresholds(CLINICAL_PRESETS[presetKey].thresholds);
    }
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to persist patients to localStorage:', e);
    }
  }, [patients]);

  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === activePatientId) || patients[0] || null;
  }, [patients, activePatientId]);

  const pendingSyncCount = useMemo(() => {
    let count = 0;
    patients.forEach((p) => {
      if (p.syncStatus === 'Pending') count++;
      p.vitals.forEach((v) => {
        if (v.syncStatus === 'Pending') count++;
      });
      p.medicalHistory.forEach((m) => {
        if (m.syncStatus === 'Pending') count++;
      });
      p.appointments.forEach((a) => {
        if (a.syncStatus === 'Pending') count++;
      });
    });
    return count;
  }, [patients]);

  // Simulated latency helper
  const simulateNetworkDelay = useCallback(async () => {
    if (networkStatus === 'offline') {
      return; // Offline operations apply immediately with 'Pending' sync status
    }
    const delayMs = networkStatus === 'simulated-slow' ? 1200 : 350;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }, [networkStatus]);

  const selectPatient = useCallback((id: string) => {
    setActivePatientId(id);
    setError(null);
  }, []);

  const getPatientById = useCallback(
    (id: string) => {
      return patients.find((p) => p.id === id);
    },
    [patients]
  );

  // Vitals CRUD
  const addVitalsRecord = useCallback(
    async (vitalsData: Omit<VitalsRecord, 'id' | 'timestamp' | 'syncStatus' | 'status'>) => {
      if (!activePatient) return;
      setIsLoading(true);
      setError(null);

      const status = calculateVitalStatus(
        vitalsData.bloodPressureSystolic,
        vitalsData.bloodPressureDiastolic,
        vitalsData.heartRate,
        vitalsData.spo2,
        vitalsData.temperature,
        vitalThresholds
      );

      const syncStatus: SyncStatus = networkStatus === 'offline' ? 'Pending' : 'Synced';

      const newRecord: VitalsRecord = {
        ...vitalsData,
        id: `vit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patientId: activePatient.id,
        timestamp: new Date().toISOString(),
        status,
        syncStatus,
      };

      try {
        await simulateNetworkDelay();
        setPatients((prev) =>
          prev.map((p) => {
            if (p.id !== activePatient.id) return p;
            return {
              ...p,
              vitals: [newRecord, ...p.vitals],
              lastUpdated: new Date().toISOString(),
              syncStatus: syncStatus === 'Pending' ? 'Pending' : p.syncStatus,
            };
          })
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to record vitals');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activePatient, networkStatus, simulateNetworkDelay, vitalThresholds]
  );

  const updateVitalsRecord = useCallback(
    async (id: string, updates: Partial<VitalsRecord>) => {
      if (!activePatient) return;
      setIsLoading(true);
      setError(null);

      const syncStatus: SyncStatus = networkStatus === 'offline' ? 'Pending' : 'Synced';

      try {
        await simulateNetworkDelay();
        setPatients((prev) =>
          prev.map((p) => {
            if (p.id !== activePatient.id) return p;
            return {
              ...p,
              vitals: p.vitals.map((v) => {
                if (v.id !== id) return v;
                const merged = { ...v, ...updates, syncStatus };
                if (
                  updates.bloodPressureSystolic !== undefined ||
                  updates.bloodPressureDiastolic !== undefined ||
                  updates.heartRate !== undefined ||
                  updates.spo2 !== undefined ||
                  updates.temperature !== undefined
                ) {
                  merged.status = calculateVitalStatus(
                    merged.bloodPressureSystolic,
                    merged.bloodPressureDiastolic,
                    merged.heartRate,
                    merged.spo2,
                    merged.temperature,
                    vitalThresholds
                  );
                }
                return merged;
              }),
              lastUpdated: new Date().toISOString(),
            };
          })
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update vitals record');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activePatient, networkStatus, simulateNetworkDelay, vitalThresholds]
  );

  const deleteVitalsRecord = useCallback(
    async (id: string) => {
      if (!activePatient) return;
      setIsLoading(true);
      setError(null);

      try {
        await simulateNetworkDelay();
        setPatients((prev) =>
          prev.map((p) => {
            if (p.id !== activePatient.id) return p;
            return {
              ...p,
              vitals: p.vitals.filter((v) => v.id !== id),
              lastUpdated: new Date().toISOString(),
            };
          })
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete vitals record');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activePatient, simulateNetworkDelay]
  );

  // Medical History CRUD
  const addMedicalRecord = useCallback(
    async (recordData: Omit<MedicalHistoryItem, 'id' | 'updatedAt' | 'syncStatus'>) => {
      if (!activePatient) return;
      setIsLoading(true);
      setError(null);

      const syncStatus: SyncStatus = networkStatus === 'offline' ? 'Pending' : 'Synced';

      const newRecord: MedicalHistoryItem = {
        ...recordData,
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patientId: activePatient.id,
        updatedAt: new Date().toISOString(),
        syncStatus,
      };

      try {
        await simulateNetworkDelay();
        setPatients((prev) =>
          prev.map((p) => {
            if (p.id !== activePatient.id) return p;
            const updatedHistory = [newRecord, ...p.medicalHistory];
            const updatedChronic =
              newRecord.category === 'Chronic' && !p.chronicConditions.includes(newRecord.condition)
                ? [...p.chronicConditions, newRecord.condition]
                : p.chronicConditions;
            const updatedAllergies =
              newRecord.category === 'Allergy' && !p.allergies.includes(newRecord.condition)
                ? [...p.allergies, newRecord.condition]
                : p.allergies;

            return {
              ...p,
              medicalHistory: updatedHistory,
              chronicConditions: updatedChronic,
              allergies: updatedAllergies,
              lastUpdated: new Date().toISOString(),
              syncStatus: syncStatus === 'Pending' ? 'Pending' : p.syncStatus,
            };
          })
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to add medical record');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activePatient, networkStatus, simulateNetworkDelay]
  );

  const updateMedicalRecord = useCallback(
    async (id: string, updates: Partial<MedicalHistoryItem>) => {
      if (!activePatient) return;
      setIsLoading(true);
      setError(null);

      const syncStatus: SyncStatus = networkStatus === 'offline' ? 'Pending' : 'Synced';

      try {
        await simulateNetworkDelay();
        setPatients((prev) =>
          prev.map((p) => {
            if (p.id !== activePatient.id) return p;
            return {
              ...p,
              medicalHistory: p.medicalHistory.map((m) =>
                m.id === id
                  ? {
                      ...m,
                      ...updates,
                      updatedAt: new Date().toISOString(),
                      syncStatus,
                    }
                  : m
              ),
              lastUpdated: new Date().toISOString(),
            };
          })
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update medical record');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activePatient, networkStatus, simulateNetworkDelay]
  );

  const updateMedicalRecordStatus = useCallback(
    async (id: string, newStatus: MedicalRecordStatus) => {
      await updateMedicalRecord(id, { status: newStatus });
    },
    [updateMedicalRecord]
  );

  const deleteMedicalRecord = useCallback(
    async (id: string) => {
      if (!activePatient) return;
      setIsLoading(true);
      setError(null);

      try {
        await simulateNetworkDelay();
        setPatients((prev) =>
          prev.map((p) => {
            if (p.id !== activePatient.id) return p;
            const target = p.medicalHistory.find((m) => m.id === id);
            return {
              ...p,
              medicalHistory: p.medicalHistory.filter((m) => m.id !== id),
              chronicConditions:
                target?.category === 'Chronic'
                  ? p.chronicConditions.filter((c) => c !== target.condition)
                  : p.chronicConditions,
              allergies:
                target?.category === 'Allergy'
                  ? p.allergies.filter((a) => a !== target.condition)
                  : p.allergies,
              lastUpdated: new Date().toISOString(),
            };
          })
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete medical record');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activePatient, simulateNetworkDelay]
  );

  // Appointments CRUD
  const addAppointment = useCallback(
    async (aptData: Omit<Appointment, 'id' | 'syncStatus'>) => {
      if (!activePatient) return;
      setIsLoading(true);
      setError(null);

      const syncStatus: SyncStatus = networkStatus === 'offline' ? 'Pending' : 'Synced';

      const newApt: Appointment = {
        ...aptData,
        id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        syncStatus,
      };

      try {
        await simulateNetworkDelay();
        setPatients((prev) =>
          prev.map((p) => {
            if (p.id !== activePatient.id) return p;
            return {
              ...p,
              appointments: [newApt, ...p.appointments],
              lastUpdated: new Date().toISOString(),
              syncStatus: syncStatus === 'Pending' ? 'Pending' : p.syncStatus,
            };
          })
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to book appointment');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activePatient, networkStatus, simulateNetworkDelay]
  );

  const updateAppointment = useCallback(
    async (id: string, updates: Partial<Appointment>) => {
      if (!activePatient) return;
      setIsLoading(true);
      setError(null);

      const syncStatus: SyncStatus = networkStatus === 'offline' ? 'Pending' : 'Synced';

      try {
        await simulateNetworkDelay();
        setPatients((prev) =>
          prev.map((p) => {
            if (p.id !== activePatient.id) return p;
            return {
              ...p,
              appointments: p.appointments.map((a) =>
                a.id === id ? { ...a, ...updates, syncStatus } : a
              ),
              lastUpdated: new Date().toISOString(),
            };
          })
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update appointment');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activePatient, networkStatus, simulateNetworkDelay]
  );

  const updateAppointmentStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      await updateAppointment(id, { status });
    },
    [updateAppointment]
  );

  const deleteAppointment = useCallback(
    async (id: string) => {
      if (!activePatient) return;
      setIsLoading(true);
      setError(null);

      try {
        await simulateNetworkDelay();
        setPatients((prev) =>
          prev.map((p) => {
            if (p.id !== activePatient.id) return p;
            return {
              ...p,
              appointments: p.appointments.filter((a) => a.id !== id),
              lastUpdated: new Date().toISOString(),
            };
          })
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete appointment');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activePatient, simulateNetworkDelay]
  );

  // Demographics
  const updatePatientDemographics = useCallback(
    async (updates: Partial<Patient>) => {
      if (!activePatient) return;
      setIsLoading(true);
      setError(null);

      const syncStatus: SyncStatus = networkStatus === 'offline' ? 'Pending' : 'Synced';

      try {
        await simulateNetworkDelay();
        setPatients((prev) =>
          prev.map((p) => {
            if (p.id !== activePatient.id) return p;
            return {
              ...p,
              ...updates,
              syncStatus,
              lastUpdated: new Date().toISOString(),
            };
          })
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update patient demographics');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activePatient, networkStatus, simulateNetworkDelay]
  );

  // Batch Sync Pending records
  const syncPendingRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPatients((prev) =>
        prev.map((p) => ({
          ...p,
          syncStatus: 'Synced',
          vitals: p.vitals.map((v) => ({ ...v, syncStatus: 'Synced' })),
          medicalHistory: p.medicalHistory.map((m) => ({ ...m, syncStatus: 'Synced' })),
          appointments: p.appointments.map((a) => ({ ...a, syncStatus: 'Synced' })),
        }))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to synchronize offline data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setPatients(INITIAL_MOCK_PATIENTS);
    setActivePatientId(INITIAL_MOCK_PATIENTS[0].id);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PatientContext.Provider
      value={{
        patients,
        activePatient,
        isLoading,
        error,
        networkStatus,
        pendingSyncCount,
        vitalThresholds,
        setNetworkStatus,
        selectPatient,
        getPatientById,
        updateVitalThresholds,
        resetVitalThresholds,
        applyThresholdPreset,
        addVitalsRecord,
        updateVitalsRecord,
        deleteVitalsRecord,
        addMedicalRecord,
        updateMedicalRecord,
        updateMedicalRecordStatus,
        deleteMedicalRecord,
        addAppointment,
        updateAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        updatePatientDemographics,
        syncPendingRecords,
        resetToDefaults,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = (): PatientContextType => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatientContext must be used within a PatientProvider');
  }
  return context;
};
