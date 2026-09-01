import { useMemo, useCallback } from 'react';
import { usePatientContext } from '../context/PatientContext';
import {
  VitalsRecord,
  MedicalHistoryItem,
  Appointment,
  MedicalRecordStatus,
  AppointmentStatus,
  Patient,
  VitalThresholds,
} from '../types/patient';

export interface UsePatientProfileReturn {
  patient: Patient | null;
  patients: Patient[];
  age: number;
  latestVitals: VitalsRecord | undefined;
  vitalsHistory: VitalsRecord[];
  medicalHistory: MedicalHistoryItem[];
  activeConditions: MedicalHistoryItem[];
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  abnormalVitalsCount: number;
  pendingSyncCount: number;
  networkStatus: 'online' | 'offline' | 'simulated-slow';
  isLoading: boolean;
  error: string | null;
  vitalThresholds: VitalThresholds;
  // Methods
  selectPatient: (id: string) => void;
  updateThresholds: (thresholds: Partial<VitalThresholds>) => void;
  resetThresholds: () => void;
  applyPreset: (presetKey: string) => void;
  recordVitals: (
    vitals: Omit<VitalsRecord, 'id' | 'timestamp' | 'syncStatus' | 'status'>
  ) => Promise<boolean>;
  deleteVitals: (id: string) => Promise<boolean>;
  recordMedicalCondition: (
    record: Omit<MedicalHistoryItem, 'id' | 'updatedAt' | 'syncStatus'>
  ) => Promise<boolean>;
  changeConditionStatus: (
    id: string,
    status: MedicalRecordStatus
  ) => Promise<boolean>;
  removeCondition: (id: string) => Promise<boolean>;
  scheduleAppointment: (
    appointment: Omit<Appointment, 'id' | 'syncStatus'>
  ) => Promise<boolean>;
  changeAppointmentStatus: (
    id: string,
    status: AppointmentStatus
  ) => Promise<boolean>;
  removeAppointment: (id: string) => Promise<boolean>;
  updateDemographics: (updates: Partial<Patient>) => Promise<boolean>;
  syncAll: () => Promise<boolean>;
  setNetworkStatus: (status: 'online' | 'offline' | 'simulated-slow') => void;
  resetToDefaults: () => void;
}

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export const usePatientProfile = (patientIdOverride?: string): UsePatientProfileReturn => {
  const context = usePatientContext();
  const {
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
    deleteVitalsRecord,
    addMedicalRecord,
    updateMedicalRecordStatus,
    deleteMedicalRecord,
    addAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    updatePatientDemographics,
    syncPendingRecords,
    resetToDefaults,
  } = context;

  // If a specific patient ID was provided via override, resolve it
  const targetPatient = useMemo(() => {
    if (patientIdOverride) {
      return getPatientById(patientIdOverride) || activePatient;
    }
    return activePatient;
  }, [patientIdOverride, getPatientById, activePatient]);

  const age = useMemo(() => {
    return targetPatient ? calculateAge(targetPatient.dateOfBirth) : 0;
  }, [targetPatient]);

  const latestVitals = useMemo(() => {
    if (!targetPatient || targetPatient.vitals.length === 0) return undefined;
    return targetPatient.vitals[0];
  }, [targetPatient]);

  const vitalsHistory = useMemo(() => {
    return targetPatient?.vitals || [];
  }, [targetPatient]);

  const medicalHistory = useMemo(() => {
    return targetPatient?.medicalHistory || [];
  }, [targetPatient]);

  const activeConditions = useMemo(() => {
    return (targetPatient?.medicalHistory || []).filter(
      (m) => m.status === 'Active' || m.status === 'Under Observation'
    );
  }, [targetPatient]);

  const upcomingAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return (targetPatient?.appointments || [])
      .filter((a) => a.scheduledDate >= todayStr && a.status === 'Scheduled')
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [targetPatient]);

  const pastAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return (targetPatient?.appointments || [])
      .filter((a) => a.scheduledDate < todayStr || a.status !== 'Scheduled')
      .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
  }, [targetPatient]);

  const abnormalVitalsCount = useMemo(() => {
    if (!latestVitals) return 0;
    let count = 0;
    if (
      latestVitals.bloodPressureSystolic >= vitalThresholds.bpSystolicWarning ||
      latestVitals.bloodPressureDiastolic >= vitalThresholds.bpDiastolicWarning
    ) {
      count++;
    }
    if (
      latestVitals.heartRate >= vitalThresholds.hrHighWarning ||
      latestVitals.heartRate <= vitalThresholds.hrLowWarning
    ) {
      count++;
    }
    if (latestVitals.spo2 <= vitalThresholds.spo2WarningMin) {
      count++;
    }
    if (
      latestVitals.temperature >= vitalThresholds.tempHighWarning ||
      latestVitals.temperature <= vitalThresholds.tempLowWarning
    ) {
      count++;
    }
    if (
      latestVitals.respiratoryRate !== undefined &&
      (latestVitals.respiratoryRate >= vitalThresholds.respRateHighWarning ||
        latestVitals.respiratoryRate <= vitalThresholds.respRateLowWarning)
    ) {
      count++;
    }
    return count;
  }, [latestVitals, vitalThresholds]);

  // Safe wrapper actions with try-catch and boolean returns
  const recordVitals = useCallback(
    async (vitalsData: Omit<VitalsRecord, 'id' | 'timestamp' | 'syncStatus' | 'status'>) => {
      try {
        await addVitalsRecord(vitalsData);
        return true;
      } catch {
        return false;
      }
    },
    [addVitalsRecord]
  );

  const deleteVitals = useCallback(
    async (id: string) => {
      try {
        await deleteVitalsRecord(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteVitalsRecord]
  );

  const recordMedicalCondition = useCallback(
    async (recordData: Omit<MedicalHistoryItem, 'id' | 'updatedAt' | 'syncStatus'>) => {
      try {
        await addMedicalRecord(recordData);
        return true;
      } catch {
        return false;
      }
    },
    [addMedicalRecord]
  );

  const changeConditionStatus = useCallback(
    async (id: string, status: MedicalRecordStatus) => {
      try {
        await updateMedicalRecordStatus(id, status);
        return true;
      } catch {
        return false;
      }
    },
    [updateMedicalRecordStatus]
  );

  const removeCondition = useCallback(
    async (id: string) => {
      try {
        await deleteMedicalRecord(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMedicalRecord]
  );

  const scheduleAppointment = useCallback(
    async (aptData: Omit<Appointment, 'id' | 'syncStatus'>) => {
      try {
        await addAppointment(aptData);
        return true;
      } catch {
        return false;
      }
    },
    [addAppointment]
  );

  const changeAppointmentStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      try {
        await updateAppointmentStatus(id, status);
        return true;
      } catch {
        return false;
      }
    },
    [updateAppointmentStatus]
  );

  const removeAppointment = useCallback(
    async (id: string) => {
      try {
        await deleteAppointment(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteAppointment]
  );

  const updateDemographics = useCallback(
    async (updates: Partial<Patient>) => {
      try {
        await updatePatientDemographics(updates);
        return true;
      } catch {
        return false;
      }
    },
    [updatePatientDemographics]
  );

  const syncAll = useCallback(async () => {
    try {
      await syncPendingRecords();
      return true;
    } catch {
      return false;
    }
  }, [syncPendingRecords]);

  return {
    patient: targetPatient,
    patients,
    age,
    latestVitals,
    vitalsHistory,
    medicalHistory,
    activeConditions,
    upcomingAppointments,
    pastAppointments,
    abnormalVitalsCount,
    pendingSyncCount,
    networkStatus,
    isLoading,
    error,
    vitalThresholds,
    selectPatient,
    updateThresholds: updateVitalThresholds,
    resetThresholds: resetVitalThresholds,
    applyPreset: applyThresholdPreset,
    recordVitals,
    deleteVitals,
    recordMedicalCondition,
    changeConditionStatus,
    removeCondition,
    scheduleAppointment,
    changeAppointmentStatus,
    removeAppointment,
    updateDemographics,
    syncAll,
    setNetworkStatus,
    resetToDefaults,
  };
};
