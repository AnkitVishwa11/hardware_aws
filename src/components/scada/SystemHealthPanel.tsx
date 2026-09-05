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
    <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1c2842] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-sky-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            SYSTEM HEALTH & HARDWARE UPLINK
          </h3>
        </div>

        {/* Small live communication indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>UPLINK PULSE ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
        {/* Arduino UNO */}
        <div className="rounded-lg bg-[#070a12] p-3 border border-[#1c2842] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase">Node MCU</span>
            <Cpu className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <span className="text-xs text-slate-200 font-semibold block">Arduino UNO</span>
          <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> CONNECTED
          </span>
        </div>

        {/* ESP32 Gateway */}
        <div className="rounded-lg bg-[#070a12] p-3 border border-[#1c2842] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase">Wi-Fi Gateway</span>
            <Radio className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-xs text-slate-200 font-semibold block">ESP32 DevKit</span>
          <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> ONLINE
          </span>
        </div>

        {/* AWS Connection */}
        <div className="rounded-lg bg-[#070a12] p-3 border border-[#1c2842] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase">Cloud Host</span>
            <Server className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <span className="text-xs text-slate-200 font-semibold block">AWS REST API</span>
          <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> CONNECTED
          </span>
        </div>

        {/* Sensor Network */}
        <div className="rounded-lg bg-[#070a12] p-3 border border-[#1c2842] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase">Sensor Bus</span>
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <span className="text-xs text-slate-200 font-semibold block">Sensor Network</span>
          <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 4/4 ACTIVE
          </span>
        </div>

        {/* Last Data Packet */}
        <div className="rounded-lg bg-[#070a12] p-3 border border-[#1c2842] flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase">Last Packet</span>
            <Clock className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <span className="text-xs text-slate-200 font-semibold block">Sync Timestamp</span>
          <span className="text-slate-200 font-bold text-[11px] mt-1">
            {lastUpdatedTime}
          </span>
        </div>
      </div>
    </div>
  );
};
