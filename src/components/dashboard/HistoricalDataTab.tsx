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
      `subsentry_historical_${selectedRover}_${new Date().toISOString().slice(0, 10)}.csv`
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
    <div className="space-y-3">
      {/* Header Summary & CSV Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
            <History className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-xs sm:text-sm">Historical Telemetry & Convergence Logs</span>
            <span className="text-slate-500 text-[10px] sm:text-[11px]">Interactive Data Explorer, Trend Charts & CSV Export Console</span>
          </div>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-mono font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-2xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV ({filteredData.length} records)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900">
            <Filter className="h-3.5 w-3.5 text-sky-600" />
            <span>Filter Telemetry Records</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-slate-900 font-semibold"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono">
          {/* Rover ID */}
          <div>
            <label className="block text-slate-500 text-[10px] mb-0.5 font-semibold">Rover Unit:</label>
            <select
              value={selectedRover}
              onChange={(e) => setSelectedRover(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 p-1.5 text-slate-900 font-medium focus:outline-none focus:border-sky-500 text-xs"
            >
              <option value="all">All Rovers</option>
              {AVAILABLE_ROVERS.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-slate-500 text-[10px] mb-0.5 font-semibold">Time Window:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 p-1.5 text-slate-900 font-medium focus:outline-none focus:border-sky-500 text-xs"
            >
              <option value="all">All History</option>
              <option value="1h">Last 1 Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
            </select>
          </div>

          {/* Measurement Point */}
          <div>
            <label className="block text-slate-500 text-[10px] mb-0.5 font-semibold">Location:</label>
            <select
              value={selectedPoint}
              onChange={(e) => setSelectedPoint(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 p-1.5 text-slate-900 font-medium focus:outline-none focus:border-sky-500 text-xs"
            >
              <option value="all">All Points</option>
              {STATIONARY_POINTS.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.id} - {sp.name}</option>
              ))}
            </select>
          </div>

          {/* Focus Chart */}
          <div>
            <label className="block text-slate-500 text-[10px] mb-0.5 font-semibold">Chart Focus:</label>
            <select
              value={selectedSensorChart}
              onChange={(e) => setSelectedSensorChart(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 p-1.5 text-slate-900 font-medium focus:outline-none focus:border-sky-500 text-xs"
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
      <div className="space-y-4">
        {/* Chart 1: Distance Over Time */}
        {(selectedSensorChart === 'all' || selectedSensorChart === 'distance') && (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                1. Ultrasonic Distance Over Time (Sensors S1, S2, S3)
              </h4>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">Unit: cm</span>
            </div>
            <TimeSeriesLineChart
              data={filteredData}
              series={[
                { key: 'distance_1', name: 'Sensor 1 (Left)', color: '#0284c7', unit: 'cm' },
                { key: 'distance_2', name: 'Sensor 2 (Center)', color: '#d97706', unit: 'cm' },
                { key: 'distance_3', name: 'Sensor 3 (Right)', color: '#059669', unit: 'cm' }
              ]}
              height={180}
              yAxisLabel="cm"
              warningThreshold={18.0}
              criticalThreshold={16.0}
            />
          </div>
        )}

        {/* Chart 2: Tilt Over Time */}
        {(selectedSensorChart === 'all' || selectedSensorChart === 'tilt') && (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                2. Inclinometer Tilt Over Time (X & Y)
              </h4>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">Unit: Degrees (°)</span>
            </div>
            <TimeSeriesLineChart
              data={filteredData}
              series={[
                { key: 'tilt_x', name: 'Tilt X (Pitch)', color: '#dc2626', unit: '°' },
                { key: 'tilt_y', name: 'Tilt Y (Roll)', color: '#059669', unit: '°' }
              ]}
              height={180}
              yAxisLabel="Degrees"
              warningThreshold={PROTOTYPE_THRESHOLDS.tilt.warningDeg}
              criticalThreshold={PROTOTYPE_THRESHOLDS.tilt.criticalDeg}
            />
          </div>
        )}

        {/* Chart 3: Vibration Over Time */}
        {(selectedSensorChart === 'all' || selectedSensorChart === 'vibration') && (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                3. Vibration RMS Over Time
              </h4>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">Unit: g RMS</span>
            </div>
            <TimeSeriesLineChart
              data={filteredData}
              series={[{ key: 'vibration_rms', name: 'Vibration RMS', color: '#d97706', unit: 'g' }]}
              height={180}
              yAxisLabel="g RMS"
              warningThreshold={PROTOTYPE_THRESHOLDS.vibrationRms.warningG}
              criticalThreshold={PROTOTYPE_THRESHOLDS.vibrationRms.criticalG}
            />
          </div>
        )}

        {/* Chart 4: Gas Over Time */}
        {(selectedSensorChart === 'all' || selectedSensorChart === 'gas') && (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                  4. Atmospheric Gas Over Time
                </h4>
                <span className="rounded bg-amber-50 px-1 py-0.2 text-[9px] font-mono text-amber-700 font-bold border border-amber-200">
                  Raw
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">Unit: ADC (0–1023)</span>
            </div>
            <TimeSeriesLineChart
              data={filteredData}
              series={[{ key: 'gas', name: 'Raw Gas ADC', color: '#d97706', unit: 'ADC' }]}
              height={180}
              yAxisLabel="ADC"
              warningThreshold={PROTOTYPE_THRESHOLDS.gasRaw.warningRaw}
              criticalThreshold={PROTOTYPE_THRESHOLDS.gasRaw.criticalRaw}
            />
          </div>
        )}

        {/* Chart 5 & 6: Temperature & Humidity Over Time */}
        {(selectedSensorChart === 'all' || selectedSensorChart === 'temperature' || selectedSensorChart === 'humidity') && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(selectedSensorChart === 'all' || selectedSensorChart === 'temperature') && (
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                    5. Temperature Over Time
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">°C</span>
                </div>
                <TimeSeriesLineChart
                  data={filteredData}
                  series={[{ key: 'temperature', name: 'Ambient Temp', color: '#dc2626', unit: '°C' }]}
                  height={170}
                  yAxisLabel="°C"
                />
              </div>
            )}

            {(selectedSensorChart === 'all' || selectedSensorChart === 'humidity') && (
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                    6. Humidity Over Time
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">%</span>
                </div>
                <TimeSeriesLineChart
                  data={filteredData}
                  series={[{ key: 'humidity', name: 'Relative Humidity', color: '#0284c7', unit: '%' }]}
                  height={170}
                  yAxisLabel="%"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historical Telemetry Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              Raw Telemetry Records Log
            </h3>
            <p className="text-[10px] text-slate-500">
              Complete sensor time-series packets uploaded via ESP32 Wi-Fi Gateway
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-semibold">
            Showing {filteredData.length} records
          </span>
        </div>

        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-[11px] font-mono">
            <thead className="sticky top-0 bg-slate-50 text-slate-600 uppercase tracking-wider text-[9px] border-b border-slate-200 z-10 font-bold">
              <tr>
                <th className="py-2 px-2.5">Timestamp</th>
                <th className="py-2 px-2.5">Rover</th>
                <th className="py-2 px-2.5">Station</th>
                <th className="py-2 px-2.5">S1 (cm)</th>
                <th className="py-2 px-2.5">S2 (cm)</th>
                <th className="py-2 px-2.5">S3 (cm)</th>
                <th className="py-2 px-2.5">Tilt (°)</th>
                <th className="py-2 px-2.5">Vib (g)</th>
                <th className="py-2 px-2.5">Gas</th>
                <th className="py-2 px-2.5">Temp/Hum</th>
                <th className="py-2 px-2.5">Battery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.slice().reverse().map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-2.5 text-slate-500 whitespace-nowrap">
                    {formatTimestamp(row.timestamp)}
                  </td>
                  <td className="py-2 px-2.5 font-semibold text-sky-700">
                    {row.device_id}
                  </td>
                  <td className="py-2 px-2.5 text-slate-800 font-medium">
                    {row.measurement_point || 'Moving'}
                  </td>
                  <td className="py-2 px-2.5 text-sky-700 font-bold">
                    {formatMetric(row.distance_1, 1)}
                  </td>
                  <td className="py-2 px-2.5 text-amber-700 font-bold">
                    {formatMetric(row.distance_2, 1)}
                  </td>
                  <td className="py-2 px-2.5 text-emerald-700 font-bold">
                    {formatMetric(row.distance_3, 1)}
                  </td>
                  <td className="py-2 px-2.5 font-medium">
                    {formatMetric(row.tilt_x, 1)}° / {formatMetric(row.tilt_y, 1)}°
                  </td>
                  <td className="py-2 px-2.5 font-bold text-slate-900">
                    {formatMetric(row.vibration_rms, 2)}
                  </td>
                  <td className="py-2 px-2.5 text-amber-700 font-bold">
                    {row.gas !== null ? row.gas : 'N/A'}
                  </td>
                  <td className="py-2 px-2.5 font-medium">
                    {formatMetric(row.temperature, 1)}°C | {formatMetric(row.humidity, 0)}%
                  </td>
                  <td className="py-2 px-2.5 text-slate-500 font-medium">
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
