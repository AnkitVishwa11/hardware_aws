import React from 'react';
import { DataSourceMode, ConnectionHealth } from '../../hooks/useRoverData';
import { RiskLevel } from '../../types/sensor';
import { DemoScenario } from '../../services/demoSimulator';
import { StatusBadge } from './StatusBadge';
import { AVAILABLE_ROVERS, PROJECT_INFO } from '../../utils/constants';
import { 
  Radio, 
  RotateCw, 
  Sun, 
  Moon, 
  Menu, 
  AlertCircle, 
  Play, 
  Clock, 
  RadioTower, 
  Layers,
  Cpu,
  ShieldCheck
} from 'lucide-react';

export interface NavbarProps {
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
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleMobileSidebar: () => void;
  demoScenario: DemoScenario;
  onSelectDemoScenario: (s: DemoScenario) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
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
  theme,
  onToggleTheme,
  onToggleMobileSidebar,
  demoScenario,
  onSelectDemoScenario
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-industrial-950/95 backdrop-blur-md shadow-md">
      {/* Top Primary Bar: Brand & Action Controls */}
      <div className="flex h-14 items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left Section: Mobile Menu + Title & SIH Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white shrink-0"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mission Control Icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-mine-gold to-amber-600 shadow-sm shadow-amber-500/20 text-industrial-950 shrink-0 font-black">
            <RadioTower className="h-5 w-5 text-slate-950" />
          </div>

          {/* Title and Hackathon Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white sm:text-base whitespace-nowrap">
              {PROJECT_INFO.name}
            </h1>
            <span className="rounded bg-mine-gold/15 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-mine-gold border border-mine-gold/30 uppercase whitespace-nowrap">
              {PROJECT_INFO.hackathonId} Prototype
            </span>
            <span className="hidden 2xl:inline text-xs text-slate-400 truncate">
              — {PROJECT_INFO.subtitle}
            </span>
          </div>
        </div>

        {/* Right Section: Mode Toggle, Scenario, Interval, Refresh, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Demo Scenario Selector (only visible in DEMO mode) */}
          {mode === 'DEMO' && (
            <div className="flex items-center gap-1">
              <Layers className="hidden sm:block h-3.5 w-3.5 text-amber-400 shrink-0" />
              <select
                value={demoScenario}
                onChange={(e) => onSelectDemoScenario(e.target.value as DemoScenario)}
                className="max-w-[140px] sm:max-w-[190px] rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-mono font-medium text-amber-300 focus:outline-none focus:border-amber-400 truncate"
                title="Select simulated underground hazard scenario"
              >
                <option value="normal" className="bg-slate-900 text-slate-200">Normal Traverse</option>
                <option value="subsidence" className="bg-slate-900 text-slate-200">Roof Sag Subsidence</option>
                <option value="vibration" className="bg-slate-900 text-slate-200">High Vibration Event</option>
                <option value="gas_leak" className="bg-slate-900 text-slate-200">Gas Level Anomaly</option>
                <option value="stale_connection" className="bg-slate-900 text-slate-200">Stale Packet Timeout</option>
              </select>
            </div>
          )}

          {/* Mode Switcher: LIVE vs DEMO */}
          <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 shrink-0">
            <button
              onClick={() => onToggleMode('LIVE')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-mono font-semibold transition-colors ${
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
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-mono font-semibold transition-colors ${
                mode === 'DEMO'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="h-3 w-3" />
              <span>DEMO</span>
            </button>
          </div>

          {/* Refresh Interval Selector */}
          <select
            value={pollIntervalMs}
            onChange={(e) => onSelectPollInterval(Number(e.target.value))}
            className="hidden sm:block rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-slate-600 shrink-0"
            title="Data polling refresh frequency"
          >
            <option value={3000}>3s Polling</option>
            <option value={5000}>5s Polling</option>
            <option value={10000}>10s Polling</option>
            <option value={30000}>30s Polling</option>
          </select>

          {/* Manual Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 sm:p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50 shrink-0"
            title="Force immediate telemetry poll"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-mine-cyan' : ''}`} />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 sm:p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Secondary Mission Control Telemetry Ribbon */}
      <div className="border-t border-slate-800/80 bg-industrial-900/90 px-3 sm:px-4 lg:px-6 py-1.5 flex items-center justify-between overflow-x-auto text-xs font-mono no-scrollbar gap-4">
        {/* Left Telemetry Group */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 whitespace-nowrap">
          {/* Rover ID Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] uppercase">Unit:</span>
            <select
              value={roverId}
              onChange={(e) => onSelectRover(e.target.value)}
              className="rounded border border-slate-700 bg-slate-950 px-2 py-0.5 font-bold text-mine-cyan text-xs focus:outline-none focus:border-mine-cyan"
            >
              {AVAILABLE_ROVERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.name.includes('Primary') ? 'Primary' : 'Standby'})
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-700">|</span>

          {/* Gateway Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] uppercase">Gateway:</span>
            <StatusBadge
              status={connectionHealth}
              size="sm"
              pulse={connectionHealth === 'STALE' || connectionHealth === 'OFFLINE'}
            />
          </div>

          <span className="text-slate-700">|</span>

          {/* Last Updated Timestamp */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-[11px] uppercase">Updated:</span>
            <span className="text-slate-200 font-semibold">{lastUpdatedTime}</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Risk Level Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] uppercase">Overall Risk:</span>
            <StatusBadge status={overallRisk} size="sm" />
          </div>
        </div>

        {/* Right Status Group */}
        <div className="hidden md:flex items-center gap-3 shrink-0 text-[11px] text-slate-400 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-mine-gold" />
            <span>Architecture: Arduino Uno → ESP32 → AWS API</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            <span>SIH26025 Prototype Active</span>
          </div>
        </div>
      </div>

      {/* Subheader Alert when Connection is Stale or Error */}
      {connectionHealth === 'STALE' && (
        <div className="flex items-center justify-center gap-2 bg-amber-500/15 py-1 px-4 text-xs font-mono text-amber-300 border-t border-amber-500/20">
          <AlertCircle className="h-3.5 w-3.5 animate-pulse text-amber-400 shrink-0" />
          <span>Connection: STALE – Telemetry packet is older than timeout threshold (&gt;15s). Waiting for ESP32 uplink...</span>
        </div>
      )}
    </header>
  );
};
