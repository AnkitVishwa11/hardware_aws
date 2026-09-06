import React from 'react';
import { 
  LayoutDashboard, 
  Ruler, 
  Layers, 
  Compass, 
  Activity, 
  Wind, 
  Thermometer, 
  Droplets, 
  ShieldAlert, 
  History, 
  Bell, 
  Cpu, 
  X,
  ChevronRight,
  MapPin,
  BrainCircuit,
  Boxes,
  Users
} from 'lucide-react';

export type NavSectionId = 
  | 'dashboard'
  | 'ground-monitoring'
  | 'gis-map'
  | 'fleet-swarm'
  | 'digital-twin'
  | 'ai-forecast'
  | 'motion'
  | 'environment'
  | 'risk'
  | 'historical'
  | 'alerts'
  | 'system';

export interface SidebarProps {
  activeSection: NavSectionId;
  onSelectSection: (section: NavSectionId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeAlertsCount: number;
}

interface NavGroup {
  groupName: string;
  items: {
    id: NavSectionId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile,
  activeAlertsCount
}) => {
  const navGroups: NavGroup[] = [
    {
      groupName: 'OVERVIEW & GEOSPATIAL',
      items: [
        { id: 'dashboard', label: 'Executive KPIs', icon: LayoutDashboard },
        { id: 'ground-monitoring', label: 'Ground Profile & Sag', icon: Ruler },
        { id: 'gis-map', label: 'GIS Mine Mesh Map', icon: MapPin },
        { id: 'fleet-swarm', label: 'Fleet Swarm & Sync', icon: Users }
      ]
    },
    {
      groupName: 'AI & PREDICTION (KILLER USPs)',
      items: [
        { id: 'digital-twin', label: '3D Digital Twin Basin', icon: Boxes },
        { id: 'ai-forecast', label: 'AI Predictive Forecast', icon: BrainCircuit },
        { id: 'historical', label: 'Historical Telemetry', icon: History }
      ]
    },
    {
      groupName: 'MOTION & ENVIRONMENT',
      items: [
        { id: 'motion', label: 'Tilt & Vibration RMS', icon: Compass },
        { id: 'environment', label: 'Gas, Temp & Humidity', icon: Wind }
      ]
    },
    {
      groupName: 'SAFETY & DIAGNOSTICS',
      items: [
        { id: 'risk', label: 'Multi-Factor Risk Score', icon: ShieldAlert },
        { id: 'alerts', label: 'Safety Hazard Alerts', icon: Bell, badge: activeAlertsCount },
        { id: 'system', label: 'Hardware & Gateway Link', icon: Cpu }
      ]
    }
  ];

  const handleSelect = (id: NavSectionId) => {
    onSelectSection(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Fixed 220px Sidebar */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 flex w-[220px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header Close Strip */}
        <div className="flex h-9 items-center justify-between px-3 border-b border-slate-200 lg:hidden bg-slate-50">
          <span className="text-[11px] font-mono font-bold text-slate-800">SECTIONS</span>
          <button
            onClick={onCloseMobile}
            className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Scrollable Nav List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-0.5">
              <div className="px-2.5 text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                {group.groupName}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 font-bold border-l-2 border-amber-500 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span className="truncate text-[11px]">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 ? (
                      <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-rose-700 border border-rose-200">
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="h-3 w-3 text-amber-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Hardware Status Pod */}
        <div className="border-t border-slate-200 bg-slate-50 p-2.5 m-2 rounded-lg border border-slate-200 font-mono text-[10px] space-y-1">
          <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
            <span>HARDWARE PIPELINE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-0.5 text-slate-700 text-[9px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Arduino Uno:</span>
              <span className="text-emerald-700 font-bold">UART ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">ESP32 Gateway:</span>
              <span className="text-emerald-700 font-bold">WI-FI UPLINK</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">AWS Docker:</span>
              <span className="text-sky-700 font-bold">POSTGRESQL</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
