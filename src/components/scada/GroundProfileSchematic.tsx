import React from 'react';
import { Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDelta } from '../../utils/formatters';

export interface GroundProfileSchematicProps {
  d1: number | null;
  d2: number | null;
  d3: number | null;
  b1: number;
  b2: number;
  b3: number;
}

export const GroundProfileSchematic: React.FC<GroundProfileSchematicProps> = ({
  d1 = 21.8,
  d2 = 22.1,
  d3 = 21.9,
  b1 = 22.0,
  b2 = 22.0,
  b3 = 22.0
}) => {
  const val1 = d1 ?? 22.0;
  const val2 = d2 ?? 22.0;
  const val3 = d3 ?? 22.0;

  const delta1 = val1 - b1;
  const delta2 = val2 - b2;
  const delta3 = val3 - b3;

  const maxDisplacement = Math.max(Math.abs(delta1), Math.abs(delta2), Math.abs(delta3));
  const diffDisplacement = Math.abs(delta1 - delta3);
  const isWarning = maxDisplacement >= 2.0;

  // Map 14-28cm distance to SVG Y coordinates (14cm = 95 close to rover, 28cm = 25 high ceiling)
  const mapY = (dist: number) => {
    const clamped = Math.max(14, Math.min(28, dist));
    return 100 - ((clamped - 14) / (28 - 14)) * 75;
  };

  const y1 = mapY(val1);
  const y2 = mapY(val2);
  const y3 = mapY(val3);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-sky-50 text-sky-600 border border-sky-100">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
            3-POINT GROUND PROFILE (CROSS-SECTION)
          </h3>
        </div>
        <span className="font-mono text-[9px] text-slate-500 font-medium bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
          Convergence Plane
        </span>
      </div>

      {/* SVG Technical Roof Cross-Section */}
      <div className="relative rounded-lg bg-slate-50 p-2.5 border border-slate-200 my-0.5">
        <div className="text-[9px] font-mono text-slate-500 mb-1 flex items-center justify-between font-semibold">
          <span>MINE ROOF CONVERGENCE PROFILE</span>
          <span className="text-amber-600 font-bold">S1 ─── S2 ─── S3</span>
        </div>

        <svg viewBox="0 0 380 130" className="w-full h-28">
          {/* Depth Grid Lines */}
          <line x1="30" y1="25" x2="350" y2="25" stroke="#e2e8f0" strokeDasharray="2 2" />
          <line x1="30" y1="62" x2="350" y2="62" stroke="#e2e8f0" strokeDasharray="2 2" />
          <line x1="30" y1="100" x2="350" y2="100" stroke="#e2e8f0" strokeDasharray="2 2" />

          {/* Calibrated Roof Baseline (dashed reference) */}
          <line x1="45" y1="50" x2="335" y2="50" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x="340" y="53" fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold">Base (22cm)</text>

          {/* Curved deformation line connecting 3 ultrasonic beams */}
          <path
            d={`M 60 ${y1} Q 190 ${y2} 320 ${y3}`}
            fill="none"
            stroke={isWarning ? "#d97706" : "#0284c7"}
            strokeWidth="3"
          />

          {/* Area fill under roof curve */}
          <path
            d={`M 60 ${y1} Q 190 ${y2} 320 ${y3} L 320 115 L 60 115 Z`}
            fill="url(#roofDeformGradLight)"
            opacity="0.2"
          />

          <defs>
            <linearGradient id="roofDeformGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isWarning ? "#d97706" : "#0284c7"} />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Sensor 1 Beam (Left) */}
          <line x1="60" y1={y1} x2="60" y2="115" stroke="#0284c7" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="60" cy={y1} r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
          <text x="45" y={y1 - 10} fill="#0369a1" fontSize="9" fontFamily="monospace" fontWeight="bold">S1: {val1.toFixed(1)}</text>

          {/* Sensor 2 Beam (Center) */}
          <line x1="190" y1={y2} x2="190" y2="115" stroke="#d97706" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="190" cy={y2} r="5" fill="#d97706" stroke="#ffffff" strokeWidth="1.5" />
          <text x="175" y={y2 - 10} fill="#b45309" fontSize="9" fontFamily="monospace" fontWeight="bold">S2: {val2.toFixed(1)}</text>

          {/* Sensor 3 Beam (Right) */}
          <line x1="320" y1={y3} x2="320" y2="115" stroke="#059669" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="320" cy={y3} r="5" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
          <text x="305" y={y3 - 10} fill="#047857" fontSize="9" fontFamily="monospace" fontWeight="bold">S3: {val3.toFixed(1)}</text>

          {/* Rover Chassis at the base */}
          <rect x="40" y="114" width="300" height="12" rx="3" fill="#e2e8f0" stroke="#cbd5e1" />
          <text x="150" y="123" fill="#475569" fontSize="8" fontFamily="monospace" fontWeight="bold">ROVER CHASSIS BED</text>
        </svg>
      </div>

      {/* 4 Key Measurements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 font-mono text-xs">
        <div className="rounded bg-slate-50 p-2 border border-slate-200">
          <span className="text-[9px] text-slate-500 block font-semibold">Ground Movement</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900">
            {delta2 > 0 ? '+' : ''}{delta2.toFixed(1)} cm
          </span>
        </div>

        <div className="rounded bg-slate-50 p-2 border border-slate-200">
          <span className="text-[9px] text-slate-500 block font-semibold">Roof Convergence</span>
          <span className="text-xs sm:text-sm font-bold text-sky-700">
            {maxDisplacement.toFixed(1)} cm
          </span>
        </div>

        <div className="rounded bg-slate-50 p-2 border border-slate-200">
          <span className="text-[9px] text-slate-500 block font-semibold">Diff S1-S3</span>
          <span className="text-xs sm:text-sm font-bold text-amber-700">
            {diffDisplacement.toFixed(1)} cm
          </span>
        </div>

        <div className="rounded bg-slate-50 p-2 border border-slate-200">
          <span className="text-[9px] text-slate-500 block font-semibold">Max Displace</span>
          <span className={`text-xs sm:text-sm font-bold ${isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
            {maxDisplacement.toFixed(1)} cm
          </span>
        </div>
      </div>
    </div>
  );
};
