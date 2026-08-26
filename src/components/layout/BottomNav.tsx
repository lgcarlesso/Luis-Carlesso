import React from 'react';
import { useApp, calculateDaysAgo } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BellRing,
  Wallet,
  BarChart3,
} from 'lucide-react';
import { NavTabId } from '../../types';

interface BottomNavProps {
  onOpenNewClient?: () => void;
  onOpenNewProcedure?: () => void;
  onOpenNewExpense?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = () => {
  const { activeTab, setActiveTab, setSelectedClientId, clients, appointments } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter((a) => a.date === todayStr && a.status !== 'completed').length;

  const absentCount = clients.filter((c) => {
    if (!c.lastProcedureDate) return true;
    return calculateDaysAgo(c.lastProcedureDate) >= 30;
  }).length;

  const mainItems: { id: NavTabId; label: string; icon: any; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'calendar',
      label: 'Agenda',
      icon: Calendar,
      badge: todayAppointmentsCount > 0 ? `${todayAppointmentsCount}` : undefined,
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
    },
    {
      id: 'absent',
      label: 'Retorno',
      icon: BellRing,
      badge: absentCount > 0 ? `${absentCount}` : undefined,
    },
    {
      id: 'cash',
      label: 'Caixa',
      icon: Wallet,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
    },
  ];

  const handleTabChange = (tabId: NavTabId) => {
    setSelectedClientId(null);
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#EFE8E1] px-1 py-1.5 pb-safe shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              type="button"
              id={`mob-nav-${item.id}`}
              className={`flex flex-col items-center justify-center py-1 px-1.5 relative transition-all min-w-[48px] cursor-pointer touch-manipulation select-none ${
                isActive
                  ? 'text-[#6D4C41] font-semibold'
                  : 'text-[#8C8C8C] hover:text-[#3E3E3E] active:scale-95'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#FAF8F5] text-[#6D4C41]' : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110 text-[#6D4C41]' : 'text-[#8C8C8C]'
                    }`}
                  />
                </div>
                {item.badge && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] flex items-center justify-center text-[9px] font-semibold text-white bg-[#6D4C41] rounded-full px-1 shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9.5px] mt-0.5 tracking-tight ${
                  isActive ? 'text-[#6D4C41] font-semibold' : 'text-[#8C8C8C]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
