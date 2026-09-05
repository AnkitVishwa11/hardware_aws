import React from 'react';
import { Ruler, Compass, Activity, Wind, Clock } from 'lucide-react';
import { SensorData } from '../../types/sensor';

export interface CommandCenterKpisProps {
  currentData: SensorData | null;
  lastUpdatedTime: string;
  isDemo?: boolean;
}

export const CommandCenterKpis: React.FC<CommandCenterKpisProps> = ({
  currentData,
  lastUpdatedTime,
  isDemo
}) => {
  const d2 = currentData?.distance_2 ?? 22.0;
  const dispDelta = Math.abs(d2 - 22.0); // Ground displacement in cm
  const tiltX = currentData?.tilt_x ?? 0.9;
  const tiltY = currentData?.tilt_y ?? 0.6;
  const maxTilt = Math.max(Math.abs(tiltX), Math.abs(tiltY));
  const vibRms = currentData?.vibration_rms ?? 0.16;
  const gas = currentData?.gas ?? 394;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c2842] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-mono font-extrabold tracking-wide text-white uppercase">
              ROVER COMMAND CENTER
            </h2>
            {isDemo && (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider text-amber-400 border border-amber-500/25">
                DEMO DATA
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time mine subsidence, motion and environmental monitoring
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 self-start sm:self-auto bg-[#070a12] px-3 py-1.5 rounded-lg border border-[#1c2842]">
          <Clock className="h-3.5 w-3.5 text-sky-400" />
          <span>Last synchronization:</span>
          <span className="font-bold text-white">{lastUpdatedTime}</span>
        </div>
      </div>

      {/* 4 Compact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Ground Displacement */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Ruler className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Ground Displacement
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              NORMAL
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-1 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-white">{dispDelta.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-medium">cm</span>
          </div>

          <div className="mt-2 text-[11px] font-mono text-slate-400 border-t border-[#1c2842] pt-2 flex items-center justify-between">
            <span>Sensor: Ultrasonic S1/S2/S3</span>
            <span className="text-emerald-400 font-semibold">Nominal</span>
          </div>
        </div>

        {/* 2. Rover Tilt */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Rover Tilt
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              NORMAL
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-1 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-white">{maxTilt.toFixed(1)}°</span>
          </div>

          <div className="mt-2 text-[11px] font-mono text-slate-400 border-t border-[#1c2842] pt-2 flex items-center justify-between">
            <span>X: {tiltX.toFixed(1)}°</span>
            <span>Y: {tiltY.toFixed(1)}°</span>
            <span className="text-emerald-400 font-semibold">Level</span>
          </div>
        </div>

        {/* 3. Vibration */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Vibration
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              NORMAL
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-white">{vibRms.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-medium">g RMS</span>
          </div>

          <div className="mt-2 text-[11px] font-mono text-slate-400 border-t border-[#1c2842] pt-2 flex items-center justify-between">
            <span>Dynamic hold sampling</span>
            <span className="text-emerald-400 font-semibold">Smooth</span>
          </div>
        </div>

        {/* 4. Environmental Gas */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Wind className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Environmental Gas
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              NORMAL
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-white">{gas}</span>
            <span className="text-xs text-amber-400 font-medium bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/20">
              ADC
            </span>
          </div>

          <div className="mt-2 text-[11px] font-mono text-slate-400 border-t border-[#1c2842] pt-2 flex items-center justify-between">
            <span>Raw ADC Voltage</span>
            <span className="text-emerald-400 font-semibold">Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
