import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SensorData, 
  AlertItem, 
  RiskAnalysis, 
  StationaryMeasurementPoint, 
  GroundBaseline 
} from '../types/sensor';
import { DEFAULT_BASELINES } from '../utils/constants';
import { evaluateRisk } from '../services/riskEngine';
import { 
  generateDemoTelemetry, 
  generateInitialHistory, 
  generateDemoStationaryPoints, 
  generateDemoAlerts, 
  DemoScenario 
} from '../services/demoSimulator';
import { apiService } from '../services/apiService';

export type DataSourceMode = 'LIVE' | 'DEMO';
export type ConnectionHealth = 'ONLINE' | 'STALE' | 'OFFLINE';

export interface UseRoverDataReturn {
  mode: DataSourceMode;
  setMode: (mode: DataSourceMode) => void;
  roverId: string;
  setRoverId: (id: string) => void;
  currentData: SensorData | null;
  history: SensorData[];
  alerts: AlertItem[];
  riskAnalysis: RiskAnalysis;
  stationaryPoints: StationaryMeasurementPoint[];
  baseline: GroundBaseline;
  setBaseline: (newBaseline: GroundBaseline) => void;
  resetBaselineToCurrent: () => void;
  pollIntervalMs: number;
  setPollIntervalMs: (ms: number) => void;
  connectionHealth: ConnectionHealth;
  lastUpdatedTime: string;
  isLoading: boolean;
  apiError: string | null;
  refreshNow: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => void;
  demoScenario: DemoScenario;
  setDemoScenario: (s: DemoScenario) => void;
}

