import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Users, 
  Layers, 
  ArrowRightLeft, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Battery, 
  MapPin, 
  Gauge, 
  TrendingUp, 
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SensorData } from '../../types/sensor';
import { generateDemoTelemetry, DemoScenario } from '../../services/demoSimulator';

interface FleetSwarmTabProps {
  primaryRoverData: SensorData | null;
  onSelectRover: (roverId: string) => void;
  activeRoverId: string;
}

export const FleetSwarmTab: React.FC<FleetSwarmTabProps> = ({
  primaryRoverData,
  onSelectRover,
  activeRoverId
}) => {
  const [rover2Data, setRover2Data] = useState<SensorData | null>(null);
  const [swarmScenario, setSwarmScenario] = useState<DemoScenario>('normal');

  // Generate live telemetry for Rover 2 (Panel P-2A) in sync
  useEffect(() => {
    const updateRover2 = () => {
      const r2 = generateDemoTelemetry(swarmScenario, undefined, 0, 'ROVER_02');
      setRover2Data(r2);
    };

    updateRover2();
    const interval = setInterval(updateRover2, 1000);
    return () => clearInterval(interval);
  }, [swarmScenario]);

  const r1 = primaryRoverData || generateDemoTelemetry('normal', undefined, 0, 'ROVER_01');
  const r2 = rover2Data || generateDemoTelemetry('normal', undefined, 0, 'ROVER_02');

  const baseline = 22.0;
  const sag1 = Math.max(0, baseline - (r1.distance_2 ?? baseline));
  const sag2 = Math.max(0, baseline - (r2.distance_2 ?? baseline));
  const deltaSagDiff = Math.abs(sag1 - sag2);
  
  const tilt1 = Math.max(Math.abs(r1.tilt_x ?? 0), Math.abs(r1.tilt_y ?? 0));
  const tilt2 = Math.max(Math.abs(r2.tilt_x ?? 0), Math.abs(r2.tilt_y ?? 0));
  const tiltDiff = Math.abs(tilt1 - tilt2);

  const vib1 = r1.vibration_rms ?? 0.12;
  const vib2 = r2.vibration_rms ?? 0.14;

  const gas1 = r1.gas ?? 380;
  const gas2 = r2.gas ?? 410;

  const isR1Critical = sag1 > 3.0 || vib1 > 0.4 || gas1 > 650;
  const isR2Critical = sag2 > 3.0 || vib2 > 0.4 || gas2 > 650;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-amber-500 p-2 text-slate-950 font-bold shadow-xs">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-sm sm:text-base font-extrabold text-slate-900">
                MULTI-ROVER SWARM FLEET & DUAL-PANEL SYNC
              </h2>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-800 border border-emerald-300">
                2 UNITS ACTIVE
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              Simultaneous real-time multi-panel convergence telemetry across Underground Seam-IV
            </p>
          </div>
        </div>

        {/* Swarm Scenario Controller */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500 text-[10px] uppercase font-semibold">Swarm Sim:</span>
          <select
            value={swarmScenario}
            onChange={(e) => setSwarmScenario(e.target.value as DemoScenario)}
            className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-mono font-bold text-amber-900 focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="normal">Scenario: Nominal Swarm</option>
            <option value="subsidence">Scenario: Panel 2A Subsidence Event</option>
            <option value="vibration">Scenario: Seismic Tremor Swarm</option>
            <option value="gas_leak">Scenario: Panel 2A Gas Anomaly</option>
          </select>
        </div>
      </div>

      {/* Swarm Fleet Summary KPI Pods */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Active Units</span>
            <Radio className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900">2 / 2</div>
          <div className="text-[10px] font-mono text-emerald-600 mt-0.5">100% Mesh Link Online</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Monitored Panels</span>
            <Layers className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900">2 Panels</div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">Panel P-4B &amp; Panel P-2A</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Inter-Panel &Delta;Sag</span>
            <ArrowRightLeft className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900">{deltaSagDiff.toFixed(1)} cm</div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">Differential Sag Variance</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Fleet Safety</span>
            {isR1Critical || isR2Critical ? (
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            )}
          </div>
          <div className={`text-xl font-mono font-black ${isR1Critical || isR2Critical ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isR1Critical || isR2Critical ? 'ALERT ACTIVE' : 'ALL NORMAL'}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">DGMS Composite Rating</div>
        </div>
      </div>

      {/* Side-by-Side Dual Rover Telemetry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Unit 1: SubSentry Rover Alpha (Panel P-4B) */}
        <div className={`rounded-xl border bg-white p-4 shadow-2xs transition-all ${
          activeRoverId === 'ROVER_01' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-extrabold text-slate-900 text-sm">SubSentry Rover Alpha</span>
                  <span className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[9px] font-bold text-slate-700">
                    ROVER_01
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Underground Panel P-4B (Longwall Face)</span>
              </div>
            </div>

            <button
              onClick={() => onSelectRover('ROVER_01')}
              className={`rounded-md px-2 py-1 text-xs font-mono font-bold transition-all ${
                activeRoverId === 'ROVER_01'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {activeRoverId === 'ROVER_01' ? 'Focused in SCADA' : 'Focus Unit'}
            </button>
          </div>

          {/* Telemetry Grid for Unit 1 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs mb-3">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 uppercase block">Ground Sag</span>
              <span className={`text-base font-extrabold ${sag1 > 2.0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {sag1.toFixed(1)} cm
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 uppercase block">Tilt Incline</span>
              <span className="text-base font-extrabold text-slate-900">{tilt1.toFixed(1)}°</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 uppercase block">Vib RMS</span>
              <span className={`text-base font-extrabold ${vib1 > 0.35 ? 'text-amber-600' : 'text-slate-900'}`}>
                {vib1.toFixed(2)} g
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 uppercase block">Gas ADC</span>
              <span className={`text-base font-extrabold ${gas1 > 600 ? 'text-rose-600' : 'text-slate-900'}`}>
                {gas1}
              </span>
            </div>
          </div>

          {/* Diagnostics Footnote */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100">
            <span>GPS: {r1.latitude?.toFixed(4)}°N, {r1.longitude?.toFixed(4)}°E</span>
            <span className="flex items-center gap-1"><Battery className="h-3 w-3 text-emerald-600" /> {r1.battery_voltage}V (88%)</span>
            <span>Speed: {r1.speed_kmh} km/h</span>
          </div>
        </div>

        {/* Unit 2: SubSentry Rover Beta (Panel P-2A) */}
        <div className={`rounded-xl border bg-white p-4 shadow-2xs transition-all ${
          activeRoverId === 'ROVER_02' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-extrabold text-slate-900 text-sm">SubSentry Rover Beta</span>
                  <span className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[9px] font-bold text-slate-700">
                    ROVER_02
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Underground Panel P-2A (Depillaring Zone)</span>
              </div>
            </div>

            <button
              onClick={() => onSelectRover('ROVER_02')}
              className={`rounded-md px-2 py-1 text-xs font-mono font-bold transition-all ${
                activeRoverId === 'ROVER_02'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {activeRoverId === 'ROVER_02' ? 'Focused in SCADA' : 'Focus Unit'}
            </button>
          </div>

          {/* Telemetry Grid for Unit 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs mb-3">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 uppercase block">Ground Sag</span>
              <span className={`text-base font-extrabold ${sag2 > 2.0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {sag2.toFixed(1)} cm
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 uppercase block">Tilt Incline</span>
              <span className="text-base font-extrabold text-slate-900">{tilt2.toFixed(1)}°</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 uppercase block">Vib RMS</span>
              <span className={`text-base font-extrabold ${vib2 > 0.35 ? 'text-amber-600' : 'text-slate-900'}`}>
                {vib2.toFixed(2)} g
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] text-slate-400 uppercase block">Gas ADC</span>
              <span className={`text-base font-extrabold ${gas2 > 600 ? 'text-rose-600' : 'text-slate-900'}`}>
                {gas2}
              </span>
            </div>
          </div>

          {/* Diagnostics Footnote */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100">
            <span>GPS: {r2.latitude?.toFixed(4)}°N, {r2.longitude?.toFixed(4)}°E</span>
            <span className="flex items-center gap-1"><Battery className="h-3 w-3 text-emerald-600" /> {r2.battery_voltage}V (79%)</span>
            <span>Speed: {r2.speed_kmh} km/h</span>
          </div>
        </div>

      </div>

      {/* Cross-Panel Geotechnical Variance Analysis */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs font-mono text-xs">
        <h3 className="font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-amber-600" />
          <span>Cross-Panel Strata Correlation & Differential Stress Analysis</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
          <div>
            <span className="text-slate-400 text-[9px] uppercase block">Differential Sag Gradient</span>
            <span className="font-bold text-slate-900">{deltaSagDiff.toFixed(2)} cm displacement gap</span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {deltaSagDiff < 1.0 ? 'Uniform strata convergence across seams.' : 'Uneven strata loading detected between panels.'}
            </p>
          </div>

          <div>
            <span className="text-slate-400 text-[9px] uppercase block">Slope Incline Variance</span>
            <span className="font-bold text-slate-900">{tiltDiff.toFixed(2)}° floor angular deviation</span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Differential floor heaving index is nominal.
            </p>
          </div>

          <div>
            <span className="text-slate-400 text-[9px] uppercase block">Swarm Mesh Protocol</span>
            <span className="font-bold text-emerald-700">Sub-GHz LoRa / Wi-Fi Active</span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Inter-rover node hop latency: &lt; 42ms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
