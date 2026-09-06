import React from 'react';
import { Cpu, Server, Wifi, Radio, Clock, ShieldCheck } from 'lucide-react';
import { ConnectionHealth } from '../../hooks/useRoverData';

export interface SystemHealthPanelProps {
  connectionHealth: ConnectionHealth;
  lastUpdatedTime: string;
}

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({
  connectionHealth,
  lastUpdatedTime
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-sky-50 text-sky-600 border border-sky-100">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
            SYSTEM HEALTH & HARDWARE UPLINK
          </h3>
        </div>

        {/* Small live communication indicator */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 font-semibold">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>UPLINK ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 font-mono text-xs">
        {/* Arduino UNO */}
        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-0.5">
            <span className="text-[9px] uppercase font-semibold">Node MCU</span>
            <Cpu className="h-3 w-3 text-sky-600" />
          </div>
          <span className="text-xs text-slate-900 font-bold block">Arduino UNO</span>
          <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1 mt-0.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500" /> CONNECTED
          </span>
        </div>

        {/* ESP32 Gateway */}
        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-0.5">
            <span className="text-[9px] uppercase font-semibold">Wi-Fi Gateway</span>
            <Radio className="h-3 w-3 text-amber-600" />
          </div>
          <span className="text-xs text-slate-900 font-bold block">ESP32 DevKit</span>
          <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1 mt-0.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500" /> ONLINE
          </span>
        </div>

        {/* AWS Connection */}
        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-0.5">
            <span className="text-[9px] uppercase font-semibold">Cloud Host</span>
            <Server className="h-3 w-3 text-purple-600" />
          </div>
          <span className="text-xs text-slate-900 font-bold block">AWS REST API</span>
          <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1 mt-0.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500" /> CONNECTED
          </span>
        </div>

        {/* Sensor Network */}
        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-0.5">
            <span className="text-[9px] uppercase font-semibold">Sensor Bus</span>
            <ShieldCheck className="h-3 w-3 text-teal-600" />
          </div>
          <span className="text-xs text-slate-900 font-bold block">Sensor Network</span>
          <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1 mt-0.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500" /> 4/4 ACTIVE
          </span>
        </div>

        {/* Last Data Packet */}
        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-0.5">
            <span className="text-[9px] uppercase font-semibold">Last Packet</span>
            <Clock className="h-3 w-3 text-slate-400" />
          </div>
          <span className="text-xs text-slate-900 font-bold block">Sync Timestamp</span>
          <span className="text-slate-800 font-bold text-[10px] mt-0.5">
            {lastUpdatedTime}
          </span>
        </div>
      </div>
    </div>
  );
};
