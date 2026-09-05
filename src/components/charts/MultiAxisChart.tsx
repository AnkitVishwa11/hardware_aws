import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { formatTimeOnly } from '../../utils/formatters';

export interface MultiAxisChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  zKey: string;
  height?: number;
  unit?: string;
  yDomain?: [number | string, number | string];
}

export const MultiAxisChart: React.FC<MultiAxisChartProps> = ({
  data,
  xKey,
  yKey,
  zKey,
  height = 240,
  unit = 'g',
  yDomain
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-700 bg-industrial-950 p-2.5 shadow-xl font-mono text-xs">
          <div className="text-slate-400 mb-1 border-b border-slate-800 pb-1">
            Time: {formatTimeOnly(label)}
          </div>
          {payload.map((entry: any, index: number) => {
            const val = entry.value !== null && entry.value !== undefined ? entry.value : 'N/A';
            return (
              <div key={index} className="flex items-center justify-between gap-3 py-0.5">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {typeof val === 'number' ? val.toFixed(2) : val} {unit}
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
        <LineChart data={data} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
          />
          <Line
            type="monotone"
            dataKey={xKey}
            name="Axis X"
            stroke="#ef4444"
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            name="Axis Y"
            stroke="#10b981"
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey={zKey}
            name="Axis Z"
            stroke="#38bdf8"
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
