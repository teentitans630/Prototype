import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  SEED_FACILITIES,
  SEED_FACILITY_SERVICES,
  SEED_PATIENTS,
  SEED_PROFILES,
  SEED_REFERRAL_HISTORY,
  SEED_REFERRALS,
} from '../data/seedData';
import {
  Facility,
  FacilityService,
  Patient,
  Referral,
  ReferralPriority,
  ReferralStatus,
  ReferralStatusHistory,
  UserProfile,
  UserRole,
} from '../types';

interface AppContextType {
  currentUser: UserProfile | null;
  facilities: Facility[];
  facilityServices: FacilityService[];
  patients: Patient[];
  referrals: Referral[];
  statusHistory: ReferralStatusHistory[];
  activePatientId: string;
  setActivePatientId: (id: string) => void;
  
  // Auth
  login: (email: string, role: UserRole, patientId?: string) => boolean;
  switchDemoUser: (role: UserRole, patientId?: string) => void;
  logout: () => void;
  
  // Patients
  registerPatient: (patientData: Omit<Patient, 'id' | 'patient_code' | 'created_at'>) => Patient;
  getPatientById: (id: string) => Patient | undefined;
  
  // Referrals
  createReferral: (referralData: {
    patient_id: string;
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
  }) => Referral;
  
  acceptReferral: (referralId: string, remarks?: string) => void;
  rejectReferral: (referralId: string, reason: string, remarks?: string) => void;
  advanceReferralStatus: (referralId: string, nextStatus: ReferralStatus, remarks?: string) => void;
  
  // Facilities & Admin
  updateFacilityLoad: (facilityId: string, newLoad: number) => void;
  getFacilityById: (id: string) => Facility | undefined;
  getReferralsForPatient: (patientId: string) => Referral[];
  getReferralById: (id: string) => Referral | undefined;
  getReferralHistory: (referralId: string) => ReferralStatusHistory[];
  
