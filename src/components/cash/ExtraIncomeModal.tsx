import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, TrendingUp } from 'lucide-react';

interface ExtraIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtraIncomeModal: React.FC<ExtraIncomeModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, currentStaff, staff } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Venda de Produtos Home Care');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().substring(0, 5));
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer'>('pix');
  const [description, setDescription] = useState('');
  const [createdBy, setCreatedBy] = useState(currentStaff.name);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor, informe a descrição da receita.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Informe um valor válido.');
      return;
    }

    addTransaction({
      type: 'income',
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      time,
      paymentMethod,
      description: description.trim() || undefined,
      createdBy: createdBy || currentStaff.name,
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
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#6D4C41]">
                Registrar Receita Avulsa
              </h3>
              <p className="text-[11px] text-[#8C8C8C]">
                Home care, produtos, vouchers e extras
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-600">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs text-[#5C5C5C] mb-1">
              Descrição da Receita *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Sérum Vitamina C + Protetor Solar"
              className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#5C5C5C] mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs font-semibold focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#6D4C41]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#5C5C5C] mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
              >
                <option value="Venda de Produtos Home Care">Home Care</option>
                <option value="Venda de Pacote de Procedimentos">Pacotes</option>
                <option value="Vale Presente / Voucher">Voucher</option>
                <option value="Outras Receitas">Outras</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs text-[#5C5C5C] mb-1">
                Responsável
              </label>
              <select
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#5C5C5C] mb-1">
              Observações (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais..."
              className="w-full p-2.5 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
            />
          </div>

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
              Salvar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

