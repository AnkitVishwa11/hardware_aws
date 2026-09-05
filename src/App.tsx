import React, { useState } from 'react';
import { useRoverData } from './hooks/useRoverData';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/common/Navbar';
import { Sidebar, DashboardTab } from './components/common/Sidebar';
import { LoadingState, ErrorState } from './components/common/FeedbackStates';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { GroundMonitoringTab } from './components/dashboard/GroundMonitoringTab';
import { MotionVibrationTab } from './components/dashboard/MotionVibrationTab';
import { EnvironmentalTab } from './components/dashboard/EnvironmentalTab';
import { RiskAnalysisTab } from './components/dashboard/RiskAnalysisTab';
import { HistoricalDataTab } from './components/dashboard/HistoricalDataTab';
import { AlertsTab } from './components/dashboard/AlertsTab';
import { HardwareStatusTab } from './components/dashboard/HardwareStatusTab';
import { PROJECT_INFO, DISCLAIMERS } from './utils/constants';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { theme, toggleTheme } = useTheme();

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
    apiError,
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

  return (
    <div className="min-h-screen flex flex-col bg-industrial-950 text-slate-100 tech-grid-bg">
      {/* Top Industrial Navbar */}
      <Navbar
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
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        demoScenario={demoScenario}
        onSelectDemoScenario={setDemoScenario}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          activeAlertsCount={activeAlertsCount}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {isLoading && !currentData ? (
            <LoadingState message="Connecting to AWS IoT REST API..." />
          ) : apiError && mode === 'LIVE' && !currentData ? (
            <ErrorState
              title="AWS REST API Gateway Unreachable"
              message={`Unable to connect to ${import.meta.env.VITE_API_BASE_URL || 'AWS REST API'}: ${apiError}. You can switch to DEMO MODE to evaluate the dashboard with simulated data.`}
              onRetry={refreshNow}
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  currentData={currentData}
                  history={history}
                  baseline={baseline}
                  riskAnalysis={riskAnalysis}
                  recentAlerts={alerts}
                  isDemo={mode === 'DEMO'}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'ground' && (
                <GroundMonitoringTab
                  currentData={currentData}
                  history={history}
                  baseline={baseline}
                  onResetBaseline={resetBaselineToCurrent}
                  onSetCustomBaseline={setBaseline}
                  isDemo={mode === 'DEMO'}
                />
              )}

              {activeTab === 'motion' && (
                <MotionVibrationTab
                  currentData={currentData}
                  history={history}
                  stationaryPoints={stationaryPoints}
                  isDemo={mode === 'DEMO'}
                />
              )}

              {activeTab === 'environment' && (
                <EnvironmentalTab
                  currentData={currentData}
                  history={history}
                  isDemo={mode === 'DEMO'}
                />
              )}

              {activeTab === 'risk' && (
                <RiskAnalysisTab
                  riskAnalysis={riskAnalysis}
                  currentData={currentData}
                  baseline={baseline}
                  isDemo={mode === 'DEMO'}
                />
              )}

              {activeTab === 'historical' && (
                <HistoricalDataTab
                  history={history}
                  baseline={baseline}
                  activeRoverId={roverId}
                  isDemo={mode === 'DEMO'}
                />
              )}

              {activeTab === 'alerts' && (
                <AlertsTab
                  alerts={alerts}
                  onAcknowledgeAlert={acknowledgeAlert}
                  isDemo={mode === 'DEMO'}
                />
              )}

              {activeTab === 'hardware' && (
                <HardwareStatusTab
                  currentData={currentData}
                  roverId={roverId}
                  isDemo={mode === 'DEMO'}
                />
              )}
            </>
          )}

          {/* Persistent Footer */}
          <footer className="mt-12 border-t border-slate-800/80 pt-6 pb-4 text-center text-xs font-mono text-slate-500 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-slate-400 font-bold">{PROJECT_INFO.name}</span>
              <span>•</span>
              <span className="text-mine-gold">{PROJECT_INFO.hackathonId} Prototype</span>
              <span>•</span>
              <span>{PROJECT_INFO.subtitle}</span>
            </div>
            <p className="text-[11px] text-slate-600">
              {DISCLAIMERS.prototypeRules} All ground displacement metrics represent relative acoustic echoes.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
