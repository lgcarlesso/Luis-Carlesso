import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Plus,
  ChevronDown,
  UserCheck,
  LogOut,
  Smartphone,
} from 'lucide-react';

interface HeaderProps {
  onOpenNewClient: () => void;
  onOpenNewProcedure: () => void;
  onOpenSyncModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewClient,
  onOpenNewProcedure,
  onOpenSyncModal,
  onOpenAuthModal,
}) => {
  const {
    currentStaff,
    staff,
    switchStaff,
    activeDevicesCount,
    isSyncing,
  } = useApp();

  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#EFE8E1] px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Minimal Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F3E5DC] text-[#6D4C41] flex items-center justify-center font-serif text-sm font-bold flex-shrink-0">
            L&A
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[#6D4C41] leading-none">
              L&A
            </h1>
            <p className="text-[11px] text-[#9E8E87] hidden sm:block mt-0.5 font-normal">
              Estética & Saúde
            </p>
          </div>
        </div>

        {/* Center: Live Sync Status Pill (Sleek Minimalist) */}
        <button
          onClick={onOpenSyncModal}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EFE8E1] hover:border-[#D4C3B8] transition-all text-xs text-[#5C5C5C] cursor-pointer"
          title="Gerenciar sincronização e dados"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <span className="text-[11px] font-medium text-[#6D4C41]">
            {isSyncing ? 'Sincronizando' : `${activeDevicesCount} ativo${activeDevicesCount > 1 ? 's' : ''}`}
          </span>
        </button>

        {/* Right: Clean Action Buttons & Staff Avatar */}
        <div className="flex items-center gap-2">
          {/* Quick Action Button: Novo Atendimento */}
          <button
            onClick={onOpenNewProcedure}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#6D4C41] border border-[#EFE8E1] hover:border-[#D4C3B8] hover:bg-[#FAF8F5] rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer"
            id="btn-quick-new-procedure"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C48B71]" />
            <span>Atendimento</span>
          </button>

          {/* Quick Action Button: Novo Cliente */}
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 bg-[#6D4C41] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#5D4037] transition-all active:scale-95 cursor-pointer shadow-2xs"
            id="btn-quick-new-client"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cliente</span>
          </button>

          {/* Minimal Staff Switcher */}
          <div className="relative ml-1">
            <button
              onClick={() => setIsStaffMenuOpen(!isStaffMenuOpen)}
              className="flex items-center gap-2 p-1 sm:pl-1 sm:pr-2.5 rounded-full bg-white border border-[#EFE8E1] hover:border-[#D4C3B8] transition-all text-xs font-medium text-[#3E3E3E] cursor-pointer"
              id="btn-staff-profile"
            >
              <div className="w-6 h-6 rounded-full bg-[#EFE8E1] text-[#6D4C41] flex items-center justify-center text-[11px] font-semibold">
                {currentStaff.name.charAt(0)}
              </div>
              <span className="hidden lg:inline text-xs font-medium text-[#5C5C5C]">
                {currentStaff.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-[#9E8E87] hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {isStaffMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-md border border-[#EFE8E1] p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsStaffMenuOpen(false)}
              >
                <div className="px-2.5 py-1.5 border-b border-[#EFE8E1] mb-1">
                  <p className="text-[10px] text-[#9E8E87] uppercase tracking-wider font-semibold">
                    Profissional
                  </p>
                  <p className="text-xs font-medium text-[#6D4C41] truncate">
                    {currentStaff.name}
                  </p>
                </div>

                <div className="space-y-0.5">
                  {staff.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => switchStaff(member.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        currentStaff.id === member.id
                          ? 'bg-[#FAF8F5] text-[#6D4C41] font-semibold'
                          : 'hover:bg-[#FAF8F5] text-[#5C5C5C]'
                      }`}
                    >
                      <span className="truncate">{member.name}</span>
                      {currentStaff.id === member.id && (
                        <UserCheck className="w-3.5 h-3.5 text-[#6D4C41]" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#EFE8E1] mt-1.5 pt-1.5 space-y-0.5">
                  <button
                    onClick={onOpenSyncModal}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-[#5C5C5C] hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#9E8E87]" />
                    <span>Conexão & Aparelhos</span>
                  </button>
                  <button
                    onClick={onOpenAuthModal}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Trocar Conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

