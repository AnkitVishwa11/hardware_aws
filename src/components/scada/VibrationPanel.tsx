import React from 'react';
import { Activity, Radio, AlertCircle } from 'lucide-react';
import { SensorData } from '../../types/sensor';
import { TimeSeriesLineChart } from '../charts/TimeSeriesLineChart';

export interface VibrationPanelProps {
  currentData: SensorData | null;
  history: SensorData[];
}

export const VibrationPanel: React.FC<VibrationPanelProps> = ({ currentData, history }) => {
  const rms = currentData?.vibration_rms ?? 0.16;
  const peak = currentData?.accel_z ? Math.abs(currentData.accel_z - 9.8) + rms * 1.5 : 0.38;

  const isWarning = rms >= 0.28;
  const isCritical = rms >= 0.55;

  const status = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'NORMAL';

  return (
    <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1c2842] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            VIBRATION ANALYSIS & SEISMIC MONITOR
          </h3>
        </div>
        <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase border ${
          status === 'CRITICAL'
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            : status === 'WARNING'
            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        }`}>
          {status} STATUS
        </span>
      </div>

      {/* KPI Numbers */}
      <div className="grid grid-cols-2 gap-3 mb-3 font-mono">
        <div className="rounded-lg bg-[#070a12] p-3 border border-[#1c2842]">
          <span className="text-[10px] text-slate-400 uppercase block">RMS Vibration</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-white">{rms.toFixed(2)}</span>
            <span className="text-xs text-slate-400">g RMS</span>
          </div>
        </div>

        <div className="rounded-lg bg-[#070a12] p-3 border border-[#1c2842]">
          <span className="text-[10px] text-slate-400 uppercase block">Peak Vibration</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-amber-400">{peak.toFixed(2)}</span>
            <span className="text-xs text-slate-400">g Peak</span>
          </div>
        </div>
      </div>

      {/* Real-Time Line Graph */}
      <div className="rounded-lg bg-[#070a12] p-2 border border-[#1c2842]">
        <div className="text-[10px] font-mono text-slate-400 mb-1 px-1 flex items-center justify-between">
          <span>VIBRATION RMS TREND (g)</span>
          <span className="text-slate-500">Threshold: 0.28g</span>
        </div>
        <TimeSeriesLineChart
          data={history}
          series={[{ key: 'vibration_rms', name: 'RMS (g)', color: '#f59e0b', unit: 'g' }]}
          height={150}
          warningThreshold={0.28}
          criticalThreshold={0.55}
        />
      </div>

      {/* Station Hold Banner */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-[#1c2842] pt-2">
        <span>Station Hold: {currentData?.measurement_point || 'Transit Mode'}</span>
        <span className="text-emerald-400">Stationary hold eliminates wheel bounce</span>
      </div>
    </div>
  );
};
