import React, { useState } from 'react';
import { useRoverData } from './hooks/useRoverData';
import { TopHeader } from './components/layout/TopHeader';
import { Sidebar, NavSectionId } from './components/layout/Sidebar';
import { CommandCenterKpis } from './components/scada/CommandCenterKpis';
import { GroundProfileSchematic } from './components/scada/GroundProfileSchematic';
import { ArtificialHorizon } from './components/scada/ArtificialHorizon';
import { VibrationPanel } from './components/scada/VibrationPanel';
import { EnvironmentalRow } from './components/scada/EnvironmentalRow';
import { RiskGauge } from './components/scada/RiskGauge';
import { SystemHealthPanel } from './components/scada/SystemHealthPanel';
import { AlertsPanel } from './components/scada/AlertsPanel';
import { TimeSeriesLineChart } from './components/charts/TimeSeriesLineChart';
import { HistoricalDataTab } from './components/dashboard/HistoricalDataTab';
import { HardwareStatusTab } from './components/dashboard/HardwareStatusTab';
import { LoadingState } from './components/common/FeedbackStates';
import { DISCLAIMERS, PROJECT_INFO } from './utils/constants';
import { Ruler, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSectionId>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const {
    mode,
    setMode,
    roverId,
    setRoverId,
    currentData,
    history,
    alerts,
    riskAnalysis,
    stationaryPoints,
    baseline,
    setBaseline,
    resetBaselineToCurrent,
    pollIntervalMs,
    setPollIntervalMs,
    connectionHealth,
    lastUpdatedTime,
    isLoading,
    refreshNow,
    acknowledgeAlert,
    demoScenario,
    setDemoScenario
  } = useRoverData();

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshNow();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;

  const handleSelectSection = (section: NavSectionId) => {
    setActiveSection(section);
    if (section === 'historical' || section === 'system') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionMap: Record<string, string> = {
      dashboard: 'section-command-center',
      displacement: 'section-ground-monitoring',
      ultrasonic: 'section-ground-monitoring',
      tilt: 'section-motion',
      vibration: 'section-motion',
      gas: 'section-environment',
      temp: 'section-environment',
      humidity: 'section-environment',
      moisture: 'section-environment',
      risk: 'section-risk',
      alerts: 'section-system-alerts'
    };

    const targetId = sectionMap[section];
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const headerOffset = 88; // 72px header + 16px clearance
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 scada-grid">
      {/* 1. FIXED TOP HEADER (Exactly 72px, fixed at top) */}
      <TopHeader
        mode={mode}
        onToggleMode={setMode}
        roverId={roverId}
        onSelectRover={setRoverId}
        connectionHealth={connectionHealth}
        lastUpdatedTime={lastUpdatedTime}
        overallRisk={riskAnalysis.overallRisk}
        pollIntervalMs={pollIntervalMs}
        onSelectPollInterval={setPollIntervalMs}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        demoScenario={demoScenario}
        onSelectDemoScenario={setDemoScenario}
      />

      {/* 2. FIXED LEFT SIDEBAR (Exactly 240px, top: 72px) */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeAlertsCount={activeAlertsCount}
      />

      {/* 3. MAIN SCROLLABLE CONTENT (Starts strictly at top: 72px, left: 240px) */}
      <main className="lg:ml-[240px] pt-[72px] min-h-screen flex flex-col justify-between">
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          {isLoading && !currentData ? (
            <LoadingState message="Connecting to Rover Telemetry Uplink..." />
          ) : activeSection === 'historical' ? (
            /* Dedicated Historical Data View */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#1c2842] pb-3">
                <div>
                  <h2 className="text-lg font-mono font-bold text-white uppercase">Historical Sensor Telemetry</h2>
                  <p className="text-xs text-slate-400 font-mono">Query and analyze archived rover traverse logs</p>
                </div>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="rounded bg-[#10192d] px-3 py-1.5 text-xs font-mono text-amber-400 border border-slate-700 hover:bg-[#182234]"
                >
                  ← Return to Command Center
                </button>
              </div>
              <HistoricalDataTab
                history={history}
                baseline={baseline}
                activeRoverId={roverId}
                isDemo={mode === 'DEMO'}
              />
            </div>
          ) : activeSection === 'system' ? (
            /* Dedicated System / Hardware View */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#1c2842] pb-3">
                <div>
                  <h2 className="text-lg font-mono font-bold text-white uppercase">System & Gateway Diagnostics</h2>
                  <p className="text-xs text-slate-400 font-mono">Hardware links and cloud REST API health</p>
                </div>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="rounded bg-[#10192d] px-3 py-1.5 text-xs font-mono text-amber-400 border border-slate-700 hover:bg-[#182234]"
                >
                  ← Return to Command Center
                </button>
              </div>
              <HardwareStatusTab
                currentData={currentData}
                roverId={roverId}
                isDemo={mode === 'DEMO'}
              />
            </div>
          ) : (
            /* Master Command Center Dashboard (Default View) */
            <>
              {/* SECTION 1 — COMMAND CENTER */}
              <section id="section-command-center">
                <CommandCenterKpis
                  currentData={currentData}
                  lastUpdatedTime={lastUpdatedTime}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 2 — GROUND MONITORING (Largest Visual Section) */}
              <section id="section-ground-monitoring" className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#1c2842] pb-2">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-sky-400" />
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                      GROUND SUBSIDENCE & ACOUSTIC CONVERGENCE
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Baseline Clearance: 22.0 cm
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Left: Large Engineering Ground Displacement Chart (7 cols) */}
                  <div className="xl:col-span-7 rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm flex flex-col justify-between">
                    <div className="flex flex-wrap items-center justify-between border-b border-[#1c2842] pb-3 mb-3 gap-2">
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                          Ground Displacement Over Time (cm)
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400">
                          Superimposed Ultrasonic Sensors (S1 Port, S2 Center, S3 Starboard)
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="text-sky-400 font-bold">● S1</span>
                        <span className="text-amber-400 font-bold">● S2</span>
                        <span className="text-emerald-400 font-bold">● S3</span>
                      </div>
                    </div>

                    <TimeSeriesLineChart
                      data={history}
                      series={[
                        { key: 'distance_1', name: 'S1 (Left)', color: '#38bdf8', unit: 'cm' },
                        { key: 'distance_2', name: 'S2 (Center)', color: '#f59e0b', unit: 'cm' },
                        { key: 'distance_3', name: 'S3 (Right)', color: '#10b981', unit: 'cm' }
                      ]}
                      height={240}
                      yAxisLabel="Distance (cm)"
                      warningThreshold={18.0}
                      criticalThreshold={16.0}
                      warningLabel="Warning (18cm)"
                      criticalLabel="Critical Sag (16cm)"
                    />

                    <div className="mt-2 text-[10px] font-mono text-slate-500 border-t border-[#1c2842] pt-2 flex items-center justify-between">
                      <span>Rate Limit: 1.5 cm/min</span>
                      <span>Prototype rule threshold</span>
                    </div>
                  </div>

                  {/* Right: 3-Point Ground Profile Schematic (5 cols) */}
                  <div className="xl:col-span-5 flex">
                    <div className="w-full">
                      <GroundProfileSchematic
                        d1={currentData?.distance_1 ?? 21.8}
                        d2={currentData?.distance_2 ?? 22.1}
                        d3={currentData?.distance_3 ?? 21.9}
                        b1={baseline.sensor_1}
                        b2={baseline.sensor_2}
                        b3={baseline.sensor_3}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3 — MOTION & STRUCTURAL HEALTH */}
              <section id="section-motion" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Rover Orientation (Inclinometer) */}
                <ArtificialHorizon
                  tiltX={currentData?.tilt_x ?? 0.9}
                  tiltY={currentData?.tilt_y ?? 0.6}
                />

                {/* Right: Vibration Analysis */}
                <VibrationPanel
                  currentData={currentData}
                  history={history}
                />
              </section>

              {/* SECTION 4 — ENVIRONMENTAL MONITORING */}
              <section id="section-environment" className="space-y-3">
                <div className="border-b border-[#1c2842] pb-2">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                    ATMOSPHERIC & ENVIRONMENTAL TELEMETRY
                  </h3>
                </div>
                <EnvironmentalRow
                  currentData={currentData}
                  history={history}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 5 — RISK ANALYSIS */}
              <section id="section-risk">
                <RiskGauge risk={riskAnalysis} />
              </section>

              {/* SECTION 6 & 7 — SYSTEM HEALTH & ALERTS */}
              <section id="section-system-alerts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemHealthPanel
                  connectionHealth={connectionHealth}
                  lastUpdatedTime={lastUpdatedTime}
                />
                <AlertsPanel
                  alerts={alerts}
                  onAcknowledgeAlert={acknowledgeAlert}
                />
              </section>
            </>
          )}
        </div>

        {/* Footer (Always clean, inside main, below all sections) */}
        <footer className="mt-8 border-t border-[#1c2842] bg-[#0c1222] py-4 px-6 text-center text-xs font-mono text-slate-500">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-slate-300 font-bold">{PROJECT_INFO.name}</span>
            <span>•</span>
            <span className="text-amber-400">{PROJECT_INFO.hackathonId} Prototype</span>
            <span>•</span>
            <span>{DISCLAIMERS.prototypeRules}</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
