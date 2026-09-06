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
  X,
  Satellite,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle
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

  const getRiskBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: ShieldAlert,
          label: 'CRITICAL HAZARD'
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: AlertTriangle,
          label: 'CAUTION WARN'
        };
      case 'NORMAL':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: ShieldCheck,
          label: 'NORMAL / STABLE'
        };
    }
  };

  const riskBadge = getRiskBadge(overallRisk);
  const RiskIcon = riskBadge.icon;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="flex h-full w-full items-center justify-between px-3 sm:px-4 md:px-5">
        {/* LEFT SECTION: Rover Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5">
            {/* Control Room Emblem */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-xs text-white font-black">
              <RadioTower className="h-4 w-4" />
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-extrabold tracking-wider text-slate-900">
                  SUBSENTRY
                </span>
                <span className="rounded bg-amber-100 px-1 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-800 border border-amber-300">
                  SIH26025
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-wide text-slate-500 hidden sm:block">
                Mine Subsidence SCADA System
              </p>
            </div>
          </div>
        </div>

        {/* CENTER SECTION: Telemetry Status HUD (Desktop / Tablet) */}
        <div className="hidden md:flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-1 border border-slate-200 font-mono text-xs shadow-2xs">
          {/* Unit Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Unit:</span>
            <select
              value={roverId}
              onChange={(e) => onSelectRover(e.target.value)}
              aria-label="Select Rover Unit"
              className="rounded bg-white px-2 py-0.5 font-bold text-sky-700 border border-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs text-xs"
            >
              {AVAILABLE_ROVERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.id})
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-300">|</span>

          {/* Gateway Status */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Link:</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-bold border ${
              connectionHealth === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${connectionHealth === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
              {connectionHealth}
            </span>
          </div>

          <span className="text-slate-300">|</span>

          {/* Last Updated Time */}
          <div className="flex items-center gap-1 text-slate-600">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] uppercase font-semibold text-slate-500">Sync:</span>
            <span className="font-bold text-slate-800 text-[11px]">{lastUpdatedTime}</span>
          </div>

          <span className="text-slate-300">|</span>

          {/* Overall Safety Risk Gauge */}
          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-extrabold border ${riskBadge.bg}`}>
              <RiskIcon className="h-3 w-3" />
              {riskBadge.label}
            </span>
          </div>
        </div>

        {/* RIGHT SECTION: Mode, Polling Rate & Simulation Controls */}
        <div className="flex items-center gap-2">
          {/* Demo Scenario Selector (Visible in DEMO mode on wide screens) */}
          {mode === 'DEMO' && (
            <div className="hidden lg:flex items-center">
              <select
                value={demoScenario}
                onChange={(e) => onSelectDemoScenario(e.target.value as DemoScenario)}
                aria-label="Select Demo Scenario"
                className="rounded-md border border-amber-300 bg-amber-50/90 px-2 py-1 text-xs font-mono font-bold text-amber-900 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                title="Simulate underground mine hazard scenario"
              >
                <option value="normal">Scenario: Normal</option>
                <option value="subsidence">Scenario: Roof Sag</option>
                <option value="vibration">Scenario: High Vibration</option>
                <option value="gas_leak">Scenario: Gas Anomaly</option>
                <option value="stale_connection">Scenario: Stale Packet</option>
              </select>
            </div>
          )}

          {/* Mode Switcher: LIVE / DEMO */}
          <div className="flex rounded-md border border-slate-200 bg-slate-100 p-0.5 font-mono text-xs shadow-2xs">
            <button
              onClick={() => onToggleMode('LIVE')}
              className={`flex items-center gap-1 rounded px-2 py-0.5 font-bold transition-all text-xs ${
                mode === 'LIVE'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="h-3 w-3" />
              <span>LIVE</span>
            </button>
            <button
              onClick={() => onToggleMode('DEMO')}
              className={`flex items-center gap-1 rounded px-2 py-0.5 font-bold transition-all text-xs ${
                mode === 'DEMO'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
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
            className="hidden xl:block rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-mono font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
            title="Telemetry polling interval"
          >
            <option value={1000}>1s Stream</option>
            <option value={3000}>3s Polling</option>
            <option value={5000}>5s Polling</option>
            <option value={10000}>10s Polling</option>
          </select>

          {/* Force Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 shadow-2xs"
            title="Force immediate telemetry poll"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          {/* Compact Mobile Toggle Button */}
          <button
            onClick={() => setShowMobileControls(prev => !prev)}
            className="md:hidden rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50"
            title="Toggle Quick Controls"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {showMobileControls && (
        <div className="md:hidden border-t border-slate-200 bg-white p-3 shadow-xl space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-100">
            <span className="font-bold">CONTROL PANEL</span>
            <button onClick={() => setShowMobileControls(false)} className="text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-slate-500 block mb-1 font-semibold">ROVER UNIT:</span>
              <select
                value={roverId}
                onChange={(e) => onSelectRover(e.target.value)}
                className="w-full rounded bg-slate-50 p-1.5 text-sky-700 border border-slate-200 font-bold"
              >
                {AVAILABLE_ROVERS.map((r) => (
                  <option key={r.id} value={r.id}>{r.id}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block mb-1 font-semibold">REFRESH RATE:</span>
              <select
                value={pollIntervalMs}
                onChange={(e) => onSelectPollInterval(Number(e.target.value))}
                className="w-full rounded bg-slate-50 p-1.5 text-slate-700 border border-slate-200"
              >
                <option value={1000}>1s Live Stream</option>
                <option value={3000}>3s Polling</option>
                <option value={5000}>5s Polling</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
