import React, { useState, useMemo } from 'react';
import { useApp, calculateDaysAgo } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { RETURN_MESSAGE_TEMPLATES } from '../../data/initialData';
import {
  MessageCircle,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const AbsentClientsView: React.FC = () => {
  const { clients, setSelectedClientId, sendWhatsAppMessage } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | '30' | '60' | '90'>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState(RETURN_MESSAGE_TEMPLATES[0].id);
  const [customText, setCustomText] = useState(RETURN_MESSAGE_TEMPLATES[0].text);

  // Compute absent clients
  const absentClients = useMemo(() => {
    let list = clients
      .map((c) => ({
        ...c,
        daysSinceLastVisit: c.lastProcedureDate ? calculateDaysAgo(c.lastProcedureDate) : 999,
      }))
      .filter((c) => c.daysSinceLastVisit >= 30);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.lastProcedureName && c.lastProcedureName.toLowerCase().includes(q))
      );
    }

    if (tierFilter === '30') {
      list = list.filter((c) => c.daysSinceLastVisit >= 30 && c.daysSinceLastVisit < 60);
    } else if (tierFilter === '60') {
      list = list.filter((c) => c.daysSinceLastVisit >= 60 && c.daysSinceLastVisit < 90);
    } else if (tierFilter === '90') {
      list = list.filter((c) => c.daysSinceLastVisit >= 90);
    }

    return list.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);
  }, [clients, searchTerm, tierFilter]);

  const stats = useMemo(() => {
    const allAbsent = clients
      .map((c) => ({
        ...c,
        daysSinceLastVisit: c.lastProcedureDate ? calculateDaysAgo(c.lastProcedureDate) : 999,
      }))
      .filter((c) => c.daysSinceLastVisit >= 30);

    const count30 = allAbsent.filter((c) => c.daysSinceLastVisit >= 30 && c.daysSinceLastVisit < 60).length;
    const count60 = allAbsent.filter((c) => c.daysSinceLastVisit >= 60 && c.daysSinceLastVisit < 90).length;
    const count90 = allAbsent.filter((c) => c.daysSinceLastVisit >= 90).length;

    return {
      total: allAbsent.length,
      count30,
      count60,
      count90,
    };
  }, [clients]);

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = RETURN_MESSAGE_TEMPLATES.find((t) => t.id === tplId);
    if (tpl) {
      setCustomText(tpl.text);
    }
  };

  const handleSendToClient = (client: any) => {
    sendWhatsAppMessage(client, customText);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#6D4C41]">
            Alerta de Retorno
          </h2>
          <p className="text-xs text-[#8C8C8C] mt-0.5 font-normal">
            Clientes ausentes para reconquista e agendamentos de manutenção
          </p>
        </div>
      </div>

      {/* 4 Minimal Metric Filter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setTierFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            tierFilter === 'all'
              ? 'bg-[#FAF8F5] border-[#6D4C41] text-[#6D4C41]'
              : 'bg-white border-[#EFE8E1] text-[#5C5C5C] hover:border-[#D4C3B8]'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-medium">Total Ausentes</div>
          <div className="text-xl font-semibold text-[#2D2D2D] mt-1">
            {stats.total} <span className="text-xs font-normal text-[#8C8C8C]">clientes</span>
          </div>
        </button>

        <button
          onClick={() => setTierFilter('30')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            tierFilter === '30'
              ? 'bg-[#FAF8F5] border-[#6D4C41] text-[#6D4C41]'
              : 'bg-white border-[#EFE8E1] text-[#5C5C5C] hover:border-[#D4C3B8]'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-medium">Retoque (+30d)</div>
          <div className="text-xl font-semibold text-[#2D2D2D] mt-1">
            {stats.count30} <span className="text-xs font-normal text-[#8C8C8C]">clientes</span>
          </div>
        </button>

        <button
          onClick={() => setTierFilter('60')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            tierFilter === '60'
              ? 'bg-[#FAF8F5] border-[#6D4C41] text-[#6D4C41]'
              : 'bg-white border-[#EFE8E1] text-[#5C5C5C] hover:border-[#D4C3B8]'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-medium">Em Risco (+60d)</div>
          <div className="text-xl font-semibold text-[#2D2D2D] mt-1">
            {stats.count60} <span className="text-xs font-normal text-[#8C8C8C]">clientes</span>
          </div>
        </button>

        <button
          onClick={() => setTierFilter('90')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            tierFilter === '90'
              ? 'bg-[#FAF8F5] border-[#6D4C41] text-[#6D4C41]'
              : 'bg-white border-[#EFE8E1] text-[#5C5C5C] hover:border-[#D4C3B8]'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-medium">Inativos (+90d)</div>
          <div className="text-xl font-semibold text-[#2D2D2D] mt-1">
            {stats.count90} <span className="text-xs font-normal text-[#8C8C8C]">clientes</span>
          </div>
        </button>
      </div>

      {/* Message Template Customizer */}
      <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1] space-y-3">
        <h3 className="text-xs font-semibold text-[#6D4C41]">
          Mensagem de Reconquista para WhatsApp
        </h3>

        {/* Template choices */}
        <div className="flex flex-wrap gap-2">
          {RETURN_MESSAGE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl.id)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                selectedTemplateId === tpl.id
                  ? 'bg-[#FAF8F5] text-[#6D4C41] border border-[#6D4C41] font-medium'
                  : 'bg-white border border-[#EFE8E1] text-[#5C5C5C] hover:border-[#D4C3B8]'
              }`}
            >
              {tpl.name}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          rows={2}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="w-full p-3 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
        />
      </div>

      {/* ABSENT CLIENTS CARDS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#6D4C41]">
            Clientes Ausentes ({absentClients.length})
          </h3>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#A0A0A0] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-white text-[#2D2D2D]"
            />
          </div>
        </div>

        {absentClients.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#EFE8E1] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-[#6D4C41]">
              Nenhum cliente nesta faixa de ausência
            </h4>
            <p className="text-xs text-[#8C8C8C]">
              Sua retenção de clientes está em dia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {absentClients.map((client) => {
              const days = client.daysSinceLastVisit;

              return (
                <div
                  key={client.id}
                  className="bg-white p-5 rounded-2xl border border-[#EFE8E1] hover:border-[#D4C3B8] transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EFE8E1] text-[#6D4C41] flex items-center justify-center font-semibold text-xs flex-shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelectedClientId(client.id)}
                            className="text-xs font-semibold text-[#2D2D2D] hover:text-[#6D4C41] text-left truncate block cursor-pointer"
                          >
                            {client.name}
                          </button>
                          <p className="text-[11px] text-[#8C8C8C]">{client.phone}</p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-rose-50 text-rose-600 flex-shrink-0">
                        +{days} dias
                      </span>
                    </div>

                    {/* Details */}
                    <div className="mt-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#7D7D7D]">
                        <span>Último:</span>
                        <span className="font-medium text-[#2D2D2D] truncate max-w-[130px]">
                          {client.lastProcedureName || 'Procedimento'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#7D7D7D]">
                        <span>Data:</span>
                        <span className="text-[#2D2D2D]">
                          {formatDate(client.lastProcedureDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSendToClient(client)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Enviar WhatsApp</span>
                    </button>

                    <button
                      onClick={() => setSelectedClientId(client.id)}
                      className="px-3 py-1.5 text-xs text-[#8C8C8C] hover:text-[#2D2D2D] bg-[#FAF8F5] rounded-xl hover:bg-[#EFE8E1] transition-colors cursor-pointer"
                    >
                      Ficha
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

