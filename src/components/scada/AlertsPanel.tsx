import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { AlertItem } from '../../types/sensor';
import { formatTimestamp } from '../../utils/formatters';

export interface AlertsPanelProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAcknowledgeAlert }) => {
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const hasCritical = activeAlerts.some(a => a.severity === 'CRITICAL');

  return (
    <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1c2842] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            ACTIVE ALERTS & SAFETY DIRECTIVES
          </h3>
        </div>
        <span className="font-mono text-xs text-slate-400">
          {activeAlerts.length} Active Notice{activeAlerts.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Content */}
      {activeAlerts.length === 0 ? (
        <div className="rounded-lg bg-[#070a12] p-6 border border-[#1c2842] flex items-center justify-center gap-3 text-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div className="font-mono text-xs">
            <span className="font-bold text-emerald-400 block text-sm">No critical alerts</span>
            <span className="text-slate-500">All sensor telemetry parameters within nominal operational limits.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3 font-mono text-xs">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                alert.severity === 'CRITICAL'
                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                  : alert.severity === 'WARNING'
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-900 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {alert.severity === 'CRITICAL' ? (
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                )}

                <div>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-white">{alert.sensor}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded border uppercase">
                      {alert.severity}
                    </span>
                    <span className="text-slate-400 font-normal text-[11px]">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-200 mt-0.5 text-xs">{alert.message}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Trigger: <strong className="text-white">{alert.value}</strong> (Limit: {alert.threshold})
                  </p>
                </div>
              </div>

              <button
                onClick={() => onAcknowledgeAlert(alert.id)}
                className="self-start sm:self-center inline-flex items-center gap-1.5 rounded bg-[#0c1222] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700 transition-colors shrink-0"
              >
                <Check className="h-3.5 w-3.5 text-amber-400" />
                <span>Acknowledge</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
