import React from 'react';
import { SensorData, GroundBaseline } from '../../types/sensor';
import { formatDelta } from '../../utils/formatters';
import { AlertCircle, GitCommit, Layers } from 'lucide-react';

export interface GroundCompareChartProps {
  data: SensorData | null;
  baseline: GroundBaseline;
}

export const GroundCompareChart: React.FC<GroundCompareChartProps> = ({ data, baseline }) => {
  if (!data) return null;

  const d1 = data.distance_1;
  const d2 = data.distance_2;
  const d3 = data.distance_3;

  const delta1 = d1 !== null ? d1 - baseline.sensor_1 : null;
  const delta2 = d2 !== null ? d2 - baseline.sensor_2 : null;
  const delta3 = d3 !== null ? d3 - baseline.sensor_3 : null;

  // Differential tilt: difference between sensor 1 (Left) and sensor 3 (Right)
  const differentialLeftRight = delta1 !== null && delta3 !== null ? delta1 - delta3 : null;

  // Normalize distances for the visual profile (mapping 15cm - 30cm to SVG coordinates)
  const mapY = (dist: number | null) => {
    if (dist === null) return 60;
    // Lower distance = roof sagging downwards towards rover
    // map distance 15cm -> Y: 100 (closer to ground), 25cm -> Y: 30
    const clamped = Math.max(12, Math.min(30, dist));
    return 110 - ((clamped - 12) / (30 - 12)) * 80;
  };

  const y1 = mapY(d1);
  const y2 = mapY(d2);
  const y3 = mapY(d3);

  const getStatusColor = (delta: number | null) => {
    if (delta === null) return 'text-slate-500';
    const abs = Math.abs(delta);
    if (abs >= 4.0) return 'text-rose-400';
    if (abs >= 2.0) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-slate-800 p-2 text-mine-cyan border border-slate-700">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              3-Point Ground Movement Cross-Section Comparison
            </h4>
            <p className="text-xs text-slate-400">
              Differential displacement analysis between Ultrasonic Sensing Points S1, S2, and S3
            </p>
          </div>
        </div>

        {differentialLeftRight !== null && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-1.5 border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">Lateral Differential (S1 - S3):</span>
            <span
              className={`font-bold ${
                Math.abs(differentialLeftRight) > 1.5 ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              {differentialLeftRight > 0 ? '+' : ''}
              {differentialLeftRight.toFixed(2)} cm
            </span>
          </div>
        )}
      </div>

      {/* Cross-Section Graphic */}
      <div className="mt-4 rounded-lg bg-industrial-950 p-4 border border-slate-800/80">
        <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
          <span>UNDERGROUND ROOF / CAVE CEILING CONTOUR SCHEMATIC</span>
          <span className="text-mine-gold">▲ Roof Convergence Line</span>
        </div>

        <svg viewBox="0 0 400 140" className="w-full h-36">
          {/* Background grid */}
          <line x1="20" y1="30" x2="380" y2="30" stroke="#1e293b" strokeDasharray="2 2" />
          <line x1="20" y1="70" x2="380" y2="70" stroke="#1e293b" strokeDasharray="2 2" />
          <line x1="20" y1="110" x2="380" y2="110" stroke="#1e293b" strokeDasharray="2 2" />

          {/* Roof Baseline reference line (dotted gray) */}
          <line x1="40" y1="50" x2="360" y2="50" stroke="#475569" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x="365" y="53" fill="#64748b" fontSize="8" fontFamily="monospace">Baseline (22cm)</text>

          {/* Dynamic Roof Plane Line connecting 3 ultrasonic sensors */}
          <path
            d={`M 60 ${y1} Q 200 ${y2} 340 ${y3}`}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="3"
          />

          {/* Shaded deformation area */}
          <path
            d={`M 60 ${y1} Q 200 ${y2} 340 ${y3} L 340 125 L 60 125 Z`}
            fill="url(#roofGradient)"
            opacity="0.25"
          />

          <defs>
            <linearGradient id="roofGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Sensor 1 Node (Left) */}
          <circle cx="60" cy={y1} r="6" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
          <line x1="60" y1={y1} x2="60" y2="125" stroke="#38bdf8" strokeDasharray="2 2" opacity="0.6" />

          {/* Sensor 2 Node (Center) */}
          <circle cx="200" cy={y2} r="6" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          <line x1="200" y1={y2} x2="200" y2="125" stroke="#f59e0b" strokeDasharray="2 2" opacity="0.6" />

          {/* Sensor 3 Node (Right) */}
          <circle cx="340" cy={y3} r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
          <line x1="340" y1={y3} x2="340" y2="125" stroke="#10b981" strokeDasharray="2 2" opacity="0.6" />

          {/* Rover Body at the bottom */}
          <rect x="40" y="122" width="320" height="12" rx="4" fill="#1e293b" stroke="#334155" />
          <text x="175" y="131" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            ROVER CHASSIS
          </text>
        </svg>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-800">
          <div className="rounded bg-slate-900/60 p-2 border border-slate-800">
            <span className="text-sky-400 font-bold block">Sensor 1 (Left)</span>
            <span className="text-white text-sm font-bold">
              {d1 !== null ? `${d1.toFixed(1)} cm` : 'N/A'}
            </span>
            <span className={`text-[11px] block mt-0.5 ${getStatusColor(delta1)}`}>
              Δ {formatDelta(delta1).text}
            </span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800">
            <span className="text-amber-400 font-bold block">Sensor 2 (Center)</span>
            <span className="text-white text-sm font-bold">
              {d2 !== null ? `${d2.toFixed(1)} cm` : 'N/A'}
            </span>
            <span className={`text-[11px] block mt-0.5 ${getStatusColor(delta2)}`}>
              Δ {formatDelta(delta2).text}
            </span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800">
            <span className="text-emerald-400 font-bold block">Sensor 3 (Right)</span>
            <span className="text-white text-sm font-bold">
              {d3 !== null ? `${d3.toFixed(1)} cm` : 'N/A'}
            </span>
            <span className={`text-[11px] block mt-0.5 ${getStatusColor(delta3)}`}>
              Δ {formatDelta(delta3).text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
