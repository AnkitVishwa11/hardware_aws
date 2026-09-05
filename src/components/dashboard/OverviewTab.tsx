import React from 'react';
import { SensorData, GroundBaseline, RiskAnalysis, AlertItem } from '../../types/sensor';
import { SensorCard } from '../common/SensorCard';
import { RiskCard } from '../common/RiskCard';
import { GroundCompareChart } from '../charts/GroundCompareChart';
import { TimeSeriesLineChart } from '../charts/TimeSeriesLineChart';
import { formatDelta, formatRawGas, formatMetric } from '../../utils/formatters';
import { 
  Ruler, 
  Compass, 
  Activity, 
  Wind, 
  Droplets, 
  Thermometer, 
  Wifi, 
  BatteryCharging,
  Clock,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export interface OverviewTabProps {
  currentData: SensorData | null;
  history: SensorData[];
  baseline: GroundBaseline;
  riskAnalysis: RiskAnalysis;
  recentAlerts: AlertItem[];
  isDemo?: boolean;
  onNavigateTab: (tab: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  currentData,
  history,
  baseline,
  riskAnalysis,
  recentAlerts,
  isDemo = false,
  onNavigateTab
}) => {
  if (!currentData) return null;

  // 1. Ground Displacement calculation (average delta across available sensors)
  const d1 = currentData.distance_1;
  const d2 = currentData.distance_2;
  const d3 = currentData.distance_3;

  const deltas: number[] = [];
  if (d1 !== null) deltas.push(d1 - baseline.sensor_1);
  if (d2 !== null) deltas.push(d2 - baseline.sensor_2);
  if (d3 !== null) deltas.push(d3 - baseline.sensor_3);
  const avgDelta = deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : null;

  // 2. Tilt magnitude
  const tiltX = currentData.tilt_x;
  const tiltY = currentData.tilt_y;
  const maxTilt = tiltX !== null && tiltY !== null ? Math.max(Math.abs(tiltX), Math.abs(tiltY)) : null;

  // 3. Vibration RMS
  const vibRms = currentData.vibration_rms;

  // 4. Gas Raw Value
  const rawGas = currentData.gas;

  // 5. Environmental moisture condition
  const humidity = currentData.humidity;
  const moistureStatus = humidity !== null
    ? humidity > 85 ? 'High Moisture' : humidity > 60 ? 'Moderate' : 'Normal'
    : 'Not available';

  // 6. Temperature
  const temperature = currentData.temperature;

  // 8. Rover Gateway Connection
  const batt = currentData.battery_voltage;
  const connStatus = currentData.connection_status || 'online';

  return (
    <div className="space-y-6">
      {/* 8 Main KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Ground Displacement */}
        <SensorCard
          title="Ground Displacement"
          value={avgDelta !== null ? `${Math.abs(avgDelta).toFixed(1)}` : null}
          unit="cm Δ"
          icon={Ruler}
          status={
            avgDelta === null
              ? 'NO_DATA'
              : Math.abs(avgDelta) >= 4.0
              ? 'CRITICAL'
              : Math.abs(avgDelta) >= 2.0
              ? 'WARNING'
              : 'NORMAL'
          }
          delta={avgDelta !== null ? formatDelta(avgDelta, 1, 'cm') : undefined}
          subtext={`Avg across 3 HC-SR04 sensors`}
          isDemo={isDemo}
          onClick={() => onNavigateTab('ground')}
        />

        {/* KPI 2: Tilt */}
        <SensorCard
          title="Rover Chassis Tilt"
          value={maxTilt !== null ? `${maxTilt.toFixed(1)}` : null}
          unit="° Max"
          icon={Compass}
          status={
            maxTilt === null
              ? 'NO_DATA'
              : maxTilt >= 9.0
              ? 'CRITICAL'
              : maxTilt >= 4.5
              ? 'WARNING'
              : 'NORMAL'
          }
          subtext={`X: ${formatMetric(tiltX, 1, '°')} | Y: ${formatMetric(tiltY, 1, '°')}`}
          isDemo={isDemo}
          onClick={() => onNavigateTab('motion')}
        />

        {/* KPI 3: Vibration RMS */}
        <SensorCard
          title="Vibration Intensity"
          value={vibRms !== null ? `${vibRms.toFixed(2)}` : null}
          unit="g RMS"
          icon={Activity}
          status={
            vibRms === null
              ? 'NO_DATA'
              : vibRms >= 0.55
              ? 'CRITICAL'
              : vibRms >= 0.28
              ? 'WARNING'
              : 'NORMAL'
          }
          subtext={
            currentData.measurement_point
              ? `Stationary hold: ${currentData.measurement_point}`
              : 'Traversing haulage drift'
          }
          isDemo={isDemo}
          onClick={() => onNavigateTab('motion')}
        />

        {/* KPI 4: Gas Level (Raw Sensor Value) */}
        <SensorCard
          title="Atmospheric Gas"
          value={rawGas !== null ? `${rawGas}` : null}
          unit="ADC"
          icon={Wind}
          status={
            rawGas === null
              ? 'NO_DATA'
              : rawGas >= 720
              ? 'CRITICAL'
              : rawGas >= 520
              ? 'WARNING'
              : 'NORMAL'
          }
          isRawGas={true}
          subtext="Analog sensor pin reading (0–1023)"
          isDemo={isDemo}
          onClick={() => onNavigateTab('environment')}
        />

        {/* KPI 5: Moisture / Environmental */}
        <SensorCard
          title="Mine Moisture Status"
          value={moistureStatus}
          icon={Droplets}
          status={
            humidity === null
              ? 'NO_DATA'
              : humidity >= 88
              ? 'WARNING'
              : 'NORMAL'
          }
          subtext={`RH: ${formatMetric(humidity, 0, '%')}`}
          isDemo={isDemo}
          onClick={() => onNavigateTab('environment')}
        />

        {/* KPI 6: Temperature */}
        <SensorCard
          title="Ambient Temperature"
          value={temperature !== null ? `${temperature.toFixed(1)}` : null}
          unit="°C"
          icon={Thermometer}
          status={
            temperature === null
              ? 'NO_DATA'
              : temperature >= 40
              ? 'CRITICAL'
              : temperature >= 35
              ? 'WARNING'
              : 'NORMAL'
          }
          subtext="Underground drift sensor"
          isDemo={isDemo}
          onClick={() => onNavigateTab('environment')}
        />

        {/* KPI 7: Humidity */}
        <SensorCard
          title="Relative Humidity"
          value={humidity !== null ? `${humidity}` : null}
          unit="%"
          icon={Droplets}
          status={
            humidity === null
              ? 'NO_DATA'
              : humidity >= 90
              ? 'WARNING'
              : 'NORMAL'
          }
          subtext="DHT11 hygrometer reading"
          isDemo={isDemo}
          onClick={() => onNavigateTab('environment')}
        />

        {/* KPI 8: Rover Gateway Connection */}
        <SensorCard
          title="Rover Gateway & Power"
          value={batt !== null ? `${batt.toFixed(1)}` : null}
          unit="V"
          icon={BatteryCharging}
          status={
            connStatus === 'offline'
              ? 'CRITICAL'
              : connStatus === 'stale'
              ? 'WARNING'
              : 'NORMAL'
          }
          statusLabel={connStatus.toUpperCase()}
          subtext={`ESP32 Wi-Fi Uplink to AWS`}
          isDemo={isDemo}
          onClick={() => onNavigateTab('hardware')}
        />
      </div>

      {/* Center Layout: Risk Analysis & Ground Cross-Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RiskCard risk={riskAnalysis} isDemo={isDemo} />
        <GroundCompareChart data={currentData} baseline={baseline} />
      </div>

      {/* Bottom Layout: Real-Time Mini Trend + Recent Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Real-Time Ground Convergence Trend
              </h4>
              <p className="text-xs text-slate-400">
                Ultrasonic Distance vs Time (Sensors S1, S2, S3)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('ground')}
              className="flex items-center gap-1 text-xs font-mono text-mine-cyan hover:underline"
            >
              <span>View Ground Module</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <TimeSeriesLineChart
            data={history}
            series={[
              { key: 'distance_1', name: 'Sensor 1 (Left)', color: '#38bdf8', unit: 'cm' },
              { key: 'distance_2', name: 'Sensor 2 (Center)', color: '#f59e0b', unit: 'cm' },
              { key: 'distance_3', name: 'Sensor 3 (Right)', color: '#10b981', unit: 'cm' }
            ]}
            height={220}
            yAxisLabel="Distance (cm)"
            warningThreshold={18.0}
            criticalThreshold={16.0}
            warningLabel="Subsidence Warning"
            criticalLabel="Subsidence Critical"
          />
        </div>

        {/* Recent Alerts Feed */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Recent Alerts Feed
              </h4>
              <p className="text-xs text-slate-400">
                Threshold triggers from prototype safety engine
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="flex items-center gap-1 text-xs font-mono text-mine-gold hover:underline"
            >
              <span>All Alerts</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
            {recentAlerts.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400 font-mono italic">
                No active threshold alerts.
              </div>
            ) : (
              recentAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-2.5 text-xs font-mono ${
                    alert.severity === 'CRITICAL'
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                      : alert.severity === 'WARNING'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      : 'border-slate-800 bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {alert.sensor}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-tight">
                    {alert.message}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Val: {alert.value}</span>
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
