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
    <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1c2842] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-sky-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            3-POINT GROUND PROFILE (CROSS-SECTION)
          </h3>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          Schematic Convergence Plane
        </span>
      </div>

      {/* SVG Technical Roof Cross-Section */}
      <div className="relative rounded-lg bg-[#070a12] p-3 border border-[#1c2842] my-1">
        <div className="text-[10px] font-mono text-slate-500 mb-1 flex items-center justify-between">
          <span>MINE CEILING ROOF CONVERGENCE PROFILE</span>
          <span className="text-amber-400 font-semibold">S1 ─── S2 ─── S3</span>
        </div>

        <svg viewBox="0 0 380 130" className="w-full h-32">
          {/* Depth Grid Lines */}
          <line x1="30" y1="25" x2="350" y2="25" stroke="#1c2842" strokeDasharray="2 2" />
          <line x1="30" y1="62" x2="350" y2="62" stroke="#1c2842" strokeDasharray="2 2" />
          <line x1="30" y1="100" x2="350" y2="100" stroke="#1c2842" strokeDasharray="2 2" />

          {/* Calibrated Roof Baseline (dashed reference) */}
          <line x1="45" y1="50" x2="335" y2="50" stroke="#475569" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x="340" y="53" fill="#64748b" fontSize="8" fontFamily="monospace">Base (22cm)</text>

          {/* Curved deformation line connecting 3 ultrasonic beams */}
          <path
            d={`M 60 ${y1} Q 190 ${y2} 320 ${y3}`}
            fill="none"
            stroke={isWarning ? "#f59e0b" : "#0ea5e9"}
            strokeWidth="3"
          />

          {/* Area fill under roof curve */}
          <path
            d={`M 60 ${y1} Q 190 ${y2} 320 ${y3} L 320 115 L 60 115 Z`}
            fill="url(#roofDeformGrad)"
            opacity="0.25"
          />

          <defs>
            <linearGradient id="roofDeformGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isWarning ? "#f59e0b" : "#0ea5e9"} />
              <stop offset="100%" stopColor="#070a12" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Sensor 1 Beam (Left) */}
          <line x1="60" y1={y1} x2="60" y2="115" stroke="#38bdf8" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="60" cy={y1} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          <text x="45" y={y1 - 10} fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">S1: {val1.toFixed(1)}</text>

          {/* Sensor 2 Beam (Center) */}
          <line x1="190" y1={y2} x2="190" y2="115" stroke="#f59e0b" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="190" cy={y2} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          <text x="175" y={y2 - 10} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">S2: {val2.toFixed(1)}</text>

          {/* Sensor 3 Beam (Right) */}
          <line x1="320" y1={y3} x2="320" y2="115" stroke="#10b981" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="320" cy={y3} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
          <text x="305" y={y3 - 10} fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">S3: {val3.toFixed(1)}</text>

          {/* Rover Chassis at the base */}
          <rect x="40" y="114" width="300" height="12" rx="3" fill="#1e293b" stroke="#334155" />
          <text x="155" y="123" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">ROVER CHASSIS BED</text>
        </svg>
      </div>

      {/* 4 Key Measurements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 font-mono text-xs">
        <div className="rounded bg-[#070a12] p-2 border border-[#1c2842]">
          <span className="text-[10px] text-slate-400 block">Ground Movement</span>
          <span className="text-sm font-bold text-white">
            {delta2 > 0 ? '+' : ''}{delta2.toFixed(1)} cm
          </span>
        </div>

        <div className="rounded bg-[#070a12] p-2 border border-[#1c2842]">
          <span className="text-[10px] text-slate-400 block">Roof Convergence</span>
          <span className="text-sm font-bold text-sky-400">
            {maxDisplacement.toFixed(1)} cm
          </span>
        </div>

        <div className="rounded bg-[#070a12] p-2 border border-[#1c2842]">
          <span className="text-[10px] text-slate-400 block">Differential S1-S3</span>
          <span className="text-sm font-bold text-amber-400">
            {diffDisplacement.toFixed(1)} cm
          </span>
        </div>

        <div className="rounded bg-[#070a12] p-2 border border-[#1c2842]">
          <span className="text-[10px] text-slate-400 block">Max Displacement</span>
          <span className={`text-sm font-bold ${isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
            {maxDisplacement.toFixed(1)} cm
          </span>
        </div>
      </div>
    </div>
  );
};
