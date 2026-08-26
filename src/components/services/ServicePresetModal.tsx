import React, { useState, useEffect } from 'react';
import { X, Sparkles, DollarSign, Clock, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PredefinedService } from '../../types';

interface ServicePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPreset?: PredefinedService | null;
}

export const ServicePresetModal: React.FC<ServicePresetModalProps> = ({
  isOpen,
  onClose,
  editingPreset,
}) => {
  const { addServicePreset, updateServicePreset } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Facial');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [recommendedReturnDays, setRecommendedReturnDays] = useState(30);
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8B5CF6');

  useEffect(() => {
    if (editingPreset) {
      setName(editingPreset.name);
      setCategory(editingPreset.category);
      setDefaultPrice(editingPreset.defaultPrice.toString());
      setDurationMinutes(editingPreset.durationMinutes);
      setRecommendedReturnDays(editingPreset.recommendedReturnDays || 30);
      setDescription(editingPreset.description || '');
      setColor(editingPreset.color || '#8B5CF6');
    } else {
      setName('');
      setCategory('Facial');
      setDefaultPrice('180');
      setDurationMinutes(60);
      setRecommendedReturnDays(30);
      setDescription('');
      setColor('#8B5CF6');
    }
  }, [editingPreset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPreset) {
      updateServicePreset(editingPreset.id, {
        name: name.trim(),
        category,
        defaultPrice: parseFloat(defaultPrice) || 0,
        durationMinutes: Number(durationMinutes) || 30,
        recommendedReturnDays: Number(recommendedReturnDays) || 30,
        description: description.trim(),
        color,
      });
    } else {
      addServicePreset({
        name: name.trim(),
        category,
        defaultPrice: parseFloat(defaultPrice) || 0,
        durationMinutes: Number(durationMinutes) || 30,
        recommendedReturnDays: Number(recommendedReturnDays) || 30,
        description: description.trim(),
        color,
      });
    }
    onClose();
  };

  const colorOptions = [
    { label: 'Roxo Estética', value: '#8B5CF6' },
    { label: 'Rosa Pink', value: '#EC4899' },
    { label: 'Rose Gold', value: '#F43F5E' },
    { label: 'Azul Puro', value: '#3B82F6' },
    { label: 'Esmeralda', value: '#10B981' },
    { label: 'Âmbar Dourado', value: '#F59E0B' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#EFE8E1] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE8E1] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#6D4C41]/10 text-[#6D4C41] rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2D2D2D]">
                {editingPreset ? 'Editar Preset de Procedimento' : 'Novo Preset de Procedimento'}
              </h2>
              <p className="text-xs text-[#8C8C8C]">Configurações padrão para preenchimento rápido</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-[#8C8C8C] hover:text-[#2D2D2D] hover:bg-[#EFE8E1] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#6D4C41] block mb-1">
              Nome do Procedimento *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Limpeza de Pele Profunda, Toxina Botulínica"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] rounded-2xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6D4C41] block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41] cursor-pointer"
              >
                <option value="Facial">Facial</option>
                <option value="Injetáveis">Injetáveis</option>
                <option value="Corporal">Corporal</option>
                <option value="Expressão">Expressão & Olhar</option>
                <option value="Laser / Alta Tecnologia">Laser / Alta Tecnologia</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Preço Padrão (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
                placeholder="180.00"
                className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5" />
                Duração (min)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Retorno (dias)
              </label>
              <input
                type="number"
                min="1"
                value={recommendedReturnDays}
                onChange={(e) => setRecommendedReturnDays(Number(e.target.value))}
                placeholder="30"
                className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5" />
              Descrição / Protocolo Resumido
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Higienização, extração manual, alta frequência e máscara regeneradora."
              className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41] resize-none"
            />
          </div>

          {/* Color accent */}
          <div>
            <label className="text-xs font-semibold text-[#6D4C41] block mb-1.5">Cor de Destaque</label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c.value ? 'ring-2 ring-[#6D4C41] ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#6D4C41] text-white rounded-2xl text-xs font-semibold hover:bg-[#5D4037] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingPreset ? 'Salvar Alterações no Preset' : 'Cadastrar Novo Preset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
