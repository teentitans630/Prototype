import React from 'react';
import { ReferralPriority } from '../types';
import { AlertCircle, AlertTriangle, Clock } from 'lucide-react';

interface PriorityBadgeProps {
  priority: ReferralPriority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
}) => {
  const getPriorityConfig = (p: ReferralPriority) => {
    switch (p) {
      case 'emergency':
        return {
          label: 'Emergency',
          bg: 'bg-red-100 border-red-300 text-red-800',
          icon: AlertCircle,
          iconColor: 'text-red-600',
          pulse: true,
        };
      case 'urgent':
        return {
          label: 'Urgent',
          bg: 'bg-amber-100 border-amber-300 text-amber-800',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          pulse: false,
        };
      case 'routine':
        return {
          label: 'Routine',
          bg: 'bg-slate-100 border-slate-300 text-slate-700',
          icon: Clock,
          iconColor: 'text-slate-500',
          pulse: false,
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-bold tracking-wide uppercase',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wide uppercase',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={`w-3.5 h-3.5 shrink-0 ${config.iconColor}`} />}
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
        </span>
      )}
      <span>{config.label}</span>
    </span>
  );
};