export function useRoverData(): UseRoverDataReturn {
  // Mode state - defaults to DEMO for initial instant presentation, easily switched to LIVE
  const [mode, setMode] = useState<DataSourceMode>('DEMO');
  const [roverId, setRoverId] = useState<string>('ROVER_01');
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('normal');
  const [pollIntervalMs, setPollIntervalMs] = useState<number>(1000); // 1 second real-time tick

  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [stationaryPoints, setStationaryPoints] = useState<StationaryMeasurementPoint[]>([]);
  const [baseline, setBaseline] = useState<GroundBaseline>(DEFAULT_BASELINES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastPacketTime, setLastPacketTime] = useState<number>(Date.now());
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>('ONLINE');

  const timerRef = useRef<any>(null);

  // Initialize data on mount
  useEffect(() => {
    if (mode === 'DEMO') {
      const initialHistory = generateInitialHistory(40);
      const initialCurrent = initialHistory[initialHistory.length - 1];
      setCurrentData(initialCurrent);
      setHistory(initialHistory);
      setAlerts(generateDemoAlerts());
      setStationaryPoints(generateDemoStationaryPoints());
      setBaseline({
        sensor_1: initialCurrent.distance_1 ?? 22.0,
        sensor_2: initialCurrent.distance_2 ?? 22.0,
        sensor_3: initialCurrent.distance_3 ?? 22.0,
        set_at: new Date().toISOString()
      });
      setLastPacketTime(Date.now());
      setConnectionHealth('ONLINE');
      setApiError(null);
      setIsLoading(false);
    } else {
      // LIVE mode initial fetch
      fetchLiveData();
    }
  }, [mode, roverId]);

  // Main polling loop
  const fetchLiveData = useCallback(async () => {
    try {
      setIsLoading(prev => history.length === 0 ? true : false);
      const data = await apiService.getLatestData(roverId);
      
      setCurrentData(data);
      setLastPacketTime(Date.now());
      setConnectionHealth('ONLINE');
      setApiError(null);

      // Append to historical rolling buffer (keep max 100 points)
      setHistory(prev => {
        const updated = [...prev, data];
        return updated.slice(-100);
      });

      // Optionally refresh alerts
      try {
        const liveAlerts = await apiService.getAlerts(roverId);
        if (Array.isArray(liveAlerts)) {
          setAlerts(liveAlerts);
        }
      } catch {
        // Silently ignore secondary alerts fetch failure
      }
    } catch (err: any) {
      setConnectionHealth('OFFLINE');
      setApiError(err.message || 'Failed to connect to AWS REST endpoint');
    } finally {
      setIsLoading(false);
    }
  }, [roverId, history.length]);

  const tickDemoData = useCallback(() => {
    if (demoScenario === 'stale_connection') {
      setConnectionHealth('STALE');
      return;
    }

    setCurrentData(prev => {
      const next = generateDemoTelemetry(demoScenario, prev || undefined);
      setHistory(h => [...h.slice(-99), next]);
      setLastPacketTime(Date.now());
      setConnectionHealth('ONLINE');
      return next;
    });
  }, [demoScenario]);

  // Set up polling interval
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      if (mode === 'DEMO') {
        tickDemoData();
      } else {
        fetchLiveData();
      }
    };

    timerRef.current = setInterval(tick, pollIntervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, pollIntervalMs, tickDemoData, fetchLiveData]);

  // Stale connection monitor (Checks every 2 seconds if packet is older than 15s)
  useEffect(() => {
    const staleInterval = setInterval(() => {
      const ageSec = (Date.now() - lastPacketTime) / 1000;
      if (demoScenario === 'stale_connection') {
        setConnectionHealth('STALE');
      } else if (ageSec > 15) {
        setConnectionHealth(prev => prev === 'OFFLINE' ? 'OFFLINE' : 'STALE');
      }
    }, 2000);

    return () => clearInterval(staleInterval);
  }, [lastPacketTime, demoScenario]);

  // Reset baseline to current readings
  const resetBaselineToCurrent = useCallback(() => {
    if (!currentData) return;
    setBaseline({
      sensor_1: currentData.distance_1 ?? 22.0,
      sensor_2: currentData.distance_2 ?? 22.0,
      sensor_3: currentData.distance_3 ?? 22.0,
      set_at: new Date().toISOString()
    });
  }, [currentData]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a));
  }, []);

  // Compute active rate of change if we have multiple history points
  const rateOfChangeCmMin = (() => {
    if (history.length < 2) return null;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    if (last.distance_1 === null || prev.distance_1 === null) return null;
    const tLast = new Date(last.timestamp).getTime();
    const tPrev = new Date(prev.timestamp).getTime();
    const dtMin = (tLast - tPrev) / (1000 * 60);
    if (dtMin <= 0) return 0;
    return (last.distance_1 - prev.distance_1) / dtMin;
  })();

  // Compute current risk analysis using the prototype rule engine
  const fallbackData: SensorData = {
    device_id: roverId,
    timestamp: new Date().toISOString(),
    distance_1: 22.0,
    distance_2: 22.0,
    distance_3: 22.0,
    accel_x: 0,
    accel_y: 0,
    accel_z: 9.8,
    gyro_x: 0,
    gyro_y: 0,
    gyro_z: 0,
    tilt_x: 0,
    tilt_y: 0,
    vibration_rms: 0.1,
    gas: 400,
    temperature: 28,
    humidity: 75,
    battery_voltage: 12.0,
    connection_status: 'online'
  };

  const riskAnalysis = evaluateRisk(currentData || fallbackData, baseline, rateOfChangeCmMin);

  const lastUpdatedTime = currentData?.timestamp 
    ? new Date(currentData.timestamp).toLocaleTimeString('en-IN', { hour12: false })
    : '--:--:--';

  return {
    mode,
    setMode,
    roverId,
    setRoverId,
    currentData,
    history,
    alerts,
    riskAnalysis,
    stationaryPoints,
    baseline,
    setBaseline,
    resetBaselineToCurrent,
    pollIntervalMs,
    setPollIntervalMs,
    connectionHealth,
    lastUpdatedTime,
    isLoading,
    apiError,
    refreshNow: mode === 'LIVE' ? fetchLiveData : async () => tickDemoData(),
    acknowledgeAlert,
    demoScenario,
    setDemoScenario
  };
}
