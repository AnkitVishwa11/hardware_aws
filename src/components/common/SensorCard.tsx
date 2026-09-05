import React from 'react';
import { StatusBadge } from './StatusBadge';
import { LucideIcon } from 'lucide-react';

export interface SensorCardProps {
  title: string;
  value: string | number | null | undefined;
  unit?: string;
  icon: LucideIcon;
  status?: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  statusLabel?: string;
  subtext?: string;
  delta?: {
    text: string;
    isPositive: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  isDemo?: boolean;
  isRawGas?: boolean;
  badgeContent?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  status = 'NORMAL',
  statusLabel,
  subtext,
  delta,
  isDemo = false,
  isRawGas = false,
  badgeContent,
  children,
  onClick
}) => {
  const isAvailable = value !== null && value !== undefined && value !== 'Not available';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-industrial-900 p-4 transition-all duration-200 hover:border-slate-700 shadow-sm ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Demo Data Watermark Badge */}
      {isDemo && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider text-amber-400 border border-amber-500/25 uppercase">
            Demo Data
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pr-14">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="rounded-lg bg-slate-800/80 p-2 text-mine-cyan border border-slate-700/50">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {title}
          </span>
        </div>
      </div>

      {/* Value Display */}
      <div className="mt-3 flex items-baseline gap-2">
        {isAvailable ? (
          <>
            <span className="font-mono text-2xl font-bold tracking-tight text-white">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-mono font-medium text-slate-400">
                {unit}
              </span>
            )}
          </>
        ) : (
          <span className="font-mono text-base font-semibold text-slate-500 italic">
            Not available
          </span>
        )}
      </div>

      {/* Uncalibrated Gas Sensor Note */}
      {isRawGas && isAvailable && (
        <div className="mt-1">
          <span className="inline-block text-[10px] font-mono text-amber-400/90 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            Raw Sensor Value (ADC)
          </span>
        </div>
      )}

      {/* Delta & Subtext */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5">
        {delta ? (
          <div className="flex items-center gap-1 text-xs font-mono">
            <span
              className={`font-semibold ${
                delta.isNeutral
                  ? 'text-slate-400'
                  : delta.isPositive
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {delta.text}
            </span>
            {delta.label && <span className="text-[11px] text-slate-400">{delta.label}</span>}
          </div>
        ) : subtext ? (
          <span className="text-xs text-slate-400 font-mono truncate">{subtext}</span>
        ) : (
          <span className="text-xs text-slate-400 font-mono">Nominal telemetry</span>
        )}

        {/* Status Badge */}
        {badgeContent || (
          <StatusBadge
            status={statusLabel || status}
            size="sm"
            pulse={status === 'CRITICAL'}
          />
        )}
      </div>

      {/* Optional Sparkline / Child components */}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};
