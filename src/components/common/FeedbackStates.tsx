import React from 'react';
import { Loader2, AlertCircle, Database } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ 
  message = "Acquiring Rover Telemetry..." 
}) => (
  <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 bg-industrial-900/50 p-8 text-center">
    <Loader2 className="h-8 w-8 animate-spin text-mine-gold" />
    <p className="text-xs font-mono text-slate-400">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ 
  title?: string; 
  message: string; 
  onRetry?: () => void;
}> = ({ 
  title = "Telemetry Uplink Interrupted", 
  message, 
  onRetry 
}) => (
  <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
    <div className="rounded-full bg-rose-500/10 p-3 text-rose-400">
      <AlertCircle className="h-7 w-7" />
    </div>
    <h4 className="text-sm font-bold text-rose-300 uppercase font-mono">{title}</h4>
    <p className="max-w-md text-xs text-slate-400 font-mono">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-mono font-semibold text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
      >
        Retry Uplink
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ 
  title?: string; 
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}> = ({ 
  title = "No Data Records Available", 
  message = "No telemetry matches the selected filter window.",
  icon: Icon = Database
}) => (
  <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-industrial-900/30 p-8 text-center">
    <div className="rounded-full bg-slate-800 p-3 text-slate-500">
      <Icon className="h-6 w-6" />
    </div>
    <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
    <p className="text-xs text-slate-500 font-mono max-w-sm">{message}</p>
  </div>
);
