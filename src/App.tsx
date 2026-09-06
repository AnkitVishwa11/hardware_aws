import React, { useState, useEffect } from 'react';
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
import { GisMapTab } from './components/dashboard/GisMapTab';
import { PredictiveForecastTab } from './components/dashboard/PredictiveForecastTab';
import { SubsidenceBasinTab } from './components/dashboard/SubsidenceBasinTab';
import { FleetSwarmTab } from './components/dashboard/FleetSwarmTab';
import { ModelBenchmarkTab } from './components/dashboard/ModelBenchmarkTab';
import { DgmsReportModal } from './components/reports/DgmsReportModal';
import { LoadingState } from './components/common/FeedbackStates';
import { DISCLAIMERS, PROJECT_INFO } from './utils/constants';
import { Ruler, ShieldAlert, Sparkles, MapPin, Boxes, BrainCircuit, Activity, ChevronUp, Users, Scale } from 'lucide-react';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSectionId>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [isDgmsReportOpen, setIsDgmsReportOpen] = useState<boolean>(false);

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

  const sectionMap: Record<NavSectionId, string> = {
    'dashboard': 'section-dashboard',
    'ground-monitoring': 'section-ground-monitoring',
    'gis-map': 'section-gis-map',
    'fleet-swarm': 'section-fleet-swarm',
    'digital-twin': 'section-digital-twin',
    'ai-forecast': 'section-ai-forecast',
    'model-benchmark': 'section-model-benchmark',
    'motion': 'section-motion',
    'environment': 'section-environment',
    'risk': 'section-risk',
    'historical': 'section-historical',
    'alerts': 'section-alerts',
    'system': 'section-system'
  };

  const handleSelectSection = (section: NavSectionId) => {
    setActiveSection(section);
    const targetId = sectionMap[section];
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        const headerOffset = 70; // 56px header + 14px clearance
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      const sections = Object.entries(sectionMap) as [NavSectionId, string][];
      const scrollPosition = window.pageYOffset + 90;

      for (let i = sections.length - 1; i >= 0; i--) {
        const [sectionId, elementId] = sections[i];
        const el = document.getElementById(elementId);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scada-grid-light overflow-x-hidden">
      {/* 1. FIXED TOP HEADER (56px, fixed at top) */}
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
        onOpenDgmsReport={() => setIsDgmsReportOpen(true)}
      />

      {/* 2. FIXED LEFT SIDEBAR (220px, top: 56px) */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeAlertsCount={activeAlertsCount}
      />

      {/* 3. MAIN UNIFIED SINGLE-PAGE SCROLLABLE CONTENT */}
      <main className="lg:ml-[220px] pt-14 min-h-screen flex flex-col justify-between">
        <div className="p-3 sm:p-4 lg:p-5 space-y-6 max-w-[1440px] w-full mx-auto">
          {isLoading && !currentData ? (
            <LoadingState message="Connecting to Rover Telemetry Uplink..." />
          ) : (
            <>
              {/* SECTION 1 — EXECUTIVE KPIS */}
              <section id="section-dashboard" className="scroll-mt-20 space-y-2.5">
                <CommandCenterKpis
                  currentData={currentData}
                  lastUpdatedTime={lastUpdatedTime}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 2 — MULTI-ROVER SWARM FLEET & DUAL-PANEL SYNC */}
              <section id="section-fleet-swarm" className="scroll-mt-20 space-y-2.5">
                <FleetSwarmTab
                  primaryRoverData={currentData}
                  onSelectRover={setRoverId}
                  activeRoverId={roverId}
                />
              </section>

              {/* SECTION 3 — 3D DIGITAL TWIN BASIN & GEOTECHNICAL MODEL */}
              <section id="section-digital-twin" className="scroll-mt-20 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-100">
                      <Boxes className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                      3D SUBSIDENCE BASIN DIGITAL TWIN & GEOTECHNICAL IMPACT
                    </h3>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
                    Knothe-Budryk Theory • MPU6050 Slope • Radius: 56m
                  </span>
                </div>
                <SubsidenceBasinTab
                  currentData={currentData}
                  baseline={baseline}
                  roverId={roverId}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 3 — GIS SURFACE MESH & MINE MAP */}
              <section id="section-gis-map" className="scroll-mt-20 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-sky-50 text-sky-600 border border-sky-100">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                      GEOSPATIAL SURFACE MESH & MINE SUBSIDENCE MAP
                    </h3>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
                    GPS Fix Active • Panel P-4B Jharia Sector
                  </span>
                </div>
                <GisMapTab
                  currentData={currentData}
                  history={history}
                  roverId={roverId}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 4 — AI/ML SUBSIDENCE PREDICTIVE ENGINE */}
              <section id="section-ai-forecast" className="scroll-mt-20 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-100">
                      <BrainCircuit className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                      AI/ML SUBSIDENCE TRAJECTORY & EARLY WARNING ENGINE
                    </h3>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
                    Polynomial Autoregressive Model • +1h to +6h Horizon
                  </span>
                </div>
                <PredictiveForecastTab
                  history={history}
                  baseline={baseline}
                  currentData={currentData}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 5 — AI VS KNOTHE-BUDRYK SCIENTIFIC MODEL BENCHMARK */}
              <section id="section-model-benchmark" className="scroll-mt-20 space-y-2.5">
                <ModelBenchmarkTab
                  history={history}
                  baseline={baseline}
                  currentData={currentData}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 6 — GROUND SUBSIDENCE & ACOUSTIC CONVERGENCE */}
              <section id="section-ground-monitoring" className="scroll-mt-20 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-sky-50 text-sky-600 border border-sky-100">
                      <Ruler className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                      GROUND SUBSIDENCE & ACOUSTIC CONVERGENCE (HC-SR04 ARRAY)
                    </h3>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
                    Baseline Roof Clearance: 22.0 cm
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                  {/* Left: Ground Displacement Chart (7 cols) */}
                  <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 mb-2 gap-2">
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                          Ground Displacement Over Time (cm)
                        </h4>
                        <p className="text-[10px] font-mono text-slate-500">
                          Superimposed Ultrasonic Sensors (S1 Port, S2 Center, S3 Starboard)
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] font-mono font-bold">
                        <span className="text-sky-700">● S1</span>
                        <span className="text-amber-700">● S2</span>
                        <span className="text-emerald-700">● S3</span>
                      </div>
                    </div>

                    <TimeSeriesLineChart
                      data={history}
                      series={[
                        { key: 'distance_1', name: 'S1 (Left)', color: '#0284c7', unit: 'cm' },
                        { key: 'distance_2', name: 'S2 (Center)', color: '#d97706', unit: 'cm' },
                        { key: 'distance_3', name: 'S3 (Right)', color: '#059669', unit: 'cm' }
                      ]}
                      height={200}
                      yAxisLabel="Distance (cm)"
                      warningThreshold={18.0}
                      criticalThreshold={16.0}
                      warningLabel="Warning (18cm)"
                      criticalLabel="Critical Sag (16cm)"
                    />

                    <div className="mt-2 text-[10px] font-mono text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between font-medium">
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

              {/* SECTION 6 — MOTION & STRUCTURAL HEALTH */}
              <section id="section-motion" className="scroll-mt-20 grid grid-cols-1 lg:grid-cols-2 gap-4">
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

              {/* SECTION 7 — ENVIRONMENTAL TELEMETRY */}
              <section id="section-environment" className="scroll-mt-20 space-y-2.5">
                <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                    ATMOSPHERIC & ENVIRONMENTAL TELEMETRY
                  </h3>
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
                    MQ Gas Sensor • DHT11 Temperature & Humidity
                  </span>
                </div>
                <EnvironmentalRow
                  currentData={currentData}
                  history={history}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 8 — MULTI-FACTOR STRUCTURAL RISK */}
              <section id="section-risk" className="scroll-mt-20">
                <RiskGauge risk={riskAnalysis} />
              </section>

              {/* SECTION 9 — HISTORICAL SENSOR DATA EXPLORER */}
              <section id="section-historical" className="scroll-mt-20 space-y-2.5">
                <HistoricalDataTab
                  history={history}
                  baseline={baseline}
                  activeRoverId={roverId}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 10 & 11 — ACTIVE SAFETY ALERTS & SYSTEM HEALTH */}
              <section id="section-alerts" className="scroll-mt-20">
                <AlertsPanel
                  alerts={alerts}
                  onAcknowledgeAlert={acknowledgeAlert}
                />
              </section>

              <section id="section-system" className="scroll-mt-20 space-y-4">
                <SystemHealthPanel
                  connectionHealth={connectionHealth}
                  lastUpdatedTime={lastUpdatedTime}
                />
                <HardwareStatusTab
                  currentData={currentData}
                  roverId={roverId}
                  isDemo={mode === 'DEMO'}
                />
              </section>
            </>
          )}
        </div>

        {/* Scroll To Top Quick Button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-4 right-4 z-50 rounded-full bg-slate-900 text-white p-2.5 shadow-md hover:bg-slate-800 transition-all flex items-center gap-1 font-mono text-xs"
            title="Scroll to Top"
          >
            <ChevronUp className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[11px]">Top</span>
          </button>
        )}

        {/* Footer */}
        <footer className="mt-8 border-t border-slate-200 bg-white py-3.5 px-4 text-center text-xs font-mono text-slate-500 shadow-2xs">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px]">
            <span className="text-slate-900 font-bold">{PROJECT_INFO.name}</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">{PROJECT_INFO.hackathonId} Unified System</span>
            <span>•</span>
            <span className="text-slate-600">{DISCLAIMERS.prototypeRules}</span>
          </div>
        </footer>

        {/* DGMS Statutory Safety Audit Report Modal */}
        <DgmsReportModal
          isOpen={isDgmsReportOpen}
          onClose={() => setIsDgmsReportOpen(false)}
          currentData={currentData}
          history={history}
          selectedRover={roverId}
        />
      </main>
    </div>
  );
};

export default App;
