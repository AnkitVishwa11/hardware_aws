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
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-100">
            <Bell className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
            ACTIVE ALERTS & SAFETY DIRECTIVES
          </h3>
        </div>
        <span className="font-mono text-[11px] text-slate-500 font-semibold">
          {activeAlerts.length} Active Notice{activeAlerts.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Content */}
      {activeAlerts.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 flex items-center justify-center gap-2.5 text-center">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <div className="font-mono text-xs">
            <span className="font-bold text-emerald-700 block text-xs sm:text-sm">No critical alerts</span>
            <span className="text-slate-500 text-[11px]">All sensor telemetry parameters within nominal operational limits.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2 font-mono text-xs">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg p-2.5 border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                alert.severity === 'CRITICAL'
                  ? 'border-rose-200 bg-rose-50 text-rose-900'
                  : alert.severity === 'WARNING'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-slate-50 text-slate-800'
              }`}
            >
              <div className="flex items-start gap-2">
                {alert.severity === 'CRITICAL' ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                )}

                <div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-slate-900">{alert.sensor}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded border uppercase font-bold">
                      {alert.severity}
                    </span>
                    <span className="text-slate-500 font-normal text-[10px]">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-0.5 text-[11px]">{alert.message}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Trigger: <strong className="text-slate-900">{alert.value}</strong> (Limit: {alert.threshold})
                  </p>
                </div>
              </div>

              <button
                onClick={() => onAcknowledgeAlert(alert.id)}
                className="self-start sm:self-center inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-300 shadow-2xs transition-colors shrink-0"
              >
                <Check className="h-3 w-3 text-amber-600" />
                <span>Acknowledge</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
