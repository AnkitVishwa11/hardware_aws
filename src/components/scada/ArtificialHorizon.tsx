import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

export interface ArtificialHorizonProps {
  tiltX: number | null; // Pitch (deg)
  tiltY: number | null; // Roll (deg)
}

export const ArtificialHorizon: React.FC<ArtificialHorizonProps> = ({ tiltX, tiltY }) => {
  const x = tiltX ?? 0.9;
  const y = tiltY ?? 0.6;
  const maxTilt = Math.max(Math.abs(x), Math.abs(y));

  // Compute rotation angle for roll and vertical shift for pitch
  const rollAngle = Math.max(-45, Math.min(45, y * 3));
  const pitchOffset = Math.max(-30, Math.min(30, -x * 2.5));

  const isWarning = maxTilt >= 4.5;
  const isCritical = maxTilt >= 9.0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-sky-50 text-sky-600 border border-sky-100">
            <Compass className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
            ROVER ORIENTATION (INCLINOMETER)
          </h3>
        </div>
        <span className={`rounded px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase border ${
          isCritical
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : isWarning
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {isCritical ? 'CRITICAL TILT' : isWarning ? 'WARNING TILT' : 'STABLE HORIZON'}
        </span>
      </div>

      {/* Artificial Horizon Instrument Graphic */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
        {/* Circle Instrument */}
        <div className="relative h-44 w-44 rounded-full border-4 border-slate-300 bg-slate-100 p-1 shadow-inner overflow-hidden flex items-center justify-center shrink-0">
          {/* Pitch & Roll Dynamic Horizon Plane */}
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `rotate(${rollAngle}deg) translateY(${pitchOffset}px)`
            }}
          >
            {/* Sky (Upper half) */}
            <div className="h-1/2 w-full bg-gradient-to-t from-sky-400 to-sky-600" />
            {/* Ground (Lower half) */}
            <div className="h-1/2 w-full bg-gradient-to-b from-amber-700 to-amber-900" />
            {/* Artificial Horizon Center Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2.5px] -translate-y-1/2 bg-white shadow-md" />
          </div>

          {/* Fixed Pitch Reference Ladder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-[8px] font-mono text-white/90">
            <div className="w-10 border-b-2 border-white/80 mb-2" />
            <div className="w-16 border-b-2 border-white mb-2" />
            <div className="w-10 border-b-2 border-white/80" />
          </div>

          {/* Fixed Center Reticle / Crosshair */}
          <div className="absolute z-10 pointer-events-none flex items-center justify-center">
            <div className="h-3 w-3 rounded-full border-2 border-amber-300 bg-amber-400/40 shadow" />
            <div className="absolute h-0.5 w-16 bg-amber-300 shadow -translate-y-0.5" />
          </div>

          {/* Degree Ring Marks */}
          <div className="absolute inset-1 rounded-full border border-dashed border-white/40 pointer-events-none" />
        </div>

        {/* Readouts Table */}
        <div className="w-full sm:w-auto font-mono space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Pitch (Axis X)</span>
              <span className="text-base font-bold text-slate-900">
                {x.toFixed(1)}°
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Roll (Axis Y)</span>
              <span className="text-base font-bold text-slate-900">
                {y.toFixed(1)}°
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-600 font-semibold">Maximum Tilt:</span>
            <span className="text-sm font-bold text-amber-700">{maxTilt.toFixed(1)}°</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
        <span>6-DOF IMU Gravity Reference</span>
        <span>Baseline Limit: 4.5° Warn / 9.0° Crit</span>
      </div>
    </div>
  );
};
