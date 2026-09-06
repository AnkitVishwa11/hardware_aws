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
  const moistureColor = hum >= 85 ? 'text-amber-700' : 'text-emerald-700';

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
          strokeWidth="2.5"
          points={svgPoints}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Temperature */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-rose-50 text-rose-600 border border-rose-100">
                <Thermometer className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                Temperature
              </span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
              NORMAL
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{temp.toFixed(1)}</span>
            <span className="text-sm font-semibold text-slate-500">°C</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block mt-0.5 font-medium">Source: DHT11 Sensor</span>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 p-2 px-4">
          {renderSparkline('temperature', '#dc2626')}
        </div>
      </div>

      {/* 2. Humidity */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-sky-50 text-sky-600 border border-sky-100">
                <Droplets className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                Humidity
              </span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
              NORMAL
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{hum}</span>
            <span className="text-sm font-semibold text-slate-500">% RH</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block mt-0.5 font-medium">Source: DHT11 Hygrometer</span>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 p-2 px-4">
          {renderSparkline('humidity', '#0284c7')}
        </div>
      </div>

      {/* 3. Mine Moisture */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-teal-50 text-teal-600 border border-teal-100">
                <Waves className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                Mine Moisture
              </span>
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700 border border-amber-200">
              MODERATE
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className={`text-xl sm:text-2xl font-bold ${moistureColor}`}>{moistureLabel}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block mt-0.5 font-medium">Atmospheric condensation index</span>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 p-2.5 px-4 font-mono text-[11px] text-slate-600 flex items-center justify-between">
          <span>Dew Point: ~24.6 °C</span>
          <span className="text-slate-500 font-semibold">Normal</span>
        </div>
      </div>

      {/* 4. Environmental Gas */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-amber-50 text-amber-600 border border-amber-100">
                <Wind className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                Gas Sensor
              </span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
              NORMAL
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{gas}</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              ADC Count
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block mt-0.5 font-medium">Source: MQ Analog Pin A0</span>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 p-2 px-4">
          {renderSparkline('gas', '#d97706')}
        </div>
      </div>
    </div>
  );
};
