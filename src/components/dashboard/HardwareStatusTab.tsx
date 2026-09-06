import React, { useState } from 'react';
import { SensorData, HardwareHealth } from '../../types/sensor';
import { StatusBadge } from '../common/StatusBadge';
import { formatTimestamp, formatMetric } from '../../utils/formatters';
import { apiService } from '../../services/apiService';
import { 
  Cpu, 
  Wifi, 
  Battery, 
  Radio, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Server, 
  Zap, 
  ArrowRight,
  Send,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export interface HardwareStatusTabProps {
  currentData: SensorData | null;
  roverId: string;
  isDemo?: boolean;
}

export const HardwareStatusTab: React.FC<HardwareStatusTabProps> = ({
  currentData,
  roverId,
  isDemo = false
}) => {
  const [testResult, setTestResult] = useState<{ ok?: boolean; latencyMs?: number; message?: string } | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState(false);

  // Derive individual sensor health indicators
  const getSensorHealth = (val: any): 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA' => {
    if (val === null || val === undefined) return 'NO_DATA';
    return 'NORMAL';
  };

  const healthMatrix = {
    hcsr04_1: getSensorHealth(currentData?.distance_1),
    hcsr04_2: getSensorHealth(currentData?.distance_2),
    hcsr04_3: getSensorHealth(currentData?.distance_3),
    mpu6050: getSensorHealth(currentData?.accel_z),
    gas_sensor: getSensorHealth(currentData?.gas),
    dht11: getSensorHealth(currentData?.temperature),
    esp32_gateway: currentData?.connection_status === 'online' ? 'NORMAL' : currentData?.connection_status === 'stale' ? 'WARNING' : 'CRITICAL'
  };

  const handleTestApi = async () => {
    setTestingEndpoint(true);
    setTestResult(null);
    try {
      const res = await apiService.checkHealth();
      setTestResult({
        ok: res.ok,
        latencyMs: res.latencyMs,
        message: res.ok 
          ? `AWS REST API responding normally (${res.latencyMs}ms)`
          : `API connection check returned: ${res.error || 'Server error'}`
      });
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `Connection to AWS endpoint failed: ${err.message}`
      });
    } finally {
      setTestingEndpoint(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-sky-50 text-sky-600 border border-sky-100">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-sm">Hardware Architecture & Gateway Diagnostics</span>
            <span className="text-slate-500 text-[11px]">Arduino Uno Sensor Node → ESP32 Wi-Fi Gateway → AWS Cloud Pipeline</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={currentData?.connection_status?.toUpperCase() || 'ONLINE'}
            size="md"
          />
        </div>
      </div>

      {/* Hardware Architecture Flow Diagram */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
              Hardware Architecture Diagram
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              One-way isolated UART telemetry relay to cloud backend
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            One-Way Isolated UART
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Node 1: Arduino Uno Sensor Node */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 text-xs font-mono">
            <div className="flex items-center justify-between text-sky-700 font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4" />
                <span>ROVER SENSOR NODE</span>
              </span>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded border border-sky-200">Arduino Uno</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] font-medium">
              <li>• 3 × HC-SR04 Ultrasonic</li>
              <li>• 1 × MPU6050 (Accel & Gyro)</li>
              <li>• 1 × Gas Sensor (Analog A0)</li>
              <li>• 1 × DHT11 Temp & Humidity</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-sky-200 text-[10px] text-slate-500">
              TX Pin → Voltage Divider
            </div>
          </div>

          {/* Node 2: Logic Divider & ESP32 Gateway */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs font-mono">
            <div className="flex items-center justify-between text-amber-800 font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Radio className="h-4 w-4" />
                <span>GATEWAY NODE</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">ESP32 DevKit</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] font-medium">
              <li>• Receives JSON on RX (UART2)</li>
              <li>• Arduino GND ↔ ESP32 GND</li>
              <li>• 5V → 3.3V Logic Level Protection</li>
              <li>• Wi-Fi 802.11 b/g/n Client</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-amber-200 text-[10px] text-slate-500">
              HTTPS POST to AWS REST API
            </div>
          </div>

          {/* Node 3: AWS Cloud Backend */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 text-xs font-mono">
            <div className="flex items-center justify-between text-purple-800 font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Server className="h-4 w-4" />
                <span>AWS BACKEND</span>
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200">REST API</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] font-medium">
              <li>• POST /api/sensor-data</li>
              <li>• GET /api/latest</li>
              <li>• GET /api/history</li>
              <li>• Time-series DB Storage</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-purple-200 text-[10px] text-slate-500">
              HTTPS TLS 1.3 Encryption
            </div>
          </div>

          {/* Node 4: Web Dashboard Client */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs font-mono">
            <div className="flex items-center justify-between text-emerald-800 font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                <span>MINESAFE DASHBOARD</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">React App</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] font-medium">
              <li>• Real-Time Polling Engine</li>
              <li>• Rule-Based Risk Engine</li>
              <li>• Subsidence Visualizer</li>
              <li>• CSV Export Console</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-emerald-200 text-[10px] text-slate-500">
              Client REST Consumer
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <strong>Security Note:</strong> The web dashboard does NOT communicate directly with the Arduino Uno. It consumes public/authenticated HTTPS REST endpoints. No AWS secret credentials are embedded in frontend source code.
        </div>
      </div>

      {/* Rover Node Telemetry Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rover Telemetry Overview Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
              Rover Hardware Telemetry
            </h3>
            <span className="text-xs font-mono text-sky-700 font-bold">{roverId}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Battery Voltage:</span>
              <span className="text-lg font-bold text-slate-900">
                {formatMetric(currentData?.battery_voltage, 1, 'V')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">3S LiPo Nominal 11.1V - 12.6V</span>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Transmission Uplink:</span>
              <span className="text-lg font-bold text-emerald-700">
                HTTPS POST
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Payload: JSON via Wi-Fi</span>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Last Packet Received:</span>
              <span className="text-xs font-bold text-slate-900">
                {formatTimestamp(currentData?.timestamp)}
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Current State:</span>
              <span className="text-xs font-bold text-amber-700">
                {currentData?.measurement_point ? `Stationary (${currentData.measurement_point})` : 'Active Traverse'}
              </span>
            </div>
          </div>
        </div>

        {/* Individual Sensor Health Matrix */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
              Sensor Health & Channel Status
            </h3>
            <span className="text-xs font-mono text-slate-500">
              GREEN = Nominal | YELLOW = Warn | RED = Crit
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">HC-SR04 Sensor 1 (Port / Left Ultrasonic)</span>
              <StatusBadge status={healthMatrix.hcsr04_1} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">HC-SR04 Sensor 2 (Center Roof Ultrasonic)</span>
              <StatusBadge status={healthMatrix.hcsr04_2} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">HC-SR04 Sensor 3 (Starboard / Right Ultrasonic)</span>
              <StatusBadge status={healthMatrix.hcsr04_3} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">MPU6050 6-DOF IMU (I2C 0x68)</span>
              <StatusBadge status={healthMatrix.mpu6050} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">Atmospheric Gas Sensor (Analog Pin A0)</span>
              <StatusBadge status={healthMatrix.gas_sensor} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">DHT11 Temp & Humidity Probe (One-Wire)</span>
              <StatusBadge status={healthMatrix.dht11} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">ESP32 Wi-Fi Gateway Uplink</span>
              <StatusBadge status={healthMatrix.esp32_gateway} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* API Diagnostics & Test Console */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
              REST API Gateway Endpoint Diagnostic
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Configured API Base URL: <code className="text-sky-700 font-bold">{apiService.getBaseUrl()}</code>
            </p>
          </div>
          <button
            onClick={handleTestApi}
            disabled={testingEndpoint}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-mono font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-300 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5 text-sky-600" />
            <span>{testingEndpoint ? 'Pinging Endpoint...' : 'Ping REST API'}</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`rounded-lg p-3 text-xs font-mono border ${
              testResult.ok
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            {testResult.message}
          </div>
        )}

        {/* Sample Incoming JSON Payload Inspector */}
        <div>
          <div className="text-xs font-mono text-slate-600 mb-2 flex items-center justify-between font-medium">
            <span>Latest Received JSON Payload (Active Packet):</span>
            <span className="text-[10px] text-slate-400">Schema defined in SIH26025 requirements</span>
          </div>
          <pre className="rounded-lg bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 max-h-64 shadow-inner">
            {JSON.stringify(currentData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
