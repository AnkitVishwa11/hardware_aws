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
    <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1c2842] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-sky-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            ROVER ORIENTATION (INCLINOMETER)
          </h3>
        </div>
        <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase border ${
          isCritical
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            : isWarning
            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        }`}>
          {isCritical ? 'CRITICAL TILT' : isWarning ? 'WARNING TILT' : 'STABLE HORIZON'}
        </span>
      </div>

      {/* Artificial Horizon Instrument Graphic */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
        {/* Circle Instrument */}
        <div className="relative h-44 w-44 rounded-full border-2 border-[#2a3b5e] bg-[#070a12] p-1 shadow-inner overflow-hidden flex items-center justify-center shrink-0">
          {/* Pitch & Roll Dynamic Horizon Plane */}
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `rotate(${rollAngle}deg) translateY(${pitchOffset}px)`
            }}
          >
            {/* Sky (Upper half) */}
            <div className="h-1/2 w-full bg-gradient-to-t from-sky-950/80 to-[#0c1e3a]" />
            {/* Ground (Lower half) */}
            <div className="h-1/2 w-full bg-gradient-to-b from-amber-950/70 to-[#1e1308]" />
            {/* Artificial Horizon Center Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-amber-400 shadow-sm" />
          </div>

          {/* Fixed Pitch Reference Ladder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-[8px] font-mono text-slate-400/80">
            <div className="w-10 border-b border-slate-500/60 mb-2" />
            <div className="w-16 border-b border-slate-400/70 mb-2" />
            <div className="w-10 border-b border-slate-500/60" />
          </div>

          {/* Fixed Center Reticle / Crosshair */}
          <div className="absolute z-10 pointer-events-none flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full border-2 border-amber-400 bg-amber-400/20" />
            <div className="absolute h-0.5 w-14 bg-amber-400/80 -translate-y-0.5" />
          </div>

          {/* Degree Ring Marks */}
          <div className="absolute inset-1 rounded-full border border-dashed border-slate-600/40 pointer-events-none" />
        </div>

        {/* Readouts Table */}
        <div className="w-full sm:w-auto font-mono space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-xs">
            <div className="rounded-lg bg-[#070a12] p-2.5 border border-[#1c2842]">
              <span className="text-[10px] text-slate-400 uppercase block">Pitch (Axis X)</span>
              <span className="text-base font-bold text-white">
                {x.toFixed(1)}°
              </span>
            </div>

            <div className="rounded-lg bg-[#070a12] p-2.5 border border-[#1c2842]">
              <span className="text-[10px] text-slate-400 uppercase block">Roll (Axis Y)</span>
              <span className="text-base font-bold text-white">
                {y.toFixed(1)}°
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-[#0c1222] p-2.5 border border-[#1c2842] flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-400">Maximum Tilt:</span>
            <span className="text-sm font-bold text-amber-400">{maxTilt.toFixed(1)}°</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between border-t border-[#1c2842] pt-2">
        <span>6-DOF IMU Gravity Reference</span>
        <span>Baseline Limit: 4.5° Warn / 9.0° Crit</span>
      </div>
    </div>
  );
};
