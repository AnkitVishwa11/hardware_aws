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
import { LoadingState } from './components/common/FeedbackStates';
import { DISCLAIMERS, PROJECT_INFO } from './utils/constants';
import { Ruler, ShieldAlert, Sparkles, MapPin, Boxes, BrainCircuit, Activity, ChevronUp } from 'lucide-react';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSectionId>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

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
    'digital-twin': 'section-digital-twin',
    'ai-forecast': 'section-ai-forecast',
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
        const headerOffset = 88; // 72px header + 16px clearance
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
      const scrollPosition = window.pageYOffset + 120;

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
    <div className="min-h-screen bg-slate-50 text-slate-900 scada-grid-light">
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

      {/* 3. MAIN UNIFIED SINGLE-PAGE SCROLLABLE CONTENT */}
      <main className="lg:ml-[240px] pt-[72px] min-h-screen flex flex-col justify-between">
        <div className="p-4 sm:p-6 lg:p-8 space-y-10 max-w-[1600px] w-full mx-auto">
          {isLoading && !currentData ? (
            <LoadingState message="Connecting to Rover Telemetry Uplink..." />
          ) : (
            <>
              {/* SECTION 1 — EXECUTIVE KPIS */}
              <section id="section-dashboard" className="scroll-mt-24 space-y-3">
                <CommandCenterKpis
                  currentData={currentData}
                  lastUpdatedTime={lastUpdatedTime}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 2 — 3D DIGITAL TWIN BASIN & GEOTECHNICAL MODEL */}
              <section id="section-digital-twin" className="scroll-mt-24 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-100">
                      <Boxes className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                      3D SUBSIDENCE BASIN DIGITAL TWIN & GEOTECHNICAL IMPACT
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
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
              <section id="section-gis-map" className="scroll-mt-24 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-sky-50 text-sky-600 border border-sky-100">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                      GEOSPATIAL SURFACE MESH & MINE SUBSIDENCE MAP
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
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
              <section id="section-ai-forecast" className="scroll-mt-24 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-100">
                      <BrainCircuit className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                      AI/ML SUBSIDENCE TRAJECTORY & EARLY WARNING ENGINE
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
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

              {/* SECTION 5 — GROUND SUBSIDENCE & ACOUSTIC CONVERGENCE */}
              <section id="section-ground-monitoring" className="scroll-mt-24 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-sky-50 text-sky-600 border border-sky-100">
                      <Ruler className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                      GROUND SUBSIDENCE & ACOUSTIC CONVERGENCE (HC-SR04 ARRAY)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    Baseline Roof Clearance: 22.0 cm
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Left: Ground Displacement Chart (7 cols) */}
                  <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-3 gap-2">
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                          Ground Displacement Over Time (cm)
                        </h4>
                        <p className="text-[11px] font-mono text-slate-500">
                          Superimposed Ultrasonic Sensors (S1 Port, S2 Center, S3 Starboard)
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono font-bold">
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
                      height={240}
                      yAxisLabel="Distance (cm)"
                      warningThreshold={18.0}
                      criticalThreshold={16.0}
                      warningLabel="Warning (18cm)"
                      criticalLabel="Critical Sag (16cm)"
                    />

                    <div className="mt-2 text-[10px] font-mono text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between font-medium">
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
              <section id="section-motion" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <section id="section-environment" className="scroll-mt-24 space-y-3">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                    ATMOSPHERIC & ENVIRONMENTAL TELEMETRY
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
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
              <section id="section-risk" className="scroll-mt-24">
                <RiskGauge risk={riskAnalysis} />
              </section>

              {/* SECTION 9 — HISTORICAL SENSOR DATA EXPLORER */}
              <section id="section-historical" className="scroll-mt-24 space-y-3">
                <HistoricalDataTab
                  history={history}
                  baseline={baseline}
                  activeRoverId={roverId}
                  isDemo={mode === 'DEMO'}
                />
              </section>

              {/* SECTION 10 & 11 — ACTIVE SAFETY ALERTS & SYSTEM HEALTH */}
              <section id="section-alerts" className="scroll-mt-24">
                <AlertsPanel
                  alerts={alerts}
                  onAcknowledgeAlert={acknowledgeAlert}
                />
              </section>

              <section id="section-system" className="scroll-mt-24 space-y-6">
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
            className="fixed bottom-6 right-6 z-50 rounded-full bg-slate-900 text-white p-3 shadow-lg hover:bg-slate-800 transition-all flex items-center gap-1.5 font-mono text-xs"
            title="Scroll to Top"
          >
            <ChevronUp className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Top</span>
          </button>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 bg-white py-5 px-6 text-center text-xs font-mono text-slate-500 shadow-inner">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-slate-900 font-bold">{PROJECT_INFO.name}</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">{PROJECT_INFO.hackathonId} Unified System</span>
            <span>•</span>
            <span className="text-slate-600">{DISCLAIMERS.prototypeRules}</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
