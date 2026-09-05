import React, { useState, useMemo } from 'react';
import { SensorData, GroundBaseline } from '../../types/sensor';
import { TimeSeriesLineChart } from '../charts/TimeSeriesLineChart';
import { StatusBadge } from '../common/StatusBadge';
import { exportSensorDataToCsv } from '../../utils/exportCsv';
import { formatTimeOnly, formatTimestamp, formatMetric, formatRawGas } from '../../utils/formatters';
import { AVAILABLE_ROVERS, STATIONARY_POINTS, PROTOTYPE_THRESHOLDS } from '../../utils/constants';
import { 
  History, 
  Download, 
  Filter, 
  Search, 
  Layers, 
  Clock, 
  Calendar, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

export interface HistoricalDataTabProps {
  history: SensorData[];
  baseline: GroundBaseline;
  activeRoverId: string;
  isDemo?: boolean;
}

export const HistoricalDataTab: React.FC<HistoricalDataTabProps> = ({
  history,
  baseline,
  activeRoverId,
  isDemo = false
}) => {
  // Filter States
  const [selectedRover, setSelectedRover] = useState<string>(activeRoverId);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [selectedPoint, setSelectedPoint] = useState<string>('all');
  const [selectedSensorChart, setSelectedSensorChart] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtered dataset
  const filteredData = useMemo(() => {
    return history.filter((item) => {
      // Rover ID filter
      if (selectedRover !== 'all' && item.device_id !== selectedRover) {
        return false;
      }
      // Stationary point filter
      if (selectedPoint !== 'all' && item.measurement_point !== selectedPoint) {
        return false;
      }
      // Time range filter
      if (selectedTimeRange !== 'all') {
        const itemTime = new Date(item.timestamp).getTime();
        const now = Date.now();
        const diffHours = (now - itemTime) / (1000 * 3600);
        if (selectedTimeRange === '1h' && diffHours > 1) return false;
        if (selectedTimeRange === '6h' && diffHours > 6) return false;
        if (selectedTimeRange === '24h' && diffHours > 24) return false;
      }
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesPoint = item.measurement_point?.toLowerCase().includes(term);
        const matchesTime = item.timestamp?.toLowerCase().includes(term);
        if (!matchesPoint && !matchesTime) return false;
      }
      return true;
    });
  }, [history, selectedRover, selectedPoint, selectedTimeRange, searchTerm]);

  const handleExportCsv = () => {
    exportSensorDataToCsv(
      filteredData,
      `minesafe_historical_${selectedRover}_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const handleResetFilters = () => {
    setSelectedRover('all');
    setSelectedTimeRange('all');
    setSelectedPoint('all');
    setSelectedSensorChart('all');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold uppercase tracking-wider text-white">
              Historical Telemetry & Convergence Logs
            </h2>
            {isDemo && (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-400 border border-amber-500/30">
                DEMO DATA
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Multi-parameter query console, historical trends, and CSV data export
          </p>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 rounded-lg bg-mine-gold px-4 py-2 text-xs font-mono font-bold text-industrial-950 hover:bg-amber-400 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV ({filteredData.length} records)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-800 bg-industrial-900 p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300">
            <Filter className="h-3.5 w-3.5 text-mine-cyan" />
            <span>Filter Telemetry Records</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          {/* Rover ID */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Rover Unit:</label>
            <select
              value={selectedRover}
              onChange={(e) => setSelectedRover(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:outline-none focus:border-mine-cyan"
            >
              <option value="all">All Rovers</option>
              {AVAILABLE_ROVERS.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Time Range Window:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:outline-none focus:border-mine-cyan"
            >
              <option value="all">All Available History</option>
              <option value="1h">Last 1 Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
            </select>
          </div>

          {/* Measurement Point */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Measurement Point:</label>
            <select
              value={selectedPoint}
              onChange={(e) => setSelectedPoint(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:outline-none focus:border-mine-cyan"
            >
              <option value="all">All Points (Transit & Stops)</option>
              {STATIONARY_POINTS.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.id} - {sp.name}</option>
              ))}
            </select>
          </div>

          {/* Focus Chart */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Chart Focus:</label>
            <select
              value={selectedSensorChart}
              onChange={(e) => setSelectedSensorChart(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:outline-none focus:border-mine-cyan"
            >
              <option value="all">Display All 6 Charts</option>
              <option value="distance">Distance Over Time</option>
              <option value="tilt">Tilt Over Time</option>
              <option value="vibration">Vibration Over Time</option>
              <option value="gas">Gas Over Time</option>
              <option value="temperature">Temperature Over Time</option>
              <option value="humidity">Humidity Over Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Historical Charts Grid */}
      <div className="space-y-6">
        {/* Chart 1: Distance Over Time */}
        {(selectedSensorChart === 'all' || selectedSensorChart === 'distance') && (
          <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                1. Ultrasonic Distance Over Time (Sensors S1, S2, S3)
              </h4>
              <span className="text-xs font-mono text-slate-400">Unit: cm</span>
            </div>
            <TimeSeriesLineChart
              data={filteredData}
              series={[
                { key: 'distance_1', name: 'Sensor 1 (Left)', color: '#38bdf8', unit: 'cm' },
                { key: 'distance_2', name: 'Sensor 2 (Center)', color: '#f59e0b', unit: 'cm' },
                { key: 'distance_3', name: 'Sensor 3 (Right)', color: '#10b981', unit: 'cm' }
              ]}
              height={220}
              yAxisLabel="cm"
              warningThreshold={18.0}
              criticalThreshold={16.0}
            />
          </div>
        )}

        {/* Chart 2: Tilt Over Time */}
        {(selectedSensorChart === 'all' || selectedSensorChart === 'tilt') && (
          <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                2. Inclinometer Tilt Over Time (X & Y)
              </h4>
              <span className="text-xs font-mono text-slate-400">Unit: Degrees (°)</span>
            </div>
            <TimeSeriesLineChart
              data={filteredData}
              series={[
                { key: 'tilt_x', name: 'Tilt X (Pitch)', color: '#ef4444', unit: '°' },
                { key: 'tilt_y', name: 'Tilt Y (Roll)', color: '#10b981', unit: '°' }
              ]}
              height={220}
              yAxisLabel="Degrees"
              warningThreshold={PROTOTYPE_THRESHOLDS.tilt.warningDeg}
              criticalThreshold={PROTOTYPE_THRESHOLDS.tilt.criticalDeg}
            />
          </div>
        )}

        {/* Chart 3: Vibration Over Time */}
        {(selectedSensorChart === 'all' || selectedSensorChart === 'vibration') && (
          <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                3. Vibration RMS Over Time
              </h4>
              <span className="text-xs font-mono text-slate-400">Unit: g RMS</span>
            </div>
            <TimeSeriesLineChart
              data={filteredData}
              series={[{ key: 'vibration_rms', name: 'Vibration RMS', color: '#f59e0b', unit: 'g' }]}
              height={220}
              yAxisLabel="g RMS"
              warningThreshold={PROTOTYPE_THRESHOLDS.vibrationRms.warningG}
              criticalThreshold={PROTOTYPE_THRESHOLDS.vibrationRms.criticalG}
            />
          </div>
        )}

        {/* Chart 4: Gas Over Time */}
        {(selectedSensorChart === 'all' || selectedSensorChart === 'gas') && (
          <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  4. Atmospheric Gas Over Time
                </h4>
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/20">
                  Raw Sensor Value
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">Unit: ADC (0–1023)</span>
            </div>
            <TimeSeriesLineChart
              data={filteredData}
              series={[{ key: 'gas', name: 'Raw Gas ADC', color: '#f59e0b', unit: 'ADC' }]}
              height={220}
              yAxisLabel="ADC"
              warningThreshold={PROTOTYPE_THRESHOLDS.gasRaw.warningRaw}
              criticalThreshold={PROTOTYPE_THRESHOLDS.gasRaw.criticalRaw}
            />
          </div>
        )}

        {/* Chart 5 & 6: Temperature & Humidity Over Time */}
        {(selectedSensorChart === 'all' || selectedSensorChart === 'temperature' || selectedSensorChart === 'humidity') && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {(selectedSensorChart === 'all' || selectedSensorChart === 'temperature') && (
              <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    5. Temperature Over Time
                  </h4>
                  <span className="text-xs font-mono text-slate-400">°C</span>
                </div>
                <TimeSeriesLineChart
                  data={filteredData}
                  series={[{ key: 'temperature', name: 'Ambient Temp', color: '#ef4444', unit: '°C' }]}
                  height={200}
                  yAxisLabel="°C"
                />
              </div>
            )}

            {(selectedSensorChart === 'all' || selectedSensorChart === 'humidity') && (
              <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    6. Humidity Over Time
                  </h4>
                  <span className="text-xs font-mono text-slate-400">%</span>
                </div>
                <TimeSeriesLineChart
                  data={filteredData}
                  series={[{ key: 'humidity', name: 'Relative Humidity', color: '#0ea5e9', unit: '%' }]}
                  height={200}
                  yAxisLabel="%"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historical Telemetry Data Table */}
      <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Raw Telemetry Records Log
            </h3>
            <p className="text-xs text-slate-400">
              Complete sensor time-series packets uploaded via ESP32 Wi-Fi Gateway
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing {filteredData.length} records
          </span>
        </div>

        <div className="overflow-x-auto max-h-[380px]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 z-10">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Rover</th>
                <th className="py-2.5 px-3">Station</th>
                <th className="py-2.5 px-3">S1 (cm)</th>
                <th className="py-2.5 px-3">S2 (cm)</th>
                <th className="py-2.5 px-3">S3 (cm)</th>
                <th className="py-2.5 px-3">Tilt X/Y (°)</th>
                <th className="py-2.5 px-3">Vib RMS (g)</th>
                <th className="py-2.5 px-3">Gas (ADC)</th>
                <th className="py-2.5 px-3">Temp/Hum</th>
                <th className="py-2.5 px-3">Battery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredData.slice().reverse().map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {formatTimestamp(row.timestamp)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-mine-cyan">
                    {row.device_id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {row.measurement_point || 'Moving'}
                  </td>
                  <td className="py-2.5 px-3 text-sky-400">
                    {formatMetric(row.distance_1, 1)}
                  </td>
                  <td className="py-2.5 px-3 text-amber-400">
                    {formatMetric(row.distance_2, 1)}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400">
                    {formatMetric(row.distance_3, 1)}
                  </td>
                  <td className="py-2.5 px-3">
                    {formatMetric(row.tilt_x, 1)}° / {formatMetric(row.tilt_y, 1)}°
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    {formatMetric(row.vibration_rms, 2)}
                  </td>
                  <td className="py-2.5 px-3 text-amber-300">
                    {row.gas !== null ? row.gas : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3">
                    {formatMetric(row.temperature, 1)}°C | {formatMetric(row.humidity, 0)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {formatMetric(row.battery_voltage, 1, 'V')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
