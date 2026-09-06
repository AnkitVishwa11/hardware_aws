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
  Waves, 
  ShieldAlert, 
  History, 
  Bell, 
  Cpu, 
  Radio, 
  X,
  ChevronRight,
  MapPin,
  BrainCircuit
} from 'lucide-react';

export type NavSectionId = 
  | 'dashboard'
  | 'map'
  | 'predictive'
  | 'displacement'
  | 'ultrasonic'
  | 'tilt'
  | 'vibration'
  | 'gas'
  | 'temp'
  | 'humidity'
  | 'moisture'
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
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'map', label: 'GIS Mine Mesh Map', icon: MapPin }
      ]
    },
    {
      groupName: 'AI & PREDICTION',
      items: [
        { id: 'predictive', label: 'AI Predictive Forecast', icon: BrainCircuit },
        { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert },
        { id: 'historical', label: 'Historical Telemetry', icon: History }
      ]
    },
    {
      groupName: 'GROUND MONITORING',
      items: [
        { id: 'displacement', label: 'Ground Displacement', icon: Ruler },
        { id: 'ultrasonic', label: 'Ultrasonic Sensors', icon: Layers }
      ]
    },
    {
      groupName: 'MOTION & STRUCTURAL',
      items: [
        { id: 'tilt', label: 'Rover Tilt / Pitch', icon: Compass },
        { id: 'vibration', label: 'Vibration Analysis', icon: Activity }
      ]
    },
    {
      groupName: 'ATMOSPHERE & MINE',
      items: [
        { id: 'gas', label: 'Gas Monitoring', icon: Wind },
        { id: 'temp', label: 'Temperature', icon: Thermometer },
        { id: 'humidity', label: 'Humidity', icon: Droplets }
      ]
    },
    {
      groupName: 'SYSTEM & FLEET',
      items: [
        { id: 'alerts', label: 'Alerts Management', icon: Bell, badge: activeAlertsCount },
        { id: 'system', label: 'Hardware & Gateway Health', icon: Cpu }
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
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Fixed 240px Sidebar */}
      <aside
        className={`fixed top-[72px] bottom-0 left-0 z-40 flex w-[240px] flex-col border-r border-[#1c2842] bg-[#0c1222] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header Close Strip */}
        <div className="flex h-10 items-center justify-between px-4 border-b border-[#1c2842] lg:hidden bg-[#070a12]">
          <span className="text-xs font-mono font-bold text-amber-400">NAVIGATION MENU</span>
          <button
            onClick={onCloseMobile}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Nav List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                {group.groupName}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#10192d] text-amber-400 font-semibold border-l-2 border-amber-500 shadow-sm'
                        : 'text-slate-400 hover:bg-[#10192d]/50 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 ? (
                      <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-rose-400 border border-rose-500/30">
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="h-3 w-3 text-amber-500/60" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Hardware Status Pod */}
        <div className="border-t border-[#1c2842] bg-[#070a12] p-3 m-2 rounded-lg border border-[#1c2842] font-mono text-[11px] space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
            <span>HARDWARE LINK</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ESP32 Gateway:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Arduino UNO:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> CONNECTED
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
