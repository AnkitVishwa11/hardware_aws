import React from 'react';
import { RiskAnalysis } from '../../types/sensor';
import { StatusBadge } from './StatusBadge';
import { ShieldAlert, AlertTriangle, CheckCircle2, Info, Cpu } from 'lucide-react';

export interface RiskCardProps {
  risk: RiskAnalysis;
  isDemo?: boolean;
  detailed?: boolean;
}

export const RiskCard: React.FC<RiskCardProps> = ({ risk, isDemo = false, detailed = false }) => {
  const getFactorIcon = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
      case 'normal':
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
    }
  };

  const scoreColor =
    risk.overallRisk === 'CRITICAL'
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      : risk.overallRisk === 'WARNING'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  const barColor =
    risk.overallRisk === 'CRITICAL'
      ? 'bg-rose-500'
      : risk.overallRisk === 'WARNING'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-slate-800 p-2 text-mine-gold border border-slate-700/60">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                {risk.label}
              </h3>
              {isDemo && (
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider text-amber-400 border border-amber-500/25">
                  DEMO DATA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Multi-sensor fusion evaluation for SIH26025 prototype demonstration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
              Overall Risk Level
            </div>
            <StatusBadge status={risk.overallRisk} size="lg" />
          </div>
        </div>
      </div>

      {/* Risk Score Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-slate-400">Prototype Risk Index (0–100):</span>
          <span className={`px-2 py-0.5 rounded border font-bold ${scoreColor}`}>
            {risk.score} / 100
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.max(5, risk.score)}%` }}
          />
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300/90 leading-relaxed">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <span className="font-semibold text-amber-400 uppercase tracking-wider text-[11px] block mb-0.5">
            Prototype / Demo Thresholds Notice
          </span>
          {risk.disclaimer}
        </div>
      </div>

      {/* Contributing Factors Checklist */}
      <div className="mt-5">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <span>Contributing Factors Breakdown</span>
          <span className="text-[11px] text-slate-400 font-normal">
            ({risk.factors.filter(f => f.status === 'normal').length} Normal,{' '}
            {risk.factors.filter(f => f.status === 'warning').length} Warning,{' '}
            {risk.factors.filter(f => f.status === 'critical').length} Critical)
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {risk.factors.map((factor, idx) => {
            const isAbnormal = factor.status !== 'normal';
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  isAbnormal
                    ? factor.status === 'critical'
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-amber-500/30 bg-amber-500/5'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="mt-0.5">{getFactorIcon(factor.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {factor.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-white shrink-0">
                      {factor.metricValue}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {factor.detail}
                  </p>
                  {detailed && (
                    <p className="text-[10px] text-slate-400 font-mono mt-1 border-t border-slate-800/80 pt-1">
                      Threshold: {factor.threshold}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-4 rounded-lg bg-slate-800/50 border border-slate-700/60 p-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
          <Cpu className="h-3.5 w-3.5 text-mine-cyan" />
          <span>Operational Recommendation</span>
        </div>
        <p className="text-slate-300 font-mono text-[11px]">
          {risk.recommendation}
        </p>
      </div>
    </div>
  );
};
