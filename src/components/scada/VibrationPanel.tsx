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
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-100">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
            VIBRATION ANALYSIS & SEISMIC MONITOR
          </h3>
        </div>
        <span className={`rounded px-2 py-0.2 font-mono text-[9px] font-bold uppercase border ${
          status === 'CRITICAL'
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : status === 'WARNING'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {status}
        </span>
      </div>

      {/* KPI Numbers */}
      <div className="grid grid-cols-2 gap-2.5 mb-2.5 font-mono">
        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
          <span className="text-[9px] text-slate-500 font-semibold uppercase block">RMS Vibration</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-slate-900">{rms.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 font-medium">g RMS</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
          <span className="text-[9px] text-slate-500 font-semibold uppercase block">Peak Vibration</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-amber-600">{peak.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 font-medium">g Peak</span>
          </div>
        </div>
      </div>

      {/* Real-Time Line Graph */}
      <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-200">
        <div className="text-[9px] font-mono text-slate-600 font-semibold mb-1 px-1 flex items-center justify-between">
          <span>VIBRATION RMS TREND (g)</span>
          <span className="text-slate-500">Threshold: 0.28g</span>
        </div>
        <TimeSeriesLineChart
          data={history}
          series={[{ key: 'vibration_rms', name: 'RMS (g)', color: '#d97706', unit: 'g' }]}
          height={130}
          warningThreshold={0.28}
          criticalThreshold={0.55}
        />
      </div>

      {/* Station Hold Banner */}
      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-600 border-t border-slate-100 pt-1.5">
        <span>Station Hold: <strong>{currentData?.measurement_point || 'Transit'}</strong></span>
        <span className="text-emerald-700 font-semibold">Hold mode active</span>
      </div>
    </div>
  );
};