  // Reset
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'smart_referral_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or seed
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
    return saved ? JSON.parse(saved) : SEED_PROFILES[0]; // Default to Dr. Anjali Rao
  });

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}facilities`);
    return saved ? JSON.parse(saved) : SEED_FACILITIES;
  });

  const [facilityServices, setFacilityServices] = useState<FacilityService[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}services`);
    return saved ? JSON.parse(saved) : SEED_FACILITY_SERVICES;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}patients`);
    return saved ? JSON.parse(saved) : SEED_PATIENTS;
  });

  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}referrals`);
    return saved ? JSON.parse(saved) : SEED_REFERRALS;
  });

  const [statusHistory, setStatusHistory] = useState<ReferralStatusHistory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}history`);
    return saved ? JSON.parse(saved) : SEED_REFERRAL_HISTORY;
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}active_patient`);
    return saved || 'pat-01'; // Default to Ravi Kumar (pat-01)
  });

  // Save to localStorage on state changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}active_patient`, activePatientId);
  }, [activePatientId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}facilities`, JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}services`, JSON.stringify(facilityServices));
  }, [facilityServices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}patients`, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}referrals`, JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}history`, JSON.stringify(statusHistory));
  }, [statusHistory]);

  const login = (email: string, role: UserRole, patientId?: string): boolean => {
    if (role === 'patient') {
      const pid = patientId || activePatientId || 'pat-01';
      const patientObj = patients.find((p) => p.id === pid) || patients[0];
      const patientUser: UserProfile = {
        id: `user-${patientObj.id}`,
        email: email || 'patient@demo.com',
        name: patientObj.name,
        role: 'patient',
        facility_id: null,
        facility_name: 'Patient Portal',
        patient_id: patientObj.id,
        phone: patientObj.phone,
        created_at: new Date().toISOString(),
      };
      setActivePatientId(patientObj.id);
      setCurrentUser(patientUser);
      return true;
    }

    const found = SEED_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase() || p.role === role);
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // Fallback custom user
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name: role === 'phc_doctor' ? 'Dr. Primary Care' : role === 'hospital_staff' ? 'Hospital Duty Desk' : 'Administrator',
      role,
      facility_id: role === 'phc_doctor' ? facilities[0].id : role === 'hospital_staff' ? facilities[1].id : null,
      facility_name: role === 'phc_doctor' ? facilities[0].name : role === 'hospital_staff' ? facilities[1].name : 'Admin Command',
      created_at: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    return true;
  };

  const switchDemoUser = (role: UserRole, patientId?: string) => {
    if (role === 'patient') {
      const pid = patientId || activePatientId || 'pat-01';
      const patientObj = patients.find((p) => p.id === pid) || patients[0];
      const patientUser: UserProfile = {
        id: `user-${patientObj.id}`,
        email: 'patient@demo.com',
        name: patientObj.name,
        role: 'patient',
        facility_id: null,
        facility_name: 'Patient Portal',
        patient_id: patientObj.id,
        phone: patientObj.phone,
        created_at: new Date().toISOString(),
      };
      setActivePatientId(patientObj.id);
      setCurrentUser(patientUser);
      return;
    }

    const found = SEED_PROFILES.find((p) => p.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerPatient = (
    patientData: Omit<Patient, 'id' | 'patient_code' | 'created_at'>
  ): Patient => {
    // Generate next code like PAT-000249
    const existingNumbers = patients
      .map((p) => {
        const match = p.patient_code.match(/PAT-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 244;
    const nextNum = maxNum + 1;
    const patient_code = `PAT-${String(nextNum).padStart(6, '0')}`;

    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      patient_code,
      created_at: new Date().toISOString(),
    };

    setPatients((prev) => [newPatient, ...prev]);
    return newPatient;
  };

  const getPatientById = (id: string) => {
    return patients.find((p) => p.id === id);
  };

  const getFacilityById = (id: string) => {
    return facilities.find((f) => f.id === id);
  };

  const createReferral = (referralData: {
    patient_id: string;
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
  }): Referral => {
    const currentYear = new Date().getFullYear();
    const existingRefCodes = referrals
      .map((r) => {
        const match = r.referral_code.match(new RegExp(`REF-${currentYear}-(\\d+)`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxRef = existingRefCodes.length > 0 ? Math.max(...existingRefCodes) : 123;
    const nextRefNum = maxRef + 1;
    const referral_code = `REF-${currentYear}-${String(nextRefNum).padStart(5, '0')}`;

    const newReferralId = `ref-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const source_facility_id = currentUser?.facility_id || facilities[0].id;
    const doctor_id = currentUser?.id || 'user-doc-01';

    const newReferral: Referral = {
      ...referralData,
      id: newReferralId,
      referral_code,
      doctor_id,
      source_facility_id,
      status: 'pending',
      created_at: nowIso,
      updated_at: nowIso,
    };

    // Insert history
    const initialHistory: ReferralStatusHistory = {
      id: `hist-${Date.now()}`,
      referral_id: newReferralId,
      status: 'pending',
      updated_by: doctor_id,
      updated_by_name: currentUser?.name || 'Dr. Anjali Rao',
      updated_by_role: currentUser?.role || 'phc_doctor',
      remarks: 'Referral created and transmitted to destination hospital.',
      created_at: nowIso,
    };

    setReferrals((prev) => [newReferral, ...prev]);
    setStatusHistory((prev) => [...prev, initialHistory]);

    return newReferral;
  };

  const acceptReferral = (referralId: string, remarks: string = 'Referral accepted by destination facility desk.') => {
    const nowIso = new Date().toISOString();
    setReferrals((prev) =>
      prev.map((r) => (r.id === referralId ? { ...r, status: 'accepted', updated_at: nowIso } : r))
    );

    const historyItem: ReferralStatusHistory = {
      id: `hist-${Date.now()}`,
      referral_id: referralId,
      status: 'accepted',
      updated_by: currentUser?.id || 'user-hosp-02',
      updated_by_name: currentUser?.name || 'Hospital Duty Desk',
      updated_by_role: currentUser?.role || 'hospital_staff',
      remarks,
      created_at: nowIso,
    };

    setStatusHistory((prev) => [...prev, historyItem]);
  };

  const rejectReferral = (referralId: string, reason: string, remarks?: string) => {
    const nowIso = new Date().toISOString();
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === referralId
          ? {
              ...r,
              status: 'rejected',
              rejection_reason: reason,
              rejection_notes: remarks,
              updated_at: nowIso,
            }
          : r
      )
    );

    const historyItem: ReferralStatusHistory = {
      id: `hist-${Date.now()}`,
      referral_id: referralId,
      status: 'rejected',
      updated_by: currentUser?.id || 'user-hosp-02',
      updated_by_name: currentUser?.name || 'Hospital Duty Desk',
      updated_by_role: currentUser?.role || 'hospital_staff',
      remarks: `Rejected: ${reason}${remarks ? ` - Note: ${remarks}` : ''}`,
      created_at: nowIso,
    };

    setStatusHistory((prev) => [...prev, historyItem]);
  };

  const advanceReferralStatus = (
    referralId: string,
    nextStatus: ReferralStatus,
    remarks?: string
  ) => {
    const nowIso = new Date().toISOString();
    setReferrals((prev) =>
      prev.map((r) => (r.id === referralId ? { ...r, status: nextStatus, updated_at: nowIso } : r))
    );

    const defaultRemarks: Record<ReferralStatus, string> = {
      pending: 'Referral pending triage',
      accepted: 'Referral accepted',
      patient_arrived: 'Patient arrived at hospital reception / triage bay',
      under_treatment: 'Patient admitted and clinical treatment started',
      completed: 'Referral case completed and discharge summary documented',
      rejected: 'Referral rejected',
      referred_further: 'Patient stabilized and referred onward to tertiary center',
    };

    const historyItem: ReferralStatusHistory = {
      id: `hist-${Date.now()}`,
      referral_id: referralId,
      status: nextStatus,
      updated_by: currentUser?.id || 'user-hosp-02',
      updated_by_name: currentUser?.name || 'Hospital Staff',
      updated_by_role: currentUser?.role || 'hospital_staff',
      remarks: remarks || defaultRemarks[nextStatus],
      created_at: nowIso,
    };

    setStatusHistory((prev) => [...prev, historyItem]);
  };

  const updateFacilityLoad = (facilityId: string, newLoad: number) => {
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === facilityId
          ? { ...f, current_load: Math.max(0, Math.min(f.capacity * 2, newLoad)) }
          : f
      )
    );
  };

  const getReferralsForPatient = (patientId: string) => {
    return referrals.filter((r) => r.patient_id === patientId);
  };

  const getReferralById = (id: string) => {
    const ref = referrals.find((r) => r.id === id);
    if (!ref) return undefined;
    const patient = patients.find((p) => p.id === ref.patient_id);
    const source_facility = facilities.find((f) => f.id === ref.source_facility_id);
    const destination_facility = facilities.find((f) => f.id === ref.destination_facility_id);
    return {
      ...ref,
      patient,
      source_facility,
      destination_facility,
    };
  };

  const getReferralHistory = (referralId: string) => {
    return statusHistory
      .filter((h) => h.referral_id === referralId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const resetToDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}facilities`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}services`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}patients`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}referrals`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}history`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
    
    setFacilities(SEED_FACILITIES);
    setFacilityServices(SEED_FACILITY_SERVICES);
    setPatients(SEED_PATIENTS);
    setReferrals(SEED_REFERRALS);
    setStatusHistory(SEED_REFERRAL_HISTORY);
    setCurrentUser(SEED_PROFILES[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        facilities,
        facilityServices,
        patients,
        referrals,
        statusHistory,
        activePatientId,
        setActivePatientId,
        login,
        switchDemoUser,
        logout,
        registerPatient,
        getPatientById,
        createReferral,
        acceptReferral,
        rejectReferral,
        advanceReferralStatus,
        updateFacilityLoad,
        getFacilityById,
        getReferralsForPatient,
        getReferralById,
        getReferralHistory,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
