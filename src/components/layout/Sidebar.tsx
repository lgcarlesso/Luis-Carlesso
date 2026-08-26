import React from 'react';
import { useApp, calculateDaysAgo } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BellRing,
  Wallet,
  BarChart3,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { NavTabId } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, setSelectedClientId, clients, appointments, supabaseConfig } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter((a) => a.date === todayStr && a.status !== 'completed').length;

  // Count absent clients (+30 days since last visit)
  const absentCount = clients.filter((c) => {
    if (!c.lastProcedureDate) return true;
    return calculateDaysAgo(c.lastProcedureDate) >= 30;
  }).length;

  const navItems: { id: NavTabId; label: string; icon: any; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'calendar',
      label: 'Agenda & Horários',
      icon: Calendar,
      badge: todayAppointmentsCount > 0 ? `${todayAppointmentsCount}` : undefined,
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      badge: clients.length > 0 ? clients.length : undefined,
    },
    {
      id: 'absent',
      label: 'Clientes Sumidas',
      icon: BellRing,
      badge: absentCount > 0 ? `${absentCount}` : undefined,
    },
    {
      id: 'cash',
      label: 'Fluxo de Caixa',
      icon: Wallet,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
    },
    {
      id: 'services',
      label: 'Presets de Serviços',
      icon: Sparkles,
    },
    {
      id: 'settings',
      label: 'Nuvem Supabase',
      icon: Cloud,
      badge: supabaseConfig.isConnected ? '🟢' : undefined,
    },
  ];

  const handleTabChange = (tabId: NavTabId) => {
    setSelectedClientId(null);
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-60 bg-white border-r border-[#EFE8E1] p-5 h-[calc(100vh-57px)] sticky top-[57px] flex-shrink-0 justify-between">
      <div className="space-y-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                type="button"
                id={`nav-${item.id}`}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FAF8F5] text-[#6D4C41] font-semibold'
                    : 'text-[#7D7D7D] hover:text-[#3E3E3E] hover:bg-[#FAF8F5]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#6D4C41]' : 'text-[#A0A0A0]'
                    }`}
                  />
                  <span className="text-xs tracking-tight">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                      isActive
                        ? 'bg-[#EFE8E1] text-[#6D4C41]'
                        : 'bg-[#FAF8F5] text-[#8C8C8C]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Status Footer */}
      <div className="px-3 py-2 text-[11px] text-[#A0A0A0] border-t border-[#EFE8E1] pt-3 flex items-center justify-between">
        <span>Lumina v2.0</span>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              supabaseConfig.isConnected ? 'bg-emerald-500 shadow-xs' : 'bg-amber-400'
            }`}
            title={supabaseConfig.isConnected ? 'Sincronizado na Nuvem Supabase' : 'Armazenamento Local'}
          />
          <span className="text-[10px] text-[#8C8C8C]">
            {supabaseConfig.isConnected ? 'Supabase' : 'Local'}
          </span>
        </div>
      </div>
    </aside>
  );
};
