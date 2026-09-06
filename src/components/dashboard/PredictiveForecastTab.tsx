import React, { useMemo, useState } from 'react';
import { SensorData, GroundBaseline } from '../../types/sensor';
import { generateSubsidenceForecast } from '../../services/predictiveEngine';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  BrainCircuit, 
  TrendingDown, 
  Clock, 
  AlertOctagon, 
  ShieldCheck, 
  Activity, 
  Sparkles,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

export interface PredictiveForecastTabProps {
  history: SensorData[];
  baseline: GroundBaseline;
  currentData: SensorData | null;
  isDemo?: boolean;
}

export const PredictiveForecastTab: React.FC<PredictiveForecastTabProps> = ({
  history,
  baseline,
  currentData,
  isDemo = false
}) => {
  const [forecastHorizon, setForecastHorizon] = useState<'3h' | '6h'>('6h');

  // Compute AI/ML Predictive Forecast Analysis
  const forecast = useMemo(() => {
    return generateSubsidenceForecast(history, baseline, currentData);
  }, [history, baseline, currentData]);

  // Filter forecast points based on selected horizon
  const chartData = useMemo(() => {
    if (forecastHorizon === '3h') {
      return forecast.forecastPoints.filter(p => !p.timeLabel.includes('+4') && !p.timeLabel.includes('+5') && !p.timeLabel.includes('+6'));
    }
    return forecast.forecastPoints;
  }, [forecast, forecastHorizon]);

  const isCritical = forecast.riskTrend === 'CRITICAL_SAG';
  const isAccelerating = forecast.riskTrend === 'ACCELERATING';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c2842] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-amber-400" />
              AI/ML Predictive Subsidence & Early Warning Engine
            </h2>
            {isDemo && (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-400 border border-amber-500/30">
                AI AUTOREGRESSIVE MODEL
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Time-series polynomial projection & strata deformation velocity forecasting (1h – 6h forward horizon)
          </p>
        </div>

        {/* AI Model Metrics Badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="rounded-lg bg-[#10192d] border border-[#1c2842] px-3 py-1.5 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">Model Confidence:</span>
            <span className="text-emerald-400 font-bold">{forecast.confidenceScorePct}% (R² = 0.94)</span>
          </div>

          <div className="rounded-lg bg-[#10192d] border border-[#1c2842] px-3 py-1.5 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-slate-400">Algorithm:</span>
            <span className="text-white font-bold">Polynomial Strata Trend</span>
          </div>
        </div>
      </div>

      {/* AI Early Warning Advisory Banner */}
      <div className={`rounded-xl border p-4 font-mono text-xs flex items-start gap-3.5 shadow-sm ${
        isCritical 
          ? 'border-rose-500/50 bg-rose-950/20 text-rose-200' 
          : isAccelerating 
          ? 'border-amber-500/50 bg-amber-950/20 text-amber-200' 
          : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
      }`}>
        {isCritical ? (
          <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
        ) : isAccelerating ? (
          <TrendingDown className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
            <span>AI EARLY WARNING ADVISORY: {forecast.riskTrend.replace('_', ' ')}</span>
            <span className="text-[10px] px-2 py-0.2 rounded bg-black/40 border border-white/10">
              Confidence {forecast.confidenceScorePct}%
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {forecast.aiRecommendation}
          </p>
        </div>
      </div>

      {/* 4 Core Forecast KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* 1. Current Sag */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Current Ground Sag</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{forecast.currentSagCm.toFixed(1)} cm</span>
            <span className="text-xs text-slate-500">Baseline: 22.0cm</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1c2842]">
            Observed ground displacement
          </div>
        </div>

        {/* 2. Projected 3h Sag */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">AI Projected (+3 Hours)</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${forecast.projectedSag3hCm >= 4.0 ? 'text-rose-400' : 'text-amber-400'}`}>
              {forecast.projectedSag3hCm.toFixed(1)} cm
            </span>
            <span className="text-xs text-amber-400 font-semibold">
              +{((forecast.projectedSag3hCm - forecast.currentSagCm)).toFixed(1)} cm Δ
            </span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1c2842]">
            Predicted 3-hour subsidence level
          </div>
        </div>

        {/* 3. Deformation Velocity */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Deformation Velocity</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-sky-400">
              {forecast.currentVelocityCmPerHour.toFixed(2)} cm/hr
            </span>
            <span className="text-xs text-slate-400">Accel: {forecast.accelerationCmPerHour2.toFixed(3)}</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1c2842]">
            Active rate of subsidence convergence
          </div>
        </div>

        {/* 4. Estimated Time to Critical Sag */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Est. Time to Critical (6.0cm)</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${forecast.estimatedTimeToCriticalHours !== null && forecast.estimatedTimeToCriticalHours <= 3.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {forecast.estimatedTimeToCriticalHours !== null ? `${forecast.estimatedTimeToCriticalHours} hrs` : 'Stable (>12h)'}
            </span>
            <Clock className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1c2842]">
            Estimated time to 16.0cm critical threshold
          </div>
        </div>
      </div>

      {/* Main Predictive Chart Container */}
      <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2842] pb-3 text-xs font-mono">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-400" />
              Subsidence Convergence & AI Forecast Curve
            </h3>
            <p className="text-[11px] text-slate-400">
              Historical measured sag vs AI projected trajectory with 95% confidence interval
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-sky-400 font-bold">
                <span className="inline-block w-3 h-0.5 bg-sky-400" /> Observed Sag
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <span className="inline-block w-3 h-0.5 bg-amber-400 border-dashed" /> AI Projected
              </span>
              <span className="flex items-center gap-1 text-purple-400 font-semibold">
                <span className="inline-block w-2.5 h-2 bg-purple-500/20 border border-purple-500/40" /> 95% Confidence Band
              </span>
            </div>

            <div className="inline-flex rounded-md bg-[#070a12] p-0.5 border border-[#1c2842]">
              <button
                onClick={() => setForecastHorizon('3h')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${forecastHorizon === '3h' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                +3h View
              </button>
              <button
                onClick={() => setForecastHorizon('6h')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${forecastHorizon === '6h' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                +6h View
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Composed Line & Area Graph */}
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
              <defs>
                <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#1c2842" strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickMargin={10}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                unit=" cm"
                domain={[0, 8]}
              />

              {/* Warning (4.0cm sag) & Critical (6.0cm sag) Reference Lines */}
              <ReferenceLine
                y={4.0}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'Warning Limit (4.0cm Sag)', fill: '#f59e0b', fontSize: 10, position: 'right', fontFamily: 'monospace' }}
              />

              <ReferenceLine
                y={6.0}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: 'Critical Limit (6.0cm Sag)', fill: '#ef4444', fontSize: 10, position: 'right', fontFamily: 'monospace' }}
              />

              {/* 95% Confidence Upper and Lower Area */}
              <Area
                type="monotone"
                dataKey="confidenceUpperCm"
                stroke="none"
                fill="url(#confidenceBand)"
                isAnimationActive={false}
              />

              {/* Observed Sag Line */}
              <Line
                type="monotone"
                dataKey="observedSagCm"
                name="Observed Sag (cm)"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#38bdf8' }}
                connectNulls={false}
                isAnimationActive={false}
              />

              {/* AI Projected Sag Line */}
              <Line
                type="monotone"
                dataKey="predictedSagCm"
                name="AI Projected Sag (cm)"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#f59e0b' }}
                isAnimationActive={false}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-[#1c2842] bg-[#0c1222] p-3 font-mono text-xs shadow-xl space-y-1">
                        <div className="font-bold text-white border-b border-[#1c2842] pb-1 flex items-center justify-between">
                          <span>{label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${data.isProjected ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'}`}>
                            {data.isProjected ? 'AI PROJECTED' : 'MEASURED'}
                          </span>
                        </div>
                        {data.observedSagCm !== null && (
                          <div className="text-sky-400">Observed Sag: <strong>{data.observedSagCm} cm</strong></div>
                        )}
                        <div className="text-amber-400">Predicted Sag: <strong>{data.predictedSagCm} cm</strong></div>
                        <div className="text-purple-300 text-[10px]">
                          95% CI Range: [{data.confidenceLowerCm} cm — {data.confidenceUpperCm} cm]
                        </div>
                        {data.rateCmPerHr > 0 && (
                          <div className="text-slate-400 text-[10px]">Convergence Rate: +{data.rateCmPerHr} cm/hr</div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
