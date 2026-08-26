import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
}

export const ProcedureModal: React.FC<ProcedureModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId,
}) => {
  const { clients, services, currentStaff, staff, addProcedure } = useApp();

  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [procedureName, setProcedureName] = useState('Limpeza de Pele Profunda com Fototerapia');
  const [category, setCategory] = useState('Facial');
  const [price, setPrice] = useState('180');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().substring(0, 5));
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer'>('pix');
  const [professionalId, setProfessionalId] = useState(currentStaff.id);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (preselectedClientId) {
      setClientId(preselectedClientId);
    } else if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [preselectedClientId, clients]);

  if (!isOpen) return null;

  const handleSelectPredefinedService = (srvId: string) => {
    setSelectedServiceId(srvId);
    const srv = services.find((s) => s.id === srvId);
    if (srv) {
      setProcedureName(srv.name);
      setCategory(srv.category);
      setPrice(srv.defaultPrice.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setErrorMsg('Por favor, selecione uma cliente.');
      return;
    }
    if (!procedureName.trim()) {
      setErrorMsg('Informe o nome do procedimento.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMsg('Informe um valor válido cobrado pelo procedimento.');
      return;
    }

    const client = clients.find((c) => c.id === clientId);
    const professional = staff.find((s) => s.id === professionalId) || currentStaff;

    addProcedure({
      clientId,
      clientName: client ? client.name : 'Cliente',
      procedureName: procedureName.trim(),
      category: category || 'Facial',
      date,
      time,
      price: Number(price),
      paymentMethod,
      professionalId: professional.id,
      professionalName: professional.name,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#EFE8E1]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFE8E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EFE8E1] text-[#6D4C41] flex items-center justify-center text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#6D4C41]">
                Lançar Atendimento
              </h3>
              <p className="text-[11px] text-[#8C8C8C]">
                Registro de procedimento e entrada de caixa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-[#FAF8F5] flex items-center justify-center text-[#8C8C8C] hover:text-[#2D2D2D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-600">
              {errorMsg}
            </div>
          )}

          {/* Select Client */}
          <div>
            <label className="block text-xs text-[#5C5C5C] mb-1">
              Cliente *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
            >
              <option value="">Selecione a cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Service Picker */}
          <div>
            <label className="block text-xs text-[#5C5C5C] mb-1">
              Serviço de Tabela (Opcional)
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => handleSelectPredefinedService(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
            >
              <option value="">Preenchimento rápido...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} • {formatCurrency(s.defaultPrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Procedure Name */}
          <div>
            <label className="block text-xs text-[#5C5C5C] mb-1">
              Procedimento Realizado *
            </label>
            <input
              type="text"
              required
              value={procedureName}
              onChange={(e) => setProcedureName(e.target.value)}
              placeholder="Ex: Toxina Botulínica, Limpeza de Pele..."
              className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
            />
          </div>

          {/* Price & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#5C5C5C] mb-1">
                Valor Cobrado (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs font-semibold focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#5C5C5C] mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
              >
                <option value="pix">Pix</option>
                <option value="credit_card">Cartão Crédito</option>
                <option value="debit_card">Cartão Débito</option>
                <option value="cash">Dinheiro</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>
          </div>

          {/* Date & Professional */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#5C5C5C] mb-1">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#5C5C5C] mb-1">
                Profissional
              </label>
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-[#5C5C5C] mb-1">
              Observações (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes sobre a aplicação ou resposta do cliente..."
              className="w-full p-2.5 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#EFE8E1] text-xs font-medium text-[#8C8C8C] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#6D4C41] text-white hover:bg-[#5D4037] text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              Registrar Atendimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

