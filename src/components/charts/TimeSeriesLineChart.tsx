import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { formatTimeOnly } from '../../utils/formatters';

export interface SeriesConfig {
  key: string;
  name: string;
  color: string;
  unit?: string;
  dashed?: boolean;
}

export interface TimeSeriesLineChartProps {
  data: any[];
  series: SeriesConfig[];
  height?: number;
  yAxisLabel?: string;
  yDomain?: [number | string, number | string];
  warningThreshold?: number;
  criticalThreshold?: number;
  warningLabel?: string;
  criticalLabel?: string;
}

export const TimeSeriesLineChart: React.FC<TimeSeriesLineChartProps> = ({
  data,
  series,
  height = 260,
  yAxisLabel,
  yDomain,
  warningThreshold,
  criticalThreshold,
  warningLabel = 'Warning Threshold',
  criticalLabel = 'Critical Threshold'
}) => {
  // Format tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-700 bg-industrial-950 p-2.5 shadow-xl font-mono text-xs">
          <div className="text-slate-400 mb-1 border-b border-slate-800 pb-1">
            Time: {formatTimeOnly(label)}
          </div>
          {payload.map((entry: any, index: number) => {
            const seriesConfig = series.find(s => s.key === entry.dataKey);
            const val = entry.value !== null && entry.value !== undefined ? entry.value : 'N/A';
            return (
              <div key={index} className="flex items-center justify-between gap-3 py-0.5">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {typeof val === 'number' ? val.toFixed(2) : val} {seriesConfig?.unit || ''}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.7} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(time) => formatTimeOnly(time)}
            stroke="#64748b"
            tick={{ fontSize: 11, fill: '#64748b' }}
            minTickGap={40}
          />
          <YAxis
            domain={yDomain || ['auto', 'auto']}
            stroke="#64748b"
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, dx: 15 }
                : undefined
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
          />

          {/* Reference Threshold Lines */}
          {warningThreshold !== undefined && (
            <ReferenceLine
              y={warningThreshold}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: warningLabel,
                fill: '#f59e0b',
                fontSize: 10,
                position: 'insideTopRight'
              }}
            />
          )}
          {criticalThreshold !== undefined && (
            <ReferenceLine
              y={criticalThreshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: criticalLabel,
                fill: '#ef4444',
                fontSize: 10,
                position: 'insideTopRight'
              }}
            />
          )}

          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '4 4' : undefined}
              dot={false}
              activeDot={{ r: 4, fill: s.color, stroke: '#0f172a', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
