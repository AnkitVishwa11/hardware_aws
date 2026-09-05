import React from 'react';
import { Thermometer, Droplets, Waves, Wind } from 'lucide-react';
import { SensorData } from '../../types/sensor';

export interface EnvironmentalRowProps {
  currentData: SensorData | null;
  history: SensorData[];
  isDemo?: boolean;
}

export const EnvironmentalRow: React.FC<EnvironmentalRowProps> = ({ currentData, history, isDemo }) => {
  const temp = currentData?.temperature ?? 29.3;
  const hum = currentData?.humidity ?? 76;
  const gas = currentData?.gas ?? 394;

  const moistureLabel = hum >= 85 ? 'High Moisture' : hum >= 65 ? 'Moderate' : 'Normal';
  const moistureColor = hum >= 85 ? 'text-amber-400' : 'text-emerald-400';

  // Helper to draw mini svg trendline
  const renderSparkline = (dataKey: 'temperature' | 'humidity' | 'gas', strokeColor: string) => {
    const points = history.slice(-15);
    if (points.length < 2) return null;

    const values = points.map(p => (p[dataKey] as number) ?? 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const svgPoints = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 120;
      const y = 28 - ((v - min) / range) * 22;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 120 32" className="w-full h-8 overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          points={svgPoints}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Temperature */}
      <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Thermometer className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Temperature
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              NORMAL
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-white">{temp.toFixed(1)}</span>
            <span className="text-sm font-medium text-slate-400">°C</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block mt-0.5">Source: DHT11 Sensor</span>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1c2842]">
          {renderSparkline('temperature', '#ef4444')}
        </div>
      </div>

      {/* 2. Humidity */}
      <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Droplets className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Humidity
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              NORMAL
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-white">{hum}</span>
            <span className="text-sm font-medium text-slate-400">% RH</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block mt-0.5">Source: DHT11 Hygrometer</span>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1c2842]">
          {renderSparkline('humidity', '#0ea5e9')}
        </div>
      </div>

      {/* 3. Mine Moisture */}
      <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Waves className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Mine Moisture
              </span>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400 border border-amber-500/30">
              MODERATE
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className={`text-xl sm:text-2xl font-bold ${moistureColor}`}>{moistureLabel}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block mt-0.5">Atmospheric condensation index</span>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1c2842] font-mono text-[11px] text-slate-400 flex items-center justify-between">
          <span>Dew Point: ~24.6 °C</span>
          <span className="text-slate-500">Normal Range</span>
        </div>
      </div>

      {/* 4. Environmental Gas */}
      <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Wind className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Gas Sensor
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              NORMAL
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-white">{gas}</span>
            <span className="text-xs font-medium text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/20">
              ADC Count
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block mt-0.5">Source: MQ Analog Pin A0</span>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1c2842]">
          {renderSparkline('gas', '#f59e0b')}
        </div>
      </div>
    </div>
  );
};
