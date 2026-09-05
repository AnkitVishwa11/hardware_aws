import React from 'react';
import { 
  LayoutDashboard, 
  Ruler, 
  Activity, 
  Wind, 
  ShieldAlert, 
  History, 
  Bell, 
  Cpu, 
  X,
  ExternalLink
} from 'lucide-react';
import { PROJECT_INFO } from '../../utils/constants';

export type DashboardTab = 
  | 'overview' 
  | 'ground' 
  | 'motion' 
  | 'environment' 
  | 'risk' 
  | 'historical' 
  | 'alerts' 
  | 'hardware';

export interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeAlertsCount: number;
}

interface NavItem {
  id: DashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  activeAlertsCount
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ground', label: 'Ground Monitoring', icon: Ruler },
    { id: 'motion', label: 'Motion & Vibration', icon: Activity },
    { id: 'environment', label: 'Environmental', icon: Wind },
    { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert },
    { id: 'historical', label: 'Historical Data', icon: History },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: activeAlertsCount },
    { id: 'hardware', label: 'System / API Status', icon: Cpu },
  ];

  const handleSelect = (tab: DashboardTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-industrial-950 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800 lg:hidden">
          <span className="font-bold text-sm text-white">{PROJECT_INFO.name}</span>
          <button
            onClick={onCloseMobile}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Monitoring Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-mine-gold font-semibold shadow-sm border-l-2 border-mine-gold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-mine-gold' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Hardware Architecture Badge */}
        <div className="border-t border-slate-800/80 p-3.5 m-2 rounded-lg bg-slate-900/50 border">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Hardware Stack</span>
            <span className="text-emerald-400 font-bold">UART Link</span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono space-y-0.5 leading-tight">
            <div>• Uno Node: 3× HC-SR04, MPU, Gas, DHT11</div>
            <div>• Gateway: ESP32 Wi-Fi & HTTPS</div>
            <div>• Host: AWS Cloud REST API</div>
          </div>
        </div>
      </aside>
    </>
  );
};
