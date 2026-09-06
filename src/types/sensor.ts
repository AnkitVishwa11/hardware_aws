/**
 * Core Sensor Data Model for SubSentry Rover
 * Matches the incoming payload from ESP32 gateway -> AWS HTTPS REST API
 */
export interface SensorData {
  device_id: string;
  timestamp: string;

  // Ground monitoring ultrasonic HC-SR04 sensors (distance in cm)
  distance_1: number | null;
  distance_2: number | null;
  distance_3: number | null;

  // MPU6050 Accelerometer (m/s^2 or g)
  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;

  // MPU6050 Gyroscope (deg/s)
  gyro_x: number | null;
  gyro_y: number | null;
  gyro_z: number | null;

  // Calculated Tilt (degrees from horizontal baseline)
  tilt_x: number | null;
  tilt_y: number | null;

  // Vibration Root Mean Square (g or m/s^2)
  vibration_rms: number | null;

  // Gas sensor: Raw ADC integer reading (e.g., MQ series 0 - 1023).
  // IMPORTANT: Must be displayed as "Raw Sensor Value", NOT ppm!
  gas: number | null;

  // DHT11 Environmental sensors
  temperature: number | null; // deg Celsius
  humidity: number | null;    // % Relative Humidity

  // Hardware telemetry
  battery_voltage: number | null; // Volts
  connection_status: 'online' | 'stale' | 'offline' | string;

  // GPS & Positioning Module Telemetry
  latitude?: number | null;
  longitude?: number | null;
  altitude?: number | null; // meters
  satellites?: number | null;
  speed_kmh?: number | null;
  heading?: number | null; // degrees 0-360

  // Measurement point marker (when rover stops at predetermined inspection points)
  measurement_point?: string;
  is_demo?: boolean;
}

export interface SurfaceMeshNode {
  id: string;
  node_name: string;
  role: 'GATEWAY' | 'ROVER' | 'SURFACE_ANCHOR';
  latitude: number;
  longitude: number;
  altitude: number;
  distance_to_ground_cm: number;
  tilt_deg: number;
  vibration_rms: number;
  gas_adc: number;
  battery_pct: number;
  rssi_dbm: number;
  mesh_hops: number;
  parent_node_id?: string;
  last_packet_time: string;
  status: 'STABLE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
}

export interface SubsidenceForecastPoint {
  timeLabel: string;
  timestamp: string;
  observedSagCm: number | null;
  predictedSagCm: number;
  confidenceLowerCm: number;
  confidenceUpperCm: number;
  rateCmPerHr: number;
  isProjected: boolean;
}

export interface ForecastAnalysis {
  currentSagCm: number;
  projectedSag1hCm: number;
  projectedSag3hCm: number;
  projectedSag6hCm: number;
  currentVelocityCmPerHour: number;
  accelerationCmPerHour2: number;
  estimatedTimeToWarningHours: number | null;
  estimatedTimeToCriticalHours: number | null;
  confidenceScorePct: number;
  riskTrend: 'STABLE' | 'ACCELERATING' | 'CRITICAL_SAG';
  aiRecommendation: string;
  forecastPoints: SubsidenceForecastPoint[];
}

export type RiskLevel = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface RiskFactor {
  name: string;
  category: 'displacement' | 'tilt' | 'vibration' | 'gas' | 'environment';
  status: 'normal' | 'warning' | 'critical';
  detail: string;
  metricValue: string;
  threshold: string;
}

export interface RiskAnalysis {
  overallRisk: RiskLevel;
  score: number; // 0 to 100 prototype risk score
  label: string;
  disclaimer: string;
  factors: RiskFactor[];
  timestamp: string;
  recommendation: string;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface AlertItem {
  id: string;
  timestamp: string;
  rover_id: string;
  sensor: string;
  value: string;
  threshold: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  isDemo?: boolean;
}

export interface StationaryMeasurementPoint {
  id: string;
  point_id: string;         // e.g. "MP-01", "MP-02"
  location_name: string;    // e.g. "Shaft C - Crosscut 4"
  timestamp: string;
  duration_sec: number;     // Stop duration in seconds
  vibration_rms: number;    // Measured during stationary hold
  peak_accel: number;       // Peak acceleration g
  average_tilt: number;     // Average tilt in degrees
  displacement_delta: number; // Change in distance relative to baseline (cm)
  vibration_status: 'NORMAL' | 'MODERATE' | 'HIGH';
  gas_level: number;
  latitude?: number;
  longitude?: number;
}

export interface GroundBaseline {
  sensor_1: number;
  sensor_2: number;
  sensor_3: number;
  set_at: string;
}

export interface HardwareHealth {
  hcsr04_1: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  hcsr04_2: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  hcsr04_3: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  mpu6050: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  gas_sensor: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  dht11: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  gps_neo6m?: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  esp32_gateway: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
}
