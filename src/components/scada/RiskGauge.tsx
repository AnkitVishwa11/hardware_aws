import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { RiskAnalysis } from '../../types/sensor';

export interface RiskGaugeProps {
  risk: RiskAnalysis;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ risk }) => {
  const score = risk.score || 10;
  const level = risk.overallRisk || 'NORMAL';

  // Gauge angle calculation (-90 to +90 deg for 180deg semicircle)
  const angle = -90 + (score / 100) * 180;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return <span className="text-[11px] font-bold text-rose-400">CRITICAL</span>;
      case 'WARNING':
      case 'MODERATE':
        return <span className="text-[11px] font-bold text-amber-400">MODERATE</span>;
      case 'NORMAL':
      default:
        return <span className="text-[11px] font-bold text-emerald-400">NORMAL</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />;
      case 'WARNING':
      case 'MODERATE':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
      case 'NORMAL':
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
    }
  };

  const contributingFactors = [
    { name: 'Ground displacement', status: 'NORMAL' },
    { name: 'Rover tilt', status: 'NORMAL' },
    { name: 'Vibration', status: 'NORMAL' },
    { name: 'Gas level', status: 'NORMAL' },
    { name: 'Humidity', status: 'NORMAL' },
    { name: 'Moisture', status: 'MODERATE' }
  ];

  return (
    <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1c2842] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            REAL-TIME STRUCTURAL RISK
          </h3>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
          {level}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Semicircular Gauge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
            {/* Semicircle Gauge SVG */}
            <svg viewBox="0 0 160 90" className="w-48 h-28">
              {/* Background Arc */}
              <path
                d="M 15 80 A 65 65 0 0 1 145 80"
                fill="none"
                stroke="#1c2842"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Green zone (0 - 40%) */}
              <path
                d="M 15 80 A 65 65 0 0 1 65 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.4"
              />
              {/* Amber zone (40 - 75%) */}
              <path
                d="M 65 24 A 65 65 0 0 1 115 32"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="14"
                opacity="0.4"
              />
              {/* Red zone (75 - 100%) */}
              <path
                d="M 115 32 A 65 65 0 0 1 145 80"
                fill="none"
                stroke="#ef4444"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.4"
              />

              {/* Dynamic Needle Pointer */}
              <g transform={`rotate(${angle} 80 80)`}>
                <line x1="80" y1="80" x2="80" y2="22" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="80" cy="80" r="5" fill="#f59e0b" />
              </g>
            </svg>

            {/* Score in Center */}
            <div className="absolute bottom-0 text-center font-mono">
              <span className="text-2xl font-bold text-white leading-none block">{score}</span>
              <span className="text-[10px] text-slate-400">/ 100 INDEX</span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider block">
              Current: {level}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Rule-based multi-sensor assessment
            </span>
          </div>
        </div>

        {/* Right: Contributing Factors Checklist (7 cols) */}
        <div className="lg:col-span-7 font-mono text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            CONTRIBUTING HAZARD FACTORS:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {contributingFactors.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-[#070a12] px-3 py-2 border border-[#1c2842]"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  {getStatusIcon(f.status)}
                  <span className="text-xs">{f.name}</span>
                </div>
                {getStatusBadge(f.status)}
              </div>
            ))}
          </div>

          <div className="mt-3 rounded bg-[#070a12]/60 p-2 text-[10px] text-slate-400 border border-[#1c2842]/60">
            <strong>Prototype Disclaimer:</strong> Calibrated rule-based hazard index for SIH26025 technical evaluation. Architecture ready for future LSTM convergence machine-learning models.
          </div>
        </div>
      </div>
    </div>
  );
};
