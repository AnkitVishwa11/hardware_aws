import { SensorData, AlertItem, StationaryMeasurementPoint } from '../types/sensor';
import { STATIONARY_POINTS } from '../utils/constants';

export type DemoScenario = 
  | 'normal' 
  | 'subsidence' 
  | 'vibration' 
  | 'gas_leak' 
  | 'stale_connection';

let tickCount = 0;

export function generateDemoTelemetry(
  scenario: DemoScenario,
  _prevData?: SensorData,
  timeOffsetSec: number = 0,
  roverId: string = 'ROVER_01'
): SensorData {
  tickCount++;
  const now = new Date(Date.now() - timeOffsetSec * 1000).toISOString();

  // Baseline values
  const isRover2 = roverId === 'ROVER_02';
  const baseOffset = isRover2 ? 1.5 : 0.0;
  
  let d1 = 21.8 + baseOffset + Math.sin((tickCount + (isRover2 ? 15 : 0)) * 0.1) * 0.3;
  let d2 = 22.1 + baseOffset + Math.cos((tickCount + (isRover2 ? 15 : 0)) * 0.1) * 0.3;
  let d3 = 21.9 + baseOffset + Math.sin((tickCount + (isRover2 ? 15 : 0)) * 0.1 + 1) * 0.3;

  let accelX = 0.05 + (Math.random() - 0.5) * 0.08;
  let accelY = 0.03 + (Math.random() - 0.5) * 0.08;
  let accelZ = 9.78 + (Math.random() - 0.5) * 0.12;

  let gyroX = (Math.random() - 0.5) * 0.8;
  let gyroY = (Math.random() - 0.5) * 0.8;
  let gyroZ = (Math.random() - 0.5) * 0.4;

  let tiltX = (isRover2 ? 1.4 : 0.8) + (Math.random() - 0.5) * 0.4;
  let tiltY = (isRover2 ? 0.9 : 0.5) + (Math.random() - 0.5) * 0.4;

  let vibRms = (isRover2 ? 0.16 : 0.12) + Math.random() * 0.05;
  let gas = (isRover2 ? 410 : 380) + Math.floor(Math.random() * 25);
  let temp = (isRover2 ? 30.2 : 29.4) + Math.sin(tickCount * 0.05) * 0.8;
  let hum = (isRover2 ? 78 : 74) + Math.cos(tickCount * 0.05) * 2;
  let batt = (isRover2 ? 11.4 : 11.9) - (tickCount * 0.001) % 0.8;
  let conn: SensorData['connection_status'] = 'online';
  let mp: string | undefined = undefined;

  // Rover halts periodically at stationary measurement points
  const cycle = tickCount % 30;
  if (cycle >= 20) {
    mp = STATIONARY_POINTS[Math.floor(tickCount / 30) % STATIONARY_POINTS.length].id;
    vibRms = 0.06 + Math.random() * 0.02;
    gyroX = (Math.random() - 0.5) * 0.1;
    gyroY = (Math.random() - 0.5) * 0.1;
  }

  // Inject scenario variations
  switch (scenario) {
    case 'subsidence':
      d1 = Math.max(15.2, 22.0 - (tickCount % 25) * 0.28);
      d2 = Math.max(16.5, 22.2 - (tickCount % 25) * 0.22);
      d3 = Math.max(17.8, 22.0 - (tickCount % 25) * 0.16);
      tiltX = 4.8 + Math.sin(tickCount * 0.2) * 1.2;
      tiltY = 3.6 + Math.cos(tickCount * 0.2) * 0.8;
      break;

    case 'vibration':
      vibRms = 0.42 + Math.random() * 0.35;
      accelX = (Math.random() - 0.5) * 3.2;
      accelY = (Math.random() - 0.5) * 2.8;
      accelZ = 9.8 + (Math.random() - 0.5) * 4.5;
      gyroX = (Math.random() - 0.5) * 14.0;
      gyroY = (Math.random() - 0.5) * 12.0;
      break;

    case 'gas_leak':
      gas = Math.min(880, 480 + (tickCount % 35) * 12);
      temp = 34.2 + (tickCount % 20) * 0.2;
      hum = 86 + (tickCount % 15) * 0.5;
      break;

    case 'stale_connection':
      conn = 'stale';
      break;

    case 'normal':
    default:
      break;
  }

  // Base geographic position (ROVER_01: Panel P-4B, ROVER_02: Panel P-2A)
  const baseLat = isRover2 ? 23.7562 : 23.7524;
  const baseLng = isRover2 ? 86.4175 : 86.4218;
  const latOffset = Math.sin((tickCount + (isRover2 ? 20 : 0)) * 0.05) * 0.0018;
  const lngOffset = Math.cos((tickCount + (isRover2 ? 20 : 0)) * 0.05) * 0.0018;
  const roverHeading = Math.round((Math.atan2(lngOffset, latOffset) * 180 / Math.PI + 360) % 360);

  return {
    device_id: roverId,
    timestamp: now,
    distance_1: Number(d1.toFixed(1)),
    distance_2: Number(d2.toFixed(1)),
    distance_3: Number(d3.toFixed(1)),
    accel_x: Number(accelX.toFixed(2)),
    accel_y: Number(accelY.toFixed(2)),
    accel_z: Number(accelZ.toFixed(2)),
    gyro_x: Number(gyroX.toFixed(2)),
    gyro_y: Number(gyroY.toFixed(2)),
    gyro_z: Number(gyroZ.toFixed(2)),
    tilt_x: Number(tiltX.toFixed(1)),
    tilt_y: Number(tiltY.toFixed(1)),
    vibration_rms: Number(vibRms.toFixed(2)),
    gas: Math.round(gas),
    temperature: Number(temp.toFixed(1)),
    humidity: Math.round(hum),
    battery_voltage: Number(batt.toFixed(1)),
    connection_status: conn,
    measurement_point: mp,
    latitude: Number((baseLat + latOffset).toFixed(6)),
    longitude: Number((baseLng + lngOffset).toFixed(6)),
    altitude: Number((184.5 + Math.sin(tickCount * 0.05) * 1.5).toFixed(1)),
    satellites: isRover2 ? 8 : 9,
    speed_kmh: Number((0.8 + (Math.random() - 0.5) * 0.2).toFixed(1)),
    heading: roverHeading,
    is_demo: true
  };
}

