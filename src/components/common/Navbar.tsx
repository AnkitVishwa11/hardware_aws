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
  Layers
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
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-industrial-950/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section: Mobile Menu + Title & SIH Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mine-gold to-amber-600 shadow-md shadow-amber-500/20 text-industrial-950 font-black">
              <RadioTower className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                  {PROJECT_INFO.name}
                </h1>
                <span className="hidden sm:inline-flex rounded bg-mine-gold/15 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-mine-gold border border-mine-gold/30 uppercase">
                  {PROJECT_INFO.hackathonId} Prototype
                </span>
              </div>
              <p className="hidden text-xs text-slate-400 md:block">
                {PROJECT_INFO.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Center Section: Telemetry Status Badges */}
        <div className="hidden xl:flex items-center gap-3 border-x border-slate-800/80 px-4">
          {/* Rover ID Selector */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400">Unit:</span>
            <select
              value={roverId}
              onChange={(e) => onSelectRover(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 font-bold text-mine-cyan text-xs focus:outline-none focus:border-mine-cyan"
            >
              {AVAILABLE_ROVERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.name.includes('Primary') ? 'Primary' : 'Standby'})
                </option>
              ))}
            </select>
          </div>

          {/* Connection Status Pill */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400">Gateway:</span>
            <StatusBadge
              status={connectionHealth}
              size="sm"
              pulse={connectionHealth === 'STALE' || connectionHealth === 'OFFLINE'}
            />
          </div>

          {/* Last Updated Timestamp */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Updated:</span>
            <span className="text-slate-200 font-semibold">{lastUpdatedTime}</span>
          </div>

          {/* Risk Level Pill */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400">Risk:</span>
            <StatusBadge status={overallRisk} size="sm" />
          </div>
        </div>

        {/* Right Section: Mode Toggle, Refresh & Scenario Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Scenario Selector (only visible in DEMO mode) */}
          {mode === 'DEMO' && (
            <div className="hidden sm:flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <select
                value={demoScenario}
                onChange={(e) => onSelectDemoScenario(e.target.value as DemoScenario)}
                className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-mono font-medium text-amber-300 focus:outline-none focus:border-amber-400"
                title="Select simulated underground hazard scenario"
              >
                <option value="normal" className="bg-slate-900 text-slate-200">Scenario: Normal Traverse</option>
                <option value="subsidence" className="bg-slate-900 text-slate-200">Scenario: Roof Sag Subsidence</option>
                <option value="vibration" className="bg-slate-900 text-slate-200">Scenario: High Vibration Event</option>
                <option value="gas_leak" className="bg-slate-900 text-slate-200">Scenario: Gas Level Anomaly</option>
                <option value="stale_connection" className="bg-slate-900 text-slate-200">Scenario: Stale Packet Timeout</option>
              </select>
            </div>
          )}

          {/* Mode Switcher: LIVE DATA vs DEMO DATA */}
          <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5">
            <button
              onClick={() => onToggleMode('LIVE')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-semibold transition-colors ${
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
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-semibold transition-colors ${
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
            className="hidden md:block rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-slate-600"
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
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
            title="Force immediate telemetry poll"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-mine-cyan' : ''}`} />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Subheader Alert when Connection is Stale or Error */}
      {connectionHealth === 'STALE' && (
        <div className="flex items-center justify-center gap-2 bg-amber-500/15 py-1 px-4 text-xs font-mono text-amber-300 border-t border-amber-500/20">
          <AlertCircle className="h-3.5 w-3.5 animate-pulse text-amber-400" />
          <span>Connection: STALE – Telemetry packet is older than timeout threshold (&gt;15s). Waiting for ESP32 uplink...</span>
        </div>
      )}
    </header>
  );
};
