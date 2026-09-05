import React from 'react';
import { RiskAnalysis, SensorData, GroundBaseline } from '../../types/sensor';
import { RiskCard } from '../common/RiskCard';
import { StatusBadge } from '../common/StatusBadge';
import { PROTOTYPE_THRESHOLDS, DISCLAIMERS } from '../../utils/constants';
import { 
  ShieldAlert, 
  Cpu, 
  FileCode, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  Sliders
} from 'lucide-react';

export interface RiskAnalysisTabProps {
  riskAnalysis: RiskAnalysis;
  currentData: SensorData | null;
  baseline: GroundBaseline;
  isDemo?: boolean;
}

export const RiskAnalysisTab: React.FC<RiskAnalysisTabProps> = ({
  riskAnalysis,
  currentData,
  baseline,
  isDemo = false
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold uppercase tracking-wider text-white">
              Multi-Factor Risk Analysis & Safety Evaluation
            </h2>
            {isDemo && (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-400 border border-amber-500/30">
                DEMO DATA
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Real-time rule-based multi-sensor hazard fusion engine designed for SIH26025
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={riskAnalysis.overallRisk} size="lg" />
        </div>
      </div>

      {/* Main Risk Analysis Card with Detailed Factors */}
      <RiskCard risk={riskAnalysis} isDemo={isDemo} detailed={true} />

      {/* Threshold Matrix & Evaluation Rules */}
      <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
        <div className="border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Prototype Rule-Based Evaluation Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Calibrated trigger thresholds for SIH prototype technical evaluation. Clearly labeled as non-certified research thresholds.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Hazard Dimension</th>
                <th className="py-2.5 px-3">Primary Sensor</th>
                <th className="py-2.5 px-3">Warning Tier</th>
                <th className="py-2.5 px-3">Critical Tier</th>
                <th className="py-2.5 px-3">Risk Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-3 font-semibold text-white">Ground Displacement (Delta)</td>
                <td className="py-3 px-3 text-sky-400">3 × HC-SR04 Ultrasonic Array</td>
                <td className="py-3 px-3 text-amber-400">Δd ≥ 2.0 cm</td>
                <td className="py-3 px-3 text-rose-400">Δd ≥ 4.0 cm</td>
                <td className="py-3 px-3">35% Weight</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-3 font-semibold text-white">Chassis Tilt (Incline)</td>
                <td className="py-3 px-3 text-mine-gold">MPU6050 Accelerometer / Gyro</td>
                <td className="py-3 px-3 text-amber-400">Tilt ≥ 4.5°</td>
                <td className="py-3 px-3 text-rose-400">Tilt ≥ 9.0°</td>
                <td className="py-3 px-3">25% Weight</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-3 font-semibold text-white">Vibration RMS (Seismic/Disturbance)</td>
                <td className="py-3 px-3 text-mine-cyan">MPU6050 Motion Sensor</td>
                <td className="py-3 px-3 text-amber-400">RMS ≥ 0.28 g</td>
                <td className="py-3 px-3 text-rose-400">RMS ≥ 0.55 g</td>
                <td className="py-3 px-3">20% Weight</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-3 font-semibold text-white">Gas Level (Analog ADC)</td>
                <td className="py-3 px-3 text-amber-400">MQ-Series Analog Gas Sensor</td>
                <td className="py-3 px-3 text-amber-400">ADC ≥ 520</td>
                <td className="py-3 px-3 text-rose-400">ADC ≥ 720</td>
                <td className="py-3 px-3">25% Weight</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-3 font-semibold text-white">Environmental Thermal / Moisture</td>
                <td className="py-3 px-3 text-emerald-400">DHT11 Temp & Humidity</td>
                <td className="py-3 px-3 text-amber-400">Temp ≥ 36°C / RH ≥ 85%</td>
                <td className="py-3 px-3 text-rose-400">Temp ≥ 42°C / RH ≥ 92%</td>
                <td className="py-3 px-3">15% Weight</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Machine Learning Extensibility Architecture Block */}
      <div className="rounded-xl border border-slate-800 bg-industrial-900 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-purple-500/15 p-2.5 text-purple-400 border border-purple-500/30 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Future Machine Learning Model Integration
              </h3>
              <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono text-purple-300 border border-purple-500/30 font-bold">
                Extensible Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The current dashboard utilizes a transparent, deterministic <strong>Prototype Rule-Based Risk Assessment</strong> engine. The software architecture is decoupled such that an advanced machine learning predictive model (e.g. LSTM time-series convergence forecaster, Random Forest classifier, or Isolation Forest anomaly detector) can ingest the historical rolling buffer and replace or supplement this rule score via the <code>/api/analytics</code> endpoint without redesigning the UI components.
            </p>

            <div className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
              <div className="text-slate-500">// Example future ML payload schema:</div>
              <div className="text-purple-400">&#123;</div>
              <div className="pl-4 text-slate-300">
                "ml_model": <span className="text-emerald-400">"LSTM-Subsidence-Predictor-v2"</span>,<br/>
                "predicted_convergence_rate_24h": <span className="text-amber-400">-3.4</span>,<br/>
                "collapse_probability": <span className="text-sky-400">0.14</span>,<br/>
                "anomaly_confidence": <span className="text-sky-400">0.96</span>
              </div>
              <div className="text-purple-400">&#125;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
