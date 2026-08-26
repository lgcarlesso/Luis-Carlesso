import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Clock,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PredefinedService } from '../../types';
import { ServicePresetModal } from './ServicePresetModal';

export const ServicesView: React.FC = () => {
  const { services, deleteServicePreset, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<PredefinedService | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map((s) => s.category)));
    return ['all', ...cats];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesSearch =
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (srv.description && srv.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'all' || srv.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [services, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#6D4C41]">
            Catálogo & Presets de Procedimentos
          </h1>
          <p className="text-xs text-[#8C8C8C] mt-0.5">
            Cadastre os valores, durações e prazos de retorno recomendados para auto-preenchimento
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPreset(null);
            setIsModalOpen(true);
          }}
          id="btn-new-preset"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6D4C41] text-white rounded-2xl text-xs font-semibold hover:bg-[#5D4037] transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Procedimento Preset</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do procedimento ou protocolo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EFE8E1] rounded-2xl text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#6D4C41] text-white shadow-2xs'
                  : 'bg-white text-[#8C8C8C] border border-[#EFE8E1] hover:text-[#2D2D2D]'
              }`}
            >
              {cat === 'all' ? 'Todas as Categorias' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Cards Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EFE8E1] p-12 text-center shadow-2xs">
          <Sparkles className="w-12 h-12 text-[#8C8C8C] mx-auto opacity-30 mb-3" />
          <h3 className="text-base font-semibold text-[#2D2D2D]">Nenhum preset encontrado</h3>
          <p className="text-xs text-[#8C8C8C] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Tente buscar por outro termo ou limpe o filtro.'
              : 'Cadastre seus procedimentos habituais para agilizar o agendamento e o lançamento no caixa.'}
          </p>
          <button
            onClick={() => {
              setEditingPreset(null);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 bg-[#6D4C41] text-white rounded-xl text-xs font-semibold hover:bg-[#5D4037] transition-all cursor-pointer"
          >
            + Cadastrar Primeiro Preset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl border border-[#EFE8E1] p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: srv.color || '#6D4C41' }}
                    />
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF8F5] text-[#6D4C41] border border-[#EFE8E1]">
                      {srv.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingPreset(srv);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-[#8C8C8C] hover:text-[#6D4C41] hover:bg-[#FAF8F5] rounded-xl transition-all cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteServicePreset(srv.id)}
                      className="p-1.5 text-[#8C8C8C] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#2D2D2D] mt-2 line-clamp-1">{srv.name}</h3>

                {srv.description && (
                  <p className="text-xs text-[#8C8C8C] mt-1 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                )}
              </div>

              {/* Specs & Pricing */}
              <div className="mt-4 pt-3 border-t border-[#EFE8E1] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#8C8C8C] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#6D4C41]" />
                    <span>{srv.durationMinutes} min</span>
                  </div>
                  <div className="text-xs text-[#8C8C8C] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#6D4C41]" />
                    <span>Retorno: {srv.recommendedReturnDays || 30} dias</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#8C8C8C] font-medium">Valor Padrão:</span>
                  <span className="text-base font-bold text-[#6D4C41]">
                    R$ {srv.defaultPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className="w-full py-2 bg-[#FAF8F5] hover:bg-[#EFE8E1] text-[#6D4C41] rounded-xl text-xs font-semibold transition-all cursor-pointer text-center block mt-2"
                >
                  Agendar na Agenda &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preset Modal */}
      <ServicePresetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPreset(null);
        }}
        editingPreset={editingPreset}
      />
    </div>
  );
};