export function generateInitialHistory(points: number = 40, roverId: string = 'ROVER_01'): SensorData[] {
  const history: SensorData[] = [];
  for (let i = points - 1; i >= 0; i--) {
    history.push(generateDemoTelemetry('normal', undefined, i * 10, roverId));
  }
  return history;
}

export function generateDemoStationaryPoints(): StationaryMeasurementPoint[] {
  return [
    {
      id: 'smp-1',
      point_id: 'MP-01',
      location_name: 'Shaft 2 Adit Convergence Point',
      timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
      duration_sec: 45,
      vibration_rms: 0.08,
      peak_accel: 0.18,
      average_tilt: 1.2,
      displacement_delta: -0.4,
      vibration_status: 'NORMAL',
      gas_level: 385
    },
    {
      id: 'smp-2',
      point_id: 'MP-02',
      location_name: 'Stope 3 Roof Junction',
      timestamp: new Date(Date.now() - 2400 * 1000).toISOString(),
      duration_sec: 60,
      vibration_rms: 0.14,
      peak_accel: 0.32,
      average_tilt: 2.4,
      displacement_delta: -1.8,
      vibration_status: 'NORMAL',
      gas_level: 420
    },
    {
      id: 'smp-3',
      point_id: 'MP-03',
      location_name: 'Sub-Level B Haulage Entry',
      timestamp: new Date(Date.now() - 1200 * 1000).toISOString(),
      duration_sec: 50,
      vibration_rms: 0.34,
      peak_accel: 0.68,
      average_tilt: 3.8,
      displacement_delta: -2.6,
      vibration_status: 'MODERATE',
      gas_level: 540
    },
    {
      id: 'smp-4',
      point_id: 'MP-04',
      location_name: 'Crosscut 5 Pillar Face',
      timestamp: new Date(Date.now() - 300 * 1000).toISOString(),
      duration_sec: 40,
      vibration_rms: 0.11,
      peak_accel: 0.22,
      average_tilt: 1.6,
      displacement_delta: -0.8,
      vibration_status: 'NORMAL',
      gas_level: 395
    }
  ];
}

export function generateDemoAlerts(): AlertItem[] {
  return [
    {
      id: 'ALT-1092',
      timestamp: new Date(Date.now() - 180 * 1000).toISOString(),
      rover_id: 'ROVER_01',
      sensor: 'HC-SR04 (Sensor 1)',
      value: '17.2 cm',
      threshold: 'Delta ≥ 4.0 cm (Critical)',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      message: 'Rapid distance change detected at Roof Junction MP-02',
      isDemo: true
    },
    {
      id: 'ALT-1088',
      timestamp: new Date(Date.now() - 950 * 1000).toISOString(),
      rover_id: 'ROVER_01',
      sensor: 'MPU6050 (Tilt X/Y)',
      value: '5.2°',
      threshold: 'Tilt ≥ 4.5° (Warning)',
      severity: 'WARNING',
      status: 'ACKNOWLEDGED',
      message: 'Abnormal tilt detected during haulage transit',
      isDemo: true
    },
    {
      id: 'ALT-1075',
      timestamp: new Date(Date.now() - 2400 * 1000).toISOString(),
      rover_id: 'ROVER_01',
      sensor: 'Gas Sensor (Analog)',
      value: '560 ADC',
      threshold: 'ADC ≥ 520 (Warning)',
      severity: 'WARNING',
      status: 'RESOLVED',
      message: 'Gas sensor raw value elevated above baseline',
      isDemo: true
    },
    {
      id: 'ALT-1061',
      timestamp: new Date(Date.now() - 4800 * 1000).toISOString(),
      rover_id: 'ROVER_01',
      sensor: 'ESP32 Wi-Fi Gateway',
      value: 'RSSI -86 dBm',
      threshold: 'Packet delay > 10s',
      severity: 'INFO',
      status: 'RESOLVED',
      message: 'Rover gateway reconnected via Cave Access Point 3',
      isDemo: true
    }
  ];
}
