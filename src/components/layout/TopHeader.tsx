import React, { useState } from 'react';
import { DataSourceMode, ConnectionHealth } from '../../hooks/useRoverData';
import { RiskLevel } from '../../types/sensor';
import { DemoScenario } from '../../services/demoSimulator';
import { AVAILABLE_ROVERS } from '../../utils/constants';
import { 
  Radio, 
  RotateCw, 
  Menu, 
  RadioTower, 
  Clock, 
  Play, 
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';

export interface TopHeaderProps {
  mode: DataSourceMode;
  onToggleMode: (mode: DataSourceMode) => void;
  roverId: string;
  onSelectRover: (id: string) => void;
  connectionHealth: ConnectionHealth;
  lastUpdatedTime: string;
  overallRisk: RiskLevel;
  pollIntervalMs: number;
  onSelectPollInterval: (ms: number) => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  onToggleMobileSidebar: () => void;
  demoScenario: DemoScenario;
  onSelectDemoScenario: (s: DemoScenario) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  mode,
  onToggleMode,
  roverId,
  onSelectRover,
  connectionHealth,
  lastUpdatedTime,
  overallRisk,
  pollIntervalMs,
  onSelectPollInterval,
  onManualRefresh,
  isRefreshing,
  onToggleMobileSidebar,
  demoScenario,
  onSelectDemoScenario
}) => {
  const [showMobileControls, setShowMobileControls] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'WARNING':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'NORMAL':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const getGatewayColor = (status: ConnectionHealth) => {
    switch (status) {
      case 'OFFLINE':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'STALE':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse';
      case 'ONLINE':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] z-50 border-b border-[#1c2842] bg-[#0c1222] shadow-lg">
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-6">
        {/* LEFT SECTION: Rover Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Control Room Emblem */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20 text-slate-950 font-black">
              <RadioTower className="h-5 w-5" />
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold tracking-widest text-white">
                  ROVER
                </span>
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
                  SIH26025
                </span>
              </div>
              <p className="text-[11px] font-mono tracking-wide text-slate-400">
                Mine Monitoring System
              </p>
            </div>
          </div>
        </div>

        {/* CENTER SECTION: Telemetry Status HUD (Desktop / Tablet) */}
        <div className="hidden md:flex items-center gap-4 rounded-lg bg-[#070a12] px-4 py-1.5 border border-[#1c2842] font-mono text-xs shadow-inner">
          {/* Unit Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 uppercase">Unit:</span>
            <select
              value={roverId}
              onChange={(e) => onSelectRover(e.target.value)}
              aria-label="Select Rover Unit"
              className="rounded bg-[#10192d] px-2 py-0.5 font-bold text-sky-400 border border-slate-700 focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              {AVAILABLE_ROVERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-700">|</span>

          {/* Gateway Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 uppercase">Gateway:</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${getGatewayColor(connectionHealth)}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${connectionHealth === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              {connectionHealth}
            </span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Last Updated Time */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-[11px] uppercase">Updated:</span>
            <span className="font-semibold text-slate-200">{lastUpdatedTime}</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Risk Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 uppercase">Risk:</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold border ${getRiskColor(overallRisk)}`}>
              {overallRisk}
            </span>
          </div>
        </div>

        {/* RIGHT SECTION: Operational Controls */}
        <div className="flex items-center gap-2">
          {/* Scenario Selector (visible in DEMO mode on medium/large screens) */}
          {mode === 'DEMO' && (
            <div className="hidden lg:block">
              <select
                value={demoScenario}
                onChange={(e) => onSelectDemoScenario(e.target.value as DemoScenario)}
                aria-label="Select Demo Scenario"
                className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-mono font-medium text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                title="Simulate underground mine hazard scenario"
              >
                <option value="normal" className="bg-[#0c1222] text-slate-200">Scenario: Normal Traverse</option>
                <option value="subsidence" className="bg-[#0c1222] text-slate-200">Scenario: Roof Sag Subsidence</option>
                <option value="vibration" className="bg-[#0c1222] text-slate-200">Scenario: High Vibration Event</option>
                <option value="gas_leak" className="bg-[#0c1222] text-slate-200">Scenario: Gas Level Anomaly</option>
                <option value="stale_connection" className="bg-[#0c1222] text-slate-200">Scenario: Stale Packet Timeout</option>
              </select>
            </div>
          )}

          {/* Mode Switcher: LIVE / DEMO */}
          <div className="flex rounded-lg border border-slate-700 bg-[#070a12] p-0.5 font-mono text-xs">
            <button
              onClick={() => onToggleMode('LIVE')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 font-semibold transition-colors ${
                mode === 'LIVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="h-3 w-3" />
              <span>LIVE</span>
            </button>
            <button
              onClick={() => onToggleMode('DEMO')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 font-semibold transition-colors ${
                mode === 'DEMO'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="h-3 w-3" />
              <span>DEMO</span>
            </button>
          </div>

          {/* Polling Interval Selector */}
          <select
            value={pollIntervalMs}
            onChange={(e) => onSelectPollInterval(Number(e.target.value))}
            aria-label="Polling Refresh Rate"
            className="hidden xl:block rounded-md border border-slate-700 bg-[#070a12] px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-slate-500 cursor-pointer"
            title="Telemetry polling interval"
          >
            <option value={3000}>3s Polling</option>
            <option value={5000}>5s Polling</option>
            <option value={10000}>10s Polling</option>
            <option value={30000}>30s Polling</option>
          </select>

          {/* Force Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="rounded-lg border border-slate-700 bg-[#070a12] p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50 shadow-sm"
            title="Force immediate telemetry poll"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Compact Dropdown Toggle for Mobile / Tablet */}
          <button
            onClick={() => setShowMobileControls(prev => !prev)}
            className="md:hidden rounded-lg border border-slate-700 bg-[#070a12] p-2 text-slate-300 hover:bg-slate-800"
            title="Toggle Quick Controls"
          >
            <SlidersHorizontal className="h-4 w-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Mobile / Compact Dropdown Overlay Menu */}
      {showMobileControls && (
        <div className="md:hidden border-t border-[#1c2842] bg-[#0c1222] p-3 shadow-2xl space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
            <span>QUICK CONTROL PANEL</span>
            <button onClick={() => setShowMobileControls(false)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">ROVER UNIT:</span>
              <select
                value={roverId}
                onChange={(e) => onSelectRover(e.target.value)}
                aria-label="Select Rover Unit Mobile"
                className="w-full rounded bg-[#070a12] p-1.5 text-sky-400 border border-slate-700 font-bold"
              >
                {AVAILABLE_ROVERS.map((r) => (
                  <option key={r.id} value={r.id}>{r.id}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">REFRESH RATE:</span>
              <select
                value={pollIntervalMs}
                onChange={(e) => onSelectPollInterval(Number(e.target.value))}
                aria-label="Select Polling Rate Mobile"
                className="w-full rounded bg-[#070a12] p-1.5 text-slate-200 border border-slate-700"
              >
                <option value={3000}>3s Polling</option>
                <option value={5000}>5s Polling</option>
                <option value={10000}>10s Polling</option>
              </select>
            </div>
          </div>

          {mode === 'DEMO' && (
            <div className="pt-1">
              <span className="text-[10px] text-amber-400 block mb-1">SIMULATION SCENARIO:</span>
              <select
                value={demoScenario}
                onChange={(e) => onSelectDemoScenario(e.target.value as DemoScenario)}
                aria-label="Select Simulation Scenario Mobile"
                className="w-full rounded border border-amber-500/40 bg-amber-500/10 p-1.5 text-amber-300 font-medium"
              >
                <option value="normal" className="bg-[#0c1222] text-slate-200">Normal Traverse</option>
                <option value="subsidence" className="bg-[#0c1222] text-slate-200">Roof Sag Subsidence</option>
                <option value="vibration" className="bg-[#0c1222] text-slate-200">High Vibration Event</option>
                <option value="gas_leak" className="bg-[#0c1222] text-slate-200">Gas Level Anomaly</option>
                <option value="stale_connection" className="bg-[#0c1222] text-slate-200">Stale Packet Timeout</option>
              </select>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
