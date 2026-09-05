import { SensorData, RiskAnalysis, StationaryMeasurementPoint } from './sensor';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface LatestDataResponse {
  sensorData: SensorData;
  riskAnalysis: RiskAnalysis;
  serverTimestamp: string;
  source: 'live' | 'demo';
}

export interface HistoryQueryFilter {
  roverId?: string;
  startDate?: string;
  endDate?: string;
  timeRange?: '1h' | '6h' | '24h' | '7d' | 'all';
  measurementPoint?: string;
  sensor?: string;
}

export interface HistoryDataResponse {
  total: number;
  records: SensorData[];
  measurementPoints: StationaryMeasurementPoint[];
}

export interface DeviceInfo {
  id: string;
  name: string;
  model: string;
  firmware: string;
  gateway_type: 'ESP32' | string;
  sensor_node: 'Arduino Uno' | string;
  last_seen: string;
  status: 'online' | 'stale' | 'offline';
  battery_level_pct: number;
  battery_voltage: number;
  current_location: string;
  total_samples: number;
}

export interface AnalyticsSummary {
  sample_count: number;
  avg_distance_1: number;
  avg_distance_2: number;
  avg_distance_3: number;
  max_vibration_rms: number;
  max_tilt: number;
  avg_gas: number;
  avg_temperature: number;
  avg_humidity: number;
  anomaly_events_count: number;
}
