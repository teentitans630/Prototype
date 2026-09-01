import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PatientProvider } from './context/PatientContext';
import { AppShell } from './components/AppShell';
import { LoginView } from './views/LoginView';
import { PHCDashboardView } from './views/PHCDashboardView';
import { HospitalDashboardView } from './views/HospitalDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { PatientDashboardView } from './views/PatientDashboardView';
import { PatientsListView } from './views/PatientsListView';
import { PatientProfileView } from './views/PatientProfileView';
import { RegisterPatientView } from './views/RegisterPatientView';
import { CreateReferralView } from './views/CreateReferralView';
import { ReferralsListView } from './views/ReferralsListView';
import { ReferralDetailView } from './views/ReferralDetailView';
import { ReferralTimelineView } from './views/ReferralTimelineView';
import { FacilitiesDirectoryView } from './views/FacilitiesDirectoryView';
import { AdminFacilitiesView } from './views/AdminFacilitiesView';
import { AsynchronousTeleTriage } from './components/rural/AsynchronousTeleTriage';
import { PoCDiagnosticsLog } from './components/rural/PoCDiagnosticsLog';
import { PriorityReferralPipeline } from './components/rural/PriorityReferralPipeline';
import { MobileUnitFinder } from './components/rural/MobileUnitFinder';
import { UserRole } from './types';

interface NavigationState {
  view: string;
  params?: Record<string, any>;
}

function MainApp() {
  const { currentUser } = useApp();
  const [navState, setNavState] = useState<NavigationState>({ view: 'login' });

  // Sync navigation view whenever user logs in or logs out
  React.useEffect(() => {
    if (!currentUser) {
      setNavState({ view: 'login' });
    }
  }, [currentUser]);

  const handleNavigate = (view: string, params?: Record<string, any>) => {
    setNavState({ view, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role: UserRole) => {
    if (role === 'patient') {
      handleNavigate('patient_dashboard');
    } else if (role === 'phc_doctor') {
      handleNavigate('phc_dashboard');
    } else if (role === 'hospital_staff') {
      handleNavigate('hospital_dashboard');
    } else {
      handleNavigate('admin_dashboard');
    }
  };

  // If user is not logged in or in login view
  if (!currentUser || navState.view === 'login') {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Render view inside AppShell
  const renderCurrentView = () => {
    switch (navState.view) {
      case 'patient_dashboard':
        return (
          <PatientDashboardView
            initialTab={navState.params?.tab}
            onNavigate={handleNavigate}
          />
        );

      case 'phc_dashboard':
        return <PHCDashboardView onNavigate={handleNavigate} />;

      case 'hospital_dashboard':
        return <HospitalDashboardView onNavigate={handleNavigate} />;

      case 'admin_dashboard':
        return <AdminDashboardView onNavigate={handleNavigate} />;

      case 'patients':
        return <PatientsListView onNavigate={handleNavigate} />;

      case 'patient_profile':
        return (
          <PatientProfileView
            patientId={navState.params?.id || ''}
            onNavigate={handleNavigate}
          />
        );

      case 'new_patient':
        return <RegisterPatientView onNavigate={handleNavigate} />;

      case 'create_referral':
        return (
          <CreateReferralView
            preselectedPatientId={navState.params?.patientId}
            prefillRaviKumar={navState.params?.prefillRaviKumar}
            excludedFacilityIds={navState.params?.excludedFacilityIds}
            onNavigate={handleNavigate}
          />
        );

      case 'referrals':
        return (
          <ReferralsListView
            initialFilter={navState.params?.filter}
            onNavigate={handleNavigate}
          />
        );

      case 'referral_detail':
        return (
          <ReferralDetailView
            referralId={navState.params?.id || ''}
            onNavigate={handleNavigate}
          />
        );

      case 'timeline':
        return (
          <ReferralTimelineView
            referralId={navState.params?.id || ''}
            onNavigate={handleNavigate}
          />
        );

      case 'facilities':
        return <FacilitiesDirectoryView onNavigate={handleNavigate} />;

      case 'admin_facilities':
        return <AdminFacilitiesView onNavigate={handleNavigate} />;

      case 'eirc':
      case 'government_command':
        return <AdminDashboardView onNavigate={handleNavigate} />;

      case 'rural_triage':
        return <AsynchronousTeleTriage onNavigate={handleNavigate} />;

      case 'rural_poc':
        return <PoCDiagnosticsLog onNavigate={handleNavigate} />;

      case 'rural_referrals':
        return <PriorityReferralPipeline onNavigate={handleNavigate} />;

      case 'rural_mobile_units':
        return <MobileUnitFinder onNavigate={handleNavigate} />;

      default:
        return <PHCDashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppShell
      currentView={navState.view}
      currentParams={navState.params}
      onNavigate={handleNavigate}
    >
      {renderCurrentView()}
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <PatientProvider>
        <MainApp />
      </PatientProvider>
    </AppProvider>
  );
}
