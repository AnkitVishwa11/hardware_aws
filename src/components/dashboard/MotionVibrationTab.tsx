import React from 'react';
import { SensorData, StationaryMeasurementPoint } from '../../types/sensor';
import { MultiAxisChart } from '../charts/MultiAxisChart';
import { TimeSeriesLineChart } from '../charts/TimeSeriesLineChart';
import { SensorCard } from '../common/SensorCard';
import { StatusBadge } from '../common/StatusBadge';
import { formatMetric } from '../../utils/formatters';
import { PROTOTYPE_THRESHOLDS } from '../../utils/constants';
import { 
  Activity, 
  Compass, 
  Gauge, 
  MapPin, 
  Clock, 
  Radio, 
  AlertCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';

export interface MotionVibrationTabProps {
  currentData: SensorData | null;
  history: SensorData[];
  stationaryPoints: StationaryMeasurementPoint[];
  isDemo?: boolean;
}

export const MotionVibrationTab: React.FC<MotionVibrationTabProps> = ({
  currentData,
  history,
  stationaryPoints,
  isDemo = false
}) => {
  if (!currentData) return null;

  const ax = currentData.accel_x;
  const ay = currentData.accel_y;
  const az = currentData.accel_z;

  const gx = currentData.gyro_x;
  const gy = currentData.gyro_y;
  const gz = currentData.gyro_z;

  const tx = currentData.tilt_x;
  const ty = currentData.tilt_y;

  const vibRms = currentData.vibration_rms;
  const isStationary = Boolean(currentData.measurement_point);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold uppercase tracking-wider text-white">
              MPU6050 Motion, Vibration & Inertial Telemetry
            </h2>
            {isDemo && (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-400 border border-amber-500/30">
                DEMO DATA
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            6-DOF IMU accelerometer, rate gyroscope, calibrated dynamic tilt, and vibration RMS analysis
          </p>
        </div>

        {/* Stationary Hold Status Pill */}
        <div className="flex items-center gap-2">
          {isStationary ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-mono text-emerald-300 animate-pulse">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>STATIONARY HOLD: {currentData.measurement_point}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-400">
              <Radio className="h-4 w-4 text-sky-400" />
              <span>ROVER IN TRAVERSE TRANSIT</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Metric Cards: Accelerometer, Gyroscope, Tilt, Vibration RMS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Accelerometer */}
        <SensorCard
          title="Accelerometer 3-Axis"
          value={az !== null ? `${az.toFixed(2)}` : null}
          unit="g (Z-axis)"
          icon={Activity}
          subtext={`X: ${formatMetric(ax, 2, 'g')} | Y: ${formatMetric(ay, 2, 'g')}`}
          isDemo={isDemo}
        />

        {/* Gyroscope */}
        <SensorCard
          title="Rate Gyroscope"
          value={gx !== null ? `${gx.toFixed(1)}` : null}
          unit="°/s (X)"
          icon={Gauge}
          subtext={`Y: ${formatMetric(gy, 1, '°/s')} | Z: ${formatMetric(gz, 1, '°/s')}`}
          isDemo={isDemo}
        />

        {/* Tilt */}
        <SensorCard
          title="Inclinometer (Tilt)"
          value={tx !== null ? `${tx.toFixed(1)}` : null}
          unit="° (Pitch X)"
          icon={Compass}
          status={
            tx !== null && Math.abs(tx) >= PROTOTYPE_THRESHOLDS.tilt.warningDeg
              ? 'WARNING'
              : 'NORMAL'
          }
          subtext={`Roll Y: ${formatMetric(ty, 1, '°')}`}
          isDemo={isDemo}
        />

        {/* Vibration RMS */}
        <SensorCard
          title="Vibration (RMS)"
          value={vibRms !== null ? `${vibRms.toFixed(2)}` : null}
          unit="g RMS"
          icon={Activity}
          status={
            vibRms !== null && vibRms >= PROTOTYPE_THRESHOLDS.vibrationRms.warningG
              ? 'WARNING'
              : 'NORMAL'
          }
          subtext={isStationary ? 'Stationary sampling' : 'Dynamic wheel transit'}
          isDemo={isDemo}
        />
      </div>

      {/* Stationary Hold Notice Banner */}
      <div className="rounded-xl border border-slate-800 bg-industrial-900 p-4">
        <div className="flex items-start gap-3 text-xs">
          <div className="rounded-lg bg-slate-800 p-2 text-mine-gold border border-slate-700">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-200">
              Stationary Vibration Hold Protocol
            </h4>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              To eliminate mechanical motor vibration and wheel bounce noise, the rover periodically executes an automated 30–60 second full stop at predetermined inspection points (e.g. adits, pillars, roof junctions) before acquiring precision baseline vibration RMS readings.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Motion Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Acceleration vs Time (X, Y, Z) */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Acceleration vs Time (3-Axis)
              </h4>
              <p className="text-xs text-slate-400">
                Linear acceleration along X (lateral), Y (longitudinal), Z (gravitational)
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Unit: g</span>
          </div>
          <MultiAxisChart
            data={history}
            xKey="accel_x"
            yKey="accel_y"
            zKey="accel_z"
            unit="g"
            height={220}
          />
        </div>

        {/* Chart 2: Gyroscope vs Time (X, Y, Z) */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Gyroscope vs Time (Angular Velocity)
              </h4>
              <p className="text-xs text-slate-400">
                Rotational angular rates roll, pitch, and yaw
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Unit: °/s</span>
          </div>
          <MultiAxisChart
            data={history}
            xKey="gyro_x"
            yKey="gyro_y"
            zKey="gyro_z"
            unit="°/s"
            height={220}
          />
        </div>

        {/* Chart 3: Vibration RMS vs Time */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Vibration RMS vs Time
              </h4>
              <p className="text-xs text-slate-400">
                Continuous root-mean-square kinetic vibration amplitude
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Unit: g</span>
          </div>
          <TimeSeriesLineChart
            data={history}
            series={[{ key: 'vibration_rms', name: 'Vibration RMS', color: '#f59e0b', unit: 'g' }]}
            height={220}
            yAxisLabel="RMS (g)"
            warningThreshold={PROTOTYPE_THRESHOLDS.vibrationRms.warningG}
            criticalThreshold={PROTOTYPE_THRESHOLDS.vibrationRms.criticalG}
          />
        </div>

        {/* Chart 4: Tilt (X & Y) vs Time */}
        <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Chassis Tilt (X & Y) vs Time
              </h4>
              <p className="text-xs text-slate-400">
                Angle deviation from horizontal plane
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Unit: °</span>
          </div>
          <TimeSeriesLineChart
            data={history}
            series={[
              { key: 'tilt_x', name: 'Tilt X (Pitch)', color: '#ef4444', unit: '°' },
              { key: 'tilt_y', name: 'Tilt Y (Roll)', color: '#10b981', unit: '°' }
            ]}
            height={220}
            yAxisLabel="Degrees (°)"
            warningThreshold={PROTOTYPE_THRESHOLDS.tilt.warningDeg}
            criticalThreshold={PROTOTYPE_THRESHOLDS.tilt.criticalDeg}
          />
        </div>
      </div>

      {/* Stationary Measurement Periods Table */}
      <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Stationary Measurement Points Log
            </h3>
            <p className="text-xs text-slate-400">
              Pre-surveyed underground inspection stops where rover halts for high-precision vibration profiling
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Points Monitored: {stationaryPoints.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Point ID</th>
                <th className="py-2.5 px-3">Mine Location</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Hold Duration</th>
                <th className="py-2.5 px-3">Vibration RMS</th>
                <th className="py-2.5 px-3">Peak Accel</th>
                <th className="py-2.5 px-3">Disp. Delta</th>
                <th className="py-2.5 px-3">Vibration Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {stationaryPoints.map((sp) => (
                <tr key={sp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-mine-cyan flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-mine-gold" />
                    {sp.point_id}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{sp.location_name}</td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(sp.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-3">{sp.duration_sec} sec</td>
                  <td className="py-3 px-3 font-bold">{sp.vibration_rms.toFixed(2)} g</td>
                  <td className="py-3 px-3">{sp.peak_accel.toFixed(2)} g</td>
                  <td className="py-3 px-3">
                    <span className={sp.displacement_delta < -2 ? 'text-amber-400' : 'text-slate-200'}>
                      {sp.displacement_delta > 0 ? '+' : ''}{sp.displacement_delta.toFixed(1)} cm
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={sp.vibration_status} size="sm" />
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
