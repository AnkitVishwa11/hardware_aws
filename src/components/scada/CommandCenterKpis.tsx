import React from 'react';
import { Ruler, Compass, Activity, Wind, Clock, Satellite, BatteryCharging, ShieldAlert } from 'lucide-react';
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
  const batt = currentData?.battery_voltage ?? 12.4;
  const sats = currentData?.satellites ?? 9;

  const isDispWarn = dispDelta >= 2.0;
  const isTiltWarn = maxTilt >= 4.0;
  const isVibWarn = vibRms >= 0.35;
  const isGasWarn = gas >= 520;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-mono font-extrabold tracking-wide text-slate-900 uppercase">
              EXECUTIVE COMMAND CENTER
            </h2>
            {isDemo && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-amber-800 border border-amber-300">
                1S LIVE SIMULATION
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-time multi-sensor telemetry stream from Underground Coal Panel P-4B
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 self-start sm:self-auto bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <Clock className="h-3.5 w-3.5 text-sky-600" />
          <span>Last Sync:</span>
          <span className="font-bold text-slate-900">{lastUpdatedTime}</span>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Ground Displacement */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-2 bg-sky-50 text-sky-600 border border-sky-200">
                <Ruler className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Ground Sag (S2)
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isDispWarn ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isDispWarn ? 'WARN' : 'NOMINAL'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
                {dispDelta.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">cm Δ</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Base: 22.0cm</span>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Clearance: {d2.toFixed(1)} cm</span>
            <span className="text-sky-600 font-semibold">Sensor S2 Center</span>
          </div>
        </div>

        {/* 2. Rover Tilt */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-2 bg-amber-50 text-amber-600 border border-amber-200">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Ground Incline (Tilt)
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isTiltWarn ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isTiltWarn ? 'HIGH TILT' : 'STABLE'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
                {maxTilt.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">°</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Pitch / Roll</span>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>X: {tiltX.toFixed(1)}° | Y: {tiltY.toFixed(1)}°</span>
            <span className="text-amber-600 font-semibold">MPU6050 IMU</span>
          </div>
        </div>

        {/* 3. Vibration RMS */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-2 bg-purple-50 text-purple-600 border border-purple-200">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Vibration RMS
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isVibWarn ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isVibWarn ? 'CRITICAL SHOCK' : 'LOW NOISE'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
                {vibRms.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">g RMS</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Limit: 0.35g</span>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Seismic Micro-Cracks</span>
            <span className="text-purple-600 font-semibold">3-Axis Accel</span>
          </div>
        </div>

        {/* 4. Atmospheric Gas */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-2 bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Wind className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Raw Gas ADC
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isGasWarn ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isGasWarn ? 'GAS ELEVATED' : 'NORMAL'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
                {gas}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">ADC</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Scale: 0-1023</span>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>MQ Gas Sensor</span>
            <span className="text-emerald-600 font-semibold">Uncalibrated Raw</span>
          </div>
        </div>
      </div>
    </div>
  );
};
