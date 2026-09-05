import React from 'react';

export interface StatusBadgeProps {
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'ONLINE' | 'OFFLINE' | 'STALE' | 'NO_DATA' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'INFO' | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
  pulse = false
}) => {
  const normalized = status?.toUpperCase() || 'NO_DATA';

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  switch (normalized) {
    case 'NORMAL':
    case 'ONLINE':
    case 'RESOLVED':
      colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      dotColor = 'bg-emerald-400';
      break;
    case 'WARNING':
    case 'STALE':
    case 'ACKNOWLEDGED':
    case 'CAUTION':
    case 'MODERATE':
      colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      dotColor = 'bg-amber-400';
      break;
    case 'CRITICAL':
    case 'OFFLINE':
    case 'ACTIVE':
    case 'HIGH':
      colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      dotColor = 'bg-rose-400';
      break;
    case 'INFO':
      colorClasses = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      dotColor = 'bg-sky-400';
      break;
    case 'NO_DATA':
    default:
      colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
      dotColor = 'bg-slate-500';
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-bold'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses} ${className} font-mono uppercase tracking-wider`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColor} ${
            pulse || normalized === 'STALE' || normalized === 'CRITICAL' ? 'animate-pulse' : ''
          }`}
        />
      )}
      {normalized}
    </span>
  );
};
