import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { ClientsView } from './components/clients/ClientsView';
import { AbsentClientsView } from './components/reconquest/AbsentClientsView';
import { CashView } from './components/cash/CashView';
import { ReportsView } from './components/reports/ReportsView';
import { ServicesView } from './components/services/ServicesView';
import { ClientModal } from './components/clients/ClientModal';
import { ProcedureModal } from './components/clients/ProcedureModal';
import { ClientDetailDrawer } from './components/clients/ClientDetailDrawer';
import { ExpenseModal } from './components/cash/ExpenseModal';
import { ExtraIncomeModal } from './components/cash/ExtraIncomeModal';
import { SyncDevicesModal } from './components/sync/SyncDevicesModal';
import { AuthModal } from './components/auth/AuthModal';

const MainAppContent: React.FC = () => {
  const { activeTab, selectedClientId, setSelectedClientId } = useApp();

  // Modal states
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
  const [procedureClientId, setProcedureClientId] = useState<string | undefined>(undefined);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenProcedureForClient = (clientId: string) => {
    setProcedureClientId(clientId);
    setIsProcedureModalOpen(true);
  };

  const handleOpenGeneralProcedure = () => {
    setProcedureClientId(undefined);
    setIsProcedureModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F5] text-[#4A4A4A] selection:bg-[#F8BBD0] selection:text-[#8D6E63]">
      {/* Top Fixed Header */}
      <Header
        onOpenNewClient={() => setIsClientModalOpen(true)}
        onOpenNewProcedure={handleOpenGeneralProcedure}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Left Sidebar */}
        <Sidebar
          onOpenNewClient={() => setIsClientModalOpen(true)}
          onOpenNewProcedure={handleOpenGeneralProcedure}
          onOpenNewExpense={() => setIsExpenseModalOpen(true)}
        />

        {/* Dynamic Center Stage Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-12 max-w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewClient={() => setIsClientModalOpen(true)}
              onOpenNewProcedure={handleOpenGeneralProcedure}
              onOpenNewExpense={() => setIsExpenseModalOpen(true)}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              onOpenNewClient={() => setIsClientModalOpen(true)}
              onOpenNewProcedureForClient={handleOpenProcedureForClient}
            />
          )}

          {activeTab === 'absent' && <AbsentClientsView />}

          {activeTab === 'cash' && (
            <CashView
              onOpenNewExpense={() => setIsExpenseModalOpen(true)}
              onOpenNewIncome={() => setIsIncomeModalOpen(true)}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'services' && <ServicesView />}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#6D4C41]">
                    Conexão & Sincronização
                  </h2>
                  <p className="text-xs text-[#8C8C8C] mt-0.5 font-normal">
                    Gerencie os aparelhos sincronizados e as preferências locais do aplicativo
                  </p>
                </div>
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="px-4 py-2 bg-[#6D4C41] text-white rounded-xl text-xs font-medium hover:bg-[#5D4037] transition-all cursor-pointer shadow-2xs"
                >
                  Abrir Gerenciador
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EFE8E1] space-y-4">
                <h3 className="text-sm font-semibold text-[#2D2D2D]">Status do Sistema</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1]">
                    <div className="text-xs text-[#8C8C8C]">Modo de Armazenamento</div>
                    <div className="text-sm font-semibold text-[#6D4C41] mt-1">Local Seguro (PWA / Offline-First)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1]">
                    <div className="text-xs text-[#8C8C8C]">Aparelhos Ativos</div>
                    <div className="text-sm font-semibold text-emerald-700 mt-1">3 Conectados</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        onOpenNewClient={() => setIsClientModalOpen(true)}
        onOpenNewProcedure={handleOpenGeneralProcedure}
        onOpenNewExpense={() => setIsExpenseModalOpen(true)}
      />

      {/* MODALS & DRAWERS */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
      />

      <ProcedureModal
        isOpen={isProcedureModalOpen}
        onClose={() => {
          setIsProcedureModalOpen(false);
          setProcedureClientId(undefined);
        }}
        preselectedClientId={procedureClientId}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <ExtraIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
      />

      <ClientDetailDrawer
        clientId={selectedClientId}
        onClose={() => setSelectedClientId(null)}
        onOpenNewProcedureForClient={(cId) => {
          setSelectedClientId(null);
          handleOpenProcedureForClient(cId);
        }}
      />

      <SyncDevicesModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
