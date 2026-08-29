import React from 'react';
import { ReferralStatus } from '../types';

interface StatusBadgeProps {
  status: ReferralStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const getStatusConfig = (s: ReferralStatus) => {
    switch (s) {
      case 'pending':
        return {
          label: 'Pending',
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'accepted':
        return {
          label: 'Accepted',
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          dot: 'bg-blue-500',
        };
      case 'patient_arrived':
        return {
          label: 'Patient Arrived',
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          dot: 'bg-indigo-500',
        };
      case 'under_treatment':
        return {
          label: 'Under Treatment',
          bg: 'bg-purple-50 border-purple-200 text-purple-800',
          dot: 'bg-purple-500 animate-pulse',
        };
      case 'completed':
        return {
          label: 'Completed',
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'rejected':
        return {
          label: 'Rejected',
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-500',
        };
      case 'referred_further':
        return {
          label: 'Referred Further',
          bg: 'bg-teal-50 border-teal-200 text-teal-800',
          dot: 'bg-teal-500',
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${config.bg} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      )}
      <span>{config.label}</span>
    </span>
  );
};
