import React from 'react';
import { SensorData } from '../../types/sensor';
import { TimeSeriesLineChart } from '../charts/TimeSeriesLineChart';
import { SensorCard } from '../common/SensorCard';
import { StatusBadge } from '../common/StatusBadge';
import { formatMetric, formatRawGas } from '../../utils/formatters';
import { DISCLAIMERS, PROTOTYPE_THRESHOLDS } from '../../utils/constants';
import { Wind, Thermometer, Droplets, AlertTriangle, Info, Gauge, Flame } from 'lucide-react';

export interface EnvironmentalTabProps {
  currentData: SensorData | null;
  history: SensorData[];
  isDemo?: boolean;
}

export const EnvironmentalTab: React.FC<EnvironmentalTabProps> = ({
  currentData,
  history,
  isDemo = false
}) => {
  if (!currentData) return null;

  const gas = currentData.gas;
  const temp = currentData.temperature;
  const hum = currentData.humidity;

  // Gas status evaluation based on raw ADC values
  let gasStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA' = 'NORMAL';
  if (gas === null) {
    gasStatus = 'NO_DATA';
  } else if (gas >= PROTOTYPE_THRESHOLDS.gasRaw.criticalRaw) {
    gasStatus = 'CRITICAL';
  } else if (gas >= PROTOTYPE_THRESHOLDS.gasRaw.warningRaw) {
    gasStatus = 'WARNING';
  }

  // Temp status
  let tempStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA' = 'NORMAL';
  if (temp === null) {
    tempStatus = 'NO_DATA';
  } else if (temp >= PROTOTYPE_THRESHOLDS.temperature.criticalC) {
    tempStatus = 'CRITICAL';
  } else if (temp >= PROTOTYPE_THRESHOLDS.temperature.warningC) {
    tempStatus = 'WARNING';
  }

  // Humidity status
  let humStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA' = 'NORMAL';
  if (hum === null) {
    humStatus = 'NO_DATA';
  } else if (hum >= PROTOTYPE_THRESHOLDS.humidity.criticalPct) {
    humStatus = 'WARNING';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold uppercase tracking-wider text-white">
              Environmental & Atmospheric Monitoring
            </h2>
            {isDemo && (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-400 border border-amber-500/30">
                DEMO DATA
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Analog gas sensor telemetry and DHT11 ambient temperature/relative humidity tracking
          </p>
        </div>
      </div>

      {/* Mandatory Uncalibrated Gas Sensor Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300/90 leading-relaxed shadow-sm">
        <Info className="h-5 w-5 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Sensor Calibration & Display Notice
          </span>
          {DISCLAIMERS.gasSensor}
          <p className="mt-1 text-[11px] text-amber-300/80">
            In compliance with technical evaluation guidelines, uncalibrated analog gas sensors must not be converted to PPM values. Values reflect the raw 10-bit analog-to-digital converter (ADC) output of the Arduino Uno (0 = 0V, 1023 = 5V).
          </p>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Gas Sensor Card */}
        <SensorCard
          title="Gas Sensor"
          value={gas !== null ? gas : null}
          unit="ADC Count"
          icon={Wind}
          status={gasStatus}
          isRawGas={true}
          subtext="10-bit Raw Analog Voltage"
          isDemo={isDemo}
        />

        {/* Temperature Card */}
        <SensorCard
          title="Temperature"
          value={temp !== null ? temp.toFixed(1) : null}
          unit="°C"
          icon={Thermometer}
          status={tempStatus}
          subtext="DHT11 digital sensor"
          isDemo={isDemo}
        />

        {/* Humidity Card */}
        <SensorCard
          title="Relative Humidity"
          value={hum !== null ? hum : null}
          unit="%"
          icon={Droplets}
          status={humStatus}
          subtext="DHT11 hygrometer probe"
          isDemo={isDemo}
        />
      </div>

      {/* Gas Sensor Detailed Historical Graph */}
      <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Atmospheric Gas Sensor – Raw ADC Value Over Time
              </h3>
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/20">
                Raw Sensor Value
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Raw 10-bit ADC output from analog pin A0 on Arduino Uno
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Current: <strong className="text-white">{formatRawGas(gas)}</strong>
            </span>
            <StatusBadge status={gasStatus} size="sm" />
          </div>
        </div>

        <TimeSeriesLineChart
          data={history}
          series={[{ key: 'gas', name: 'Raw Gas ADC', color: '#f59e0b', unit: 'ADC' }]}
          height={240}
          yAxisLabel="Raw ADC (0–1023)"
          warningThreshold={PROTOTYPE_THRESHOLDS.gasRaw.warningRaw}
          criticalThreshold={PROTOTYPE_THRESHOLDS.gasRaw.criticalRaw}
          warningLabel="Gas Warning (520 ADC)"
          criticalLabel="Gas Critical (720 ADC)"
        />
      </div>

      {/* Temperature and Humidity Dual Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Temperature Chart */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Temperature Over Time (°C)
              </h4>
              <p className="text-xs text-slate-400">DHT11 thermal gradient tracking</p>
            </div>
            <span className="text-xs font-mono text-white font-bold">
              {formatMetric(temp, 1, '°C')}
            </span>
          </div>
          <TimeSeriesLineChart
            data={history}
            series={[{ key: 'temperature', name: 'Ambient Temp', color: '#ef4444', unit: '°C' }]}
            height={220}
            yAxisLabel="Celsius (°C)"
            warningThreshold={PROTOTYPE_THRESHOLDS.temperature.warningC}
            criticalThreshold={PROTOTYPE_THRESHOLDS.temperature.criticalC}
          />
        </div>

        {/* Humidity Chart */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Relative Humidity Over Time (%)
              </h4>
              <p className="text-xs text-slate-400">DHT11 moisture and vapor density</p>
            </div>
            <span className="text-xs font-mono text-white font-bold">
              {formatMetric(hum, 0, '%')}
            </span>
          </div>
          <TimeSeriesLineChart
            data={history}
            series={[{ key: 'humidity', name: 'Relative Humidity', color: '#0ea5e9', unit: '%' }]}
            height={220}
            yAxisLabel="Humidity (%)"
            warningThreshold={PROTOTYPE_THRESHOLDS.humidity.warningPct}
          />
        </div>
      </div>
    </div>
  );
};
