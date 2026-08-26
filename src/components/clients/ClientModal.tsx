import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { maskCPF, maskPhone } from '../../utils/formatters';
import { X, User } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose }) => {
  const { addClient, services, currentStaff } = useApp();

  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [skinType, setSkinType] = useState('Mista');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');

  // Initial procedure fields
  const [hasProcedureNow, setHasProcedureNow] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [procedureName, setProcedureName] = useState('Limpeza de Pele Profunda com Fototerapia');
  const [category, setCategory] = useState('Facial');
  const [price, setPrice] = useState('180');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer'>('pix');
  const [procedureNotes, setProcedureNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

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
    if (!name.trim()) {
      setErrorMsg('Por favor, informe o Nome Completo do cliente.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor, informe o WhatsApp / Telefone do cliente.');
      return;
    }

    addClient(
      {
        name: name.trim(),
        cpf: cpf.trim(),
        birthDate: birthDate || '',
        phone: phone.trim(),
        email: email.trim(),
        skinType,
        allergies: allergies.trim(),
        notes: notes.trim(),
      },
      hasProcedureNow && procedureName && Number(price) > 0
        ? {
            procedureName,
            category,
            price: Number(price),
            paymentMethod,
            notes: procedureNotes,
          }
        : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#EFE8E1]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFE8E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EFE8E1] text-[#6D4C41] flex items-center justify-center text-xs font-semibold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#6D4C41]">
                Cadastrar Cliente
              </h3>
              <p className="text-[11px] text-[#8C8C8C]">
                Ficha cadastral e registro de atendimento
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-600">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Dados Pessoais */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#6D4C41]">
              Dados Pessoais
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#5C5C5C] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana Silveira"
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#5C5C5C] mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#5C5C5C] mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#5C5C5C] mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#5C5C5C] mb-1">
                    Tipo de Pele
                  </label>
                  <select
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Mista">Mista</option>
                    <option value="Oleosa">Oleosa</option>
                    <option value="Seca">Seca</option>
                    <option value="Sensível">Sensível</option>
                    <option value="Madura">Madura</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Procedimento Realizado */}
          <div className="space-y-3 pt-3 border-t border-[#EFE8E1]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#6D4C41]">
                Atendimento Inicial
              </h4>

              <label className="flex items-center gap-1.5 text-xs text-[#8C8C8C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasProcedureNow}
                  onChange={(e) => setHasProcedureNow(e.target.checked)}
                  className="rounded text-[#6D4C41] accent-[#6D4C41]"
                />
                <span>Lançar atendimento</span>
              </label>
            </div>

            {hasProcedureNow && (
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1] space-y-3">
                <div>
                  <label className="block text-xs text-[#5C5C5C] mb-1">
                    Serviço de Tabela
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => handleSelectPredefinedService(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-white text-[#2D2D2D]"
                  >
                    <option value="">Selecione um serviço...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - R$ {s.defaultPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#5C5C5C] mb-1">
                    Procedimento Realizado *
                  </label>
                  <input
                    type="text"
                    required={hasProcedureNow}
                    value={procedureName}
                    onChange={(e) => setProcedureName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-white text-[#2D2D2D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#5C5C5C] mb-1">
                      Valor Cobrado (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required={hasProcedureNow}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#EFE8E1] text-xs font-semibold focus:outline-none focus:border-[#C48B71] bg-white text-[#2D2D2D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#5C5C5C] mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-white text-[#2D2D2D]"
                    >
                      <option value="pix">Pix</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="debit_card">Cartão de Débito</option>
                      <option value="cash">Dinheiro</option>
                      <option value="transfer">Transferência</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Observações */}
          <div className="space-y-1.5 pt-2 border-t border-[#EFE8E1]">
            <label className="block text-xs text-[#5C5C5C]">
              Observações & Anamnese
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Histórico, sensibilidades ou observações..."
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
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

