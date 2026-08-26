import React, { useState, useMemo } from 'react';
import { useApp, calculateDaysAgo } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  formatDaysAgoText,
} from '../../utils/formatters';
import {
  Search,
  Plus,
  Sparkles,
  MessageCircle,
  Users,
} from 'lucide-react';

interface ClientsViewProps {
  onOpenNewClient: () => void;
  onOpenNewProcedureForClient: (clientId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onOpenNewClient,
  onOpenNewProcedureForClient,
}) => {
  const { clients, setSelectedClientId, sendWhatsAppMessage } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<'all' | 'active' | 'absent30' | 'absent60' | 'vip'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'spent' | 'name'>('recent');

  const filteredClients = useMemo(() => {
    let result = clients.map((c) => ({
      ...c,
      daysSinceLastVisit: c.lastProcedureDate ? calculateDaysAgo(c.lastProcedureDate) : 999,
    }));

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.cpf && c.cpf.includes(q)) ||
          (c.lastProcedureName && c.lastProcedureName.toLowerCase().includes(q))
      );
    }

    // Filter by tag
    if (filterTag === 'active') {
      result = result.filter((c) => c.daysSinceLastVisit < 30);
    } else if (filterTag === 'absent30') {
      result = result.filter((c) => c.daysSinceLastVisit >= 30 && c.daysSinceLastVisit < 60);
    } else if (filterTag === 'absent60') {
      result = result.filter((c) => c.daysSinceLastVisit >= 60);
    } else if (filterTag === 'vip') {
      result = result.filter((c) => Number(c.totalSpent || 0) >= 2000);
    }

    // Sorting
    if (sortBy === 'recent') {
      result.sort((a, b) => a.daysSinceLastVisit - b.daysSinceLastVisit);
    } else if (sortBy === 'spent') {
      result.sort((a, b) => Number(b.totalSpent || 0) - Number(a.totalSpent || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [clients, searchTerm, filterTag, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & New Client Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#6D4C41]">
            Clientes
          </h2>
          <p className="text-xs text-[#8C8C8C] mt-0.5 font-normal">
            {clients.length} cadastrados no total
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="flex items-center gap-1.5 bg-[#6D4C41] text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-[#5D4037] transition-all active:scale-95 self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Search & Filter Controls (Minimalist) */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE8E1] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, CPF ou telefone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-2.5 text-xs text-[#8C8C8C] hover:text-[#2D2D2D] cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-white text-[#5C5C5C] cursor-pointer"
            >
              <option value="recent">Mais Recentes</option>
              <option value="spent">Maior Faturamento (LTV)</option>
              <option value="name">Alfabética (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl text-xs overflow-x-auto max-w-full gap-1 border border-[#EFE8E1]">
          {[
            { id: 'all', label: `Todos (${clients.length})` },
            { id: 'active', label: 'Ativos (<30d)' },
            { id: 'absent30', label: 'Ausentes (+30d)' },
            { id: 'absent60', label: 'Ausentes (+60d)' },
            { id: 'vip', label: 'VIPs (+R$ 2k)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTag(tab.id as any)}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap text-xs font-medium cursor-pointer ${
                filterTag === tab.id
                  ? 'bg-white text-[#6D4C41] shadow-2xs font-semibold'
                  : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#EFE8E1] text-center space-y-3">
          <Users className="w-8 h-8 text-[#D4C3B8] mx-auto" />
          <h3 className="text-sm font-semibold text-[#6D4C41]">
            Nenhum cliente encontrado
          </h3>
          <p className="text-xs text-[#8C8C8C] max-w-sm mx-auto">
            Tente buscar com outro termo ou cadastre uma nova cliente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const daysAgo = client.daysSinceLastVisit;
            const isAbsent = daysAgo >= 30;

            return (
              <div
                key={client.id}
                className="bg-white p-5 rounded-2xl border border-[#EFE8E1] hover:border-[#D4C3B8] transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header Info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EFE8E1] text-[#6D4C41] flex items-center justify-center font-semibold text-xs flex-shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => setSelectedClientId(client.id)}
                          className="text-sm font-semibold text-[#2D2D2D] hover:text-[#6D4C41] text-left truncate block cursor-pointer"
                        >
                          {client.name}
                        </button>
                        <p className="text-[11px] text-[#8C8C8C]">
                          {client.phone || 'Sem telefone'}
                        </p>
                      </div>
                    </div>

                    {isAbsent ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-rose-50 text-rose-600 flex-shrink-0">
                        +{daysAgo}d
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0">
                        Ativa
                      </span>
                    )}
                  </div>

                  {/* Summary row */}
                  <div className="mt-3.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1] space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[#7D7D7D]">
                      <span>Último Procedimento:</span>
                      <span className="font-medium text-[#2D2D2D] truncate max-w-[130px]">
                        {client.lastProcedureName || 'Sem histórico'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#7D7D7D]">
                      <span>Data:</span>
                      <span className="text-[#2D2D2D]">
                        {client.lastProcedureDate ? formatDate(client.lastProcedureDate) : '-'} ({formatDaysAgoText(daysAgo)})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-[#EFE8E1]">
                      <span className="text-[#7D7D7D]">Total Investido:</span>
                      <span className="font-semibold text-[#6D4C41]">
                        {formatCurrency(client.totalSpent || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedClientId(client.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE8E1] text-[#3E3E3E] text-xs font-medium transition-colors text-center cursor-pointer"
                  >
                    Ver Ficha
                  </button>

                  <button
                    onClick={() => onOpenNewProcedureForClient(client.id)}
                    title="Lançar Atendimento"
                    className="p-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#6D4C41] border border-[#EFE8E1] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C48B71]" />
                  </button>

                  <button
                    onClick={() => {
                      sendWhatsAppMessage(
                        client,
                        `Olá ${client.name.split(' ')[0]}! 🌸 Aqui é da L&A Estética! Passando para ver como você está e se gostaria de agendar sua próxima sessão de cuidados. ✨`
                      );
                    }}
                    title="Conversar no WhatsApp"
                    className="w-7 h-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

