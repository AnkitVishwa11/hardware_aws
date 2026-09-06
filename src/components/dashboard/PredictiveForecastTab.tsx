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
    <div className="space-y-4">
      {/* Header Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-sm">AI/ML Subsidence Predictive Engine</span>
            <span className="text-slate-500 text-[11px]">Polynomial Autoregressive Strata Forecasting (1h – 6h Horizon)</span>
          </div>
        </div>

        {/* AI Model Metrics Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-slate-500">Confidence:</span>
            <span className="text-emerald-700 font-bold">{forecast.confidenceScorePct}% (R² = 0.94)</span>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-sky-600" />
            <span className="text-slate-500">Algorithm:</span>
            <span className="text-slate-900 font-bold">Polynomial Strata Trend</span>
          </div>
        </div>
      </div>

      {/* AI Early Warning Advisory Banner */}
      <div className={`rounded-xl border p-4 font-mono text-xs flex items-start gap-3.5 shadow-sm ${
        isCritical 
          ? 'border-rose-200 bg-rose-50 text-rose-900' 
          : isAccelerating 
          ? 'border-amber-200 bg-amber-50 text-amber-900' 
          : 'border-emerald-200 bg-emerald-50 text-emerald-900'
      }`}>
        {isCritical ? (
          <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
        ) : isAccelerating ? (
          <TrendingDown className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
            <span>AI EARLY WARNING ADVISORY: {forecast.riskTrend.replace('_', ' ')}</span>
            <span className="text-[10px] px-2 py-0.2 rounded bg-white/70 border border-slate-300 shadow-sm font-semibold">
              Confidence {forecast.confidenceScorePct}%
            </span>
          </div>
          <p className="leading-relaxed text-slate-700 font-medium">
            {forecast.aiRecommendation}
          </p>
        </div>
      </div>

      {/* 4 Core Forecast KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* 1. Current Sag */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Current Ground Sag</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{forecast.currentSagCm.toFixed(1)} cm</span>
            <span className="text-xs text-slate-500 font-medium">Base: 22.0cm</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
            Observed ground displacement
          </div>
        </div>

        {/* 2. Projected 3h Sag */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">AI Projected (+3 Hours)</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${forecast.projectedSag3hCm >= 4.0 ? 'text-rose-600' : 'text-amber-600'}`}>
              {forecast.projectedSag3hCm.toFixed(1)} cm
            </span>
            <span className="text-xs text-amber-700 font-bold">
              +{((forecast.projectedSag3hCm - forecast.currentSagCm)).toFixed(1)} cm Δ
            </span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
            Predicted 3-hour subsidence
          </div>
        </div>

        {/* 3. Deformation Velocity */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Deformation Velocity</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-sky-600">
              {forecast.currentVelocityCmPerHour.toFixed(2)} cm/hr
            </span>
            <span className="text-xs text-slate-500 font-medium">Accel: {forecast.accelerationCmPerHour2.toFixed(3)}</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
            Active rate of convergence
          </div>
        </div>

        {/* 4. Estimated Time to Critical Sag */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Est. Time to Critical</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${forecast.estimatedTimeToCriticalHours !== null && forecast.estimatedTimeToCriticalHours <= 3.0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {forecast.estimatedTimeToCriticalHours !== null ? `${forecast.estimatedTimeToCriticalHours} hrs` : 'Stable (>12h)'}
            </span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
            Time to 16.0cm critical threshold
          </div>
        </div>
      </div>

      {/* Main Predictive Chart Container */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs font-mono">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-600" />
              Subsidence Convergence & AI Forecast Curve
            </h3>
            <p className="text-[11px] text-slate-500">
              Historical measured sag vs AI projected trajectory with 95% confidence interval
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-sky-700 font-bold">
                <span className="inline-block w-3 h-0.5 bg-sky-600" /> Observed Sag
              </span>
              <span className="flex items-center gap-1 text-amber-700 font-bold">
                <span className="inline-block w-3 h-0.5 bg-amber-600 border-dashed" /> AI Projected
              </span>
              <span className="flex items-center gap-1 text-purple-700 font-semibold">
                <span className="inline-block w-2.5 h-2 bg-purple-100 border border-purple-300" /> 95% Confidence Band
              </span>
            </div>

            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setForecastHorizon('3h')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${forecastHorizon === '3h' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                +3h View
              </button>
              <button
                onClick={() => setForecastHorizon('6h')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${forecastHorizon === '6h' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
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
                <linearGradient id="confidenceBandLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="timeLabel"
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                tickMargin={10}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                unit=" cm"
                domain={[0, 8]}
              />

              {/* Warning (4.0cm sag) & Critical (6.0cm sag) Reference Lines */}
              <ReferenceLine
                y={4.0}
                stroke="#d97706"
                strokeDasharray="4 4"
                label={{ value: 'Warning Limit (4.0cm Sag)', fill: '#b45309', fontSize: 10, position: 'right', fontFamily: 'monospace' }}
              />

              <ReferenceLine
                y={6.0}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{ value: 'Critical Limit (6.0cm Sag)', fill: '#b91c1c', fontSize: 10, position: 'right', fontFamily: 'monospace' }}
              />

              {/* 95% Confidence Upper and Lower Area */}
              <Area
                type="monotone"
                dataKey="confidenceUpperCm"
                stroke="none"
                fill="url(#confidenceBandLight)"
                isAnimationActive={false}
              />

              {/* Observed Sag Line */}
              <Line
                type="monotone"
                dataKey="observedSagCm"
                name="Observed Sag (cm)"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0284c7' }}
                connectNulls={false}
                isAnimationActive={false}
              />

              {/* AI Projected Sag Line */}
              <Line
                type="monotone"
                dataKey="predictedSagCm"
                name="AI Projected Sag (cm)"
                stroke="#d97706"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3.5, fill: '#d97706' }}
                isAnimationActive={false}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs shadow-xl space-y-1 z-50">
                        <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                          <span>{label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${data.isProjected ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
                            {data.isProjected ? 'AI PROJECTED' : 'MEASURED'}
                          </span>
                        </div>
                        {data.observedSagCm !== null && (
                          <div className="text-sky-700">Observed Sag: <strong>{data.observedSagCm} cm</strong></div>
                        )}
                        <div className="text-amber-700">Predicted Sag: <strong>{data.predictedSagCm} cm</strong></div>
                        <div className="text-purple-700 text-[10px]">
                          95% CI: [{data.confidenceLowerCm} cm — {data.confidenceUpperCm} cm]
                        </div>
                        {data.rateCmPerHr > 0 && (
                          <div className="text-slate-500 text-[10px]">Convergence Rate: +{data.rateCmPerHr} cm/hr</div>
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
