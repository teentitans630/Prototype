import React from 'react';
import { PatientProfileView as ModularPatientProfileView } from '../components/PatientProfileView';

interface PatientProfileViewProps {
  patientId: string;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patientId,
  onNavigate,
}) => {
  return (
    <ModularPatientProfileView
      patientId={patientId}
      onNavigate={onNavigate}
      onBack={() => onNavigate('patients')}
    />
  );
};
