import React, { useState } from 'react';
import { SensorData, GroundBaseline } from '../../types/sensor';
import { TimeSeriesLineChart } from '../charts/TimeSeriesLineChart';
import { GroundCompareChart } from '../charts/GroundCompareChart';
import { SensorCard } from '../common/SensorCard';
import { formatMetric, formatDelta } from '../../utils/formatters';
import { DISCLAIMERS, PROTOTYPE_THRESHOLDS } from '../../utils/constants';
import { Ruler, Info, RotateCcw, Sliders, TrendingDown, Layers, Activity } from 'lucide-react';

export interface GroundMonitoringTabProps {
  currentData: SensorData | null;
  history: SensorData[];
  baseline: GroundBaseline;
  onResetBaseline: () => void;
  onSetCustomBaseline: (newBaseline: GroundBaseline) => void;
  isDemo?: boolean;
}

export const GroundMonitoringTab: React.FC<GroundMonitoringTabProps> = ({
  currentData,
  history,
  baseline,
  onResetBaseline,
  onSetCustomBaseline,
  isDemo = false
}) => {
  const [showBaselineModal, setShowBaselineModal] = useState(false);
  const [customB1, setCustomB1] = useState(baseline.sensor_1.toString());
  const [customB2, setCustomB2] = useState(baseline.sensor_2.toString());
  const [customB3, setCustomB3] = useState(baseline.sensor_3.toString());

  if (!currentData) return null;

  const d1 = currentData.distance_1;
  const d2 = currentData.distance_2;
  const d3 = currentData.distance_3;

  const b1 = baseline.sensor_1;
  const b2 = baseline.sensor_2;
  const b3 = baseline.sensor_3;

  const delta1 = d1 !== null ? d1 - b1 : null;
  const delta2 = d2 !== null ? d2 - b2 : null;
  const delta3 = d3 !== null ? d3 - b3 : null;

  const pct1 = delta1 !== null && b1 !== 0 ? (delta1 / b1) * 100 : null;
  const pct2 = delta2 !== null && b2 !== 0 ? (delta2 / b2) * 100 : null;
  const pct3 = delta3 !== null && b3 !== 0 ? (delta3 / b3) * 100 : null;

  // Rate of change over historical records (cm/min)
  const calculateRate = (sensorKey: 'distance_1' | 'distance_2' | 'distance_3') => {
    if (history.length < 2) return null;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    const vLast = last[sensorKey];
    const vPrev = prev[sensorKey];
    if (vLast === null || vPrev === null) return null;
    const dtMin = (new Date(last.timestamp).getTime() - new Date(prev.timestamp).getTime()) / (1000 * 60);
    if (dtMin <= 0) return 0;
    return (vLast - vPrev) / dtMin;
  };

  const rate1 = calculateRate('distance_1');
  const rate2 = calculateRate('distance_2');
  const rate3 = calculateRate('distance_3');

  const handleSaveCustomBaseline = (e: React.FormEvent) => {
    e.preventDefault();
    onSetCustomBaseline({
      sensor_1: parseFloat(customB1) || 22.0,
      sensor_2: parseFloat(customB2) || 22.0,
      sensor_3: parseFloat(customB3) || 22.0,
      set_at: new Date().toISOString()
    });
    setShowBaselineModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Geotechnical Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold uppercase tracking-wider text-white">
              Ground & Subsidence Monitoring
            </h2>
            {isDemo && (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-400 border border-amber-500/30">
                DEMO DATA
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Real-time acoustic clearance monitoring using 3 × HC-SR04 ultrasonic transducer arrays
          </p>
        </div>

        {/* Baseline controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetBaseline}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Reset baseline to current sensor readings"
          >
            <RotateCcw className="h-3.5 w-3.5 text-mine-gold" />
            <span>Zero Baseline to Current</span>
          </button>
          <button
            onClick={() => setShowBaselineModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Configure custom baseline parameters"
          >
            <Sliders className="h-3.5 w-3.5 text-mine-cyan" />
            <span>Calibrate</span>
          </button>
        </div>
      </div>

      {/* Mandatory Geotechnical Disclaimer Alert */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300/90 leading-relaxed shadow-sm">
        <Info className="h-5 w-5 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Mining Geotechnical Notice & Calibration Boundaries
          </span>
          {DISCLAIMERS.geotechnical}
          <div className="mt-1 font-mono text-[11px] text-amber-300/80">
            Current Calibration Baseline: S1 = {b1.toFixed(1)} cm | S2 = {b2.toFixed(1)} cm | S3 = {b3.toFixed(1)} cm (Zeroed: {new Date(baseline.set_at).toLocaleTimeString()})
          </div>
        </div>
      </div>

      {/* 3 Dedicated HC-SR04 Sensor Detail Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Sensor 1 */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                HC-SR04 Sensor 1 (Port / Left)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">GPIO Trigger/Echo</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-white">
                {d1 !== null ? `${d1.toFixed(1)}` : 'Not available'}
              </span>
              {d1 !== null && <span className="text-xs font-mono text-slate-400 ml-1">cm</span>}
            </div>
            <span className="text-xs font-mono text-slate-400">
              Base: {b1.toFixed(1)} cm
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
            <div className="rounded bg-slate-950 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Change (Δd)</span>
              <span className={`font-bold ${delta1 !== null && Math.abs(delta1) >= 2.0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {formatDelta(delta1).text}
              </span>
            </div>
            <div className="rounded bg-slate-950 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Relative %</span>
              <span className="font-bold text-slate-200">
                {pct1 !== null ? `${pct1 > 0 ? '+' : ''}${pct1.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Rate of Change:</span>
            <span className="font-semibold text-white">
              {rate1 !== null ? `${rate1 > 0 ? '+' : ''}${rate1.toFixed(2)} cm/min` : 'Calibrating...'}
            </span>
          </div>
        </div>

        {/* Sensor 2 */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                HC-SR04 Sensor 2 (Center Roof)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">GPIO Trigger/Echo</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-white">
                {d2 !== null ? `${d2.toFixed(1)}` : 'Not available'}
              </span>
              {d2 !== null && <span className="text-xs font-mono text-slate-400 ml-1">cm</span>}
            </div>
            <span className="text-xs font-mono text-slate-400">
              Base: {b2.toFixed(1)} cm
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
            <div className="rounded bg-slate-950 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Change (Δd)</span>
              <span className={`font-bold ${delta2 !== null && Math.abs(delta2) >= 2.0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {formatDelta(delta2).text}
              </span>
            </div>
            <div className="rounded bg-slate-950 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Relative %</span>
              <span className="font-bold text-slate-200">
                {pct2 !== null ? `${pct2 > 0 ? '+' : ''}${pct2.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Rate of Change:</span>
            <span className="font-semibold text-white">
              {rate2 !== null ? `${rate2 > 0 ? '+' : ''}${rate2.toFixed(2)} cm/min` : 'Calibrating...'}
            </span>
          </div>
        </div>

        {/* Sensor 3 */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                HC-SR04 Sensor 3 (Starboard / Right)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">GPIO Trigger/Echo</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-white">
                {d3 !== null ? `${d3.toFixed(1)}` : 'Not available'}
              </span>
              {d3 !== null && <span className="text-xs font-mono text-slate-400 ml-1">cm</span>}
            </div>
            <span className="text-xs font-mono text-slate-400">
              Base: {b3.toFixed(1)} cm
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
            <div className="rounded bg-slate-950 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Change (Δd)</span>
              <span className={`font-bold ${delta3 !== null && Math.abs(delta3) >= 2.0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {formatDelta(delta3).text}
              </span>
            </div>
            <div className="rounded bg-slate-950 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Relative %</span>
              <span className="font-bold text-slate-200">
                {pct3 !== null ? `${pct3 > 0 ? '+' : ''}${pct3.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Rate of Change:</span>
            <span className="font-semibold text-white">
              {rate3 !== null ? `${rate3 > 0 ? '+' : ''}${rate3.toFixed(2)} cm/min` : 'Calibrating...'}
            </span>
          </div>
        </div>
      </div>

      {/* Ground Movement Comparison Cross-Section Visualization */}
      <GroundCompareChart data={currentData} baseline={baseline} />

      {/* Synchronized Multi-Sensor Line Chart (Distance vs Time) */}
      <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Ground Movement Comparison Over Time (Distance vs Time)
            </h3>
            <p className="text-xs text-slate-400">
              Superimposed acoustic distance profiles from all three HC-SR04 sensors
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> S1 (Left)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> S2 (Center)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> S3 (Right)
            </span>
          </div>
        </div>

        <TimeSeriesLineChart
          data={history}
          series={[
            { key: 'distance_1', name: 'Sensor 1 (Port / Left)', color: '#38bdf8', unit: 'cm' },
            { key: 'distance_2', name: 'Sensor 2 (Center Roof)', color: '#f59e0b', unit: 'cm' },
            { key: 'distance_3', name: 'Sensor 3 (Starboard / Right)', color: '#10b981', unit: 'cm' }
          ]}
          height={280}
          yAxisLabel="Distance (cm)"
          warningThreshold={18.0}
          criticalThreshold={16.0}
        />
      </div>

      {/* Separate Individual Line Charts for All Three Sensors */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sensor 1 Chart */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Sensor 1 (Left) Distance vs Time
            </h4>
            <span className="text-[10px] font-mono text-slate-400">HC-SR04 #1</span>
          </div>
          <TimeSeriesLineChart
            data={history}
            series={[{ key: 'distance_1', name: 'S1 Distance', color: '#38bdf8', unit: 'cm' }]}
            height={180}
            yAxisLabel="cm"
          />
        </div>

        {/* Sensor 2 Chart */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Sensor 2 (Center) Distance vs Time
            </h4>
            <span className="text-[10px] font-mono text-slate-400">HC-SR04 #2</span>
          </div>
          <TimeSeriesLineChart
            data={history}
            series={[{ key: 'distance_2', name: 'S2 Distance', color: '#f59e0b', unit: 'cm' }]}
            height={180}
            yAxisLabel="cm"
          />
        </div>

        {/* Sensor 3 Chart */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Sensor 3 (Right) Distance vs Time
            </h4>
            <span className="text-[10px] font-mono text-slate-400">HC-SR04 #3</span>
          </div>
          <TimeSeriesLineChart
            data={history}
            series={[{ key: 'distance_3', name: 'S3 Distance', color: '#10b981', unit: 'cm' }]}
            height={180}
            yAxisLabel="cm"
          />
        </div>
      </div>

      {/* Baseline Calibration Modal */}
      {showBaselineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-industrial-900 p-6 shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1">
              Calibrate Ultrasonic Distance Baselines
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter nominal tunnel ceiling clearance height in centimeters.
            </p>

            <form onSubmit={handleSaveCustomBaseline} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Sensor 1 (Left) Baseline (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={customB1}
                  onChange={(e) => setCustomB1(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-mine-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Sensor 2 (Center) Baseline (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={customB2}
                  onChange={(e) => setCustomB2(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-mine-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Sensor 3 (Right) Baseline (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={customB3}
                  onChange={(e) => setCustomB3(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-mine-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBaselineModal(false)}
                  className="rounded px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-mine-cyan px-4 py-1.5 font-bold text-slate-950 hover:bg-sky-400 transition-colors"
                >
                  Save Calibration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
