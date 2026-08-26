import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, TrendingDown } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, currentStaff, staff } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Insumos & Descartáveis');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().substring(0, 5));
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer'>('pix');
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');
  const [createdBy, setCreatedBy] = useState(currentStaff.name);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor, informe o Item ou Material comprado.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Informe um valor de gasto válido.');
      return;
    }

    addTransaction({
      type: 'expense',
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      time,
      paymentMethod,
      supplier: supplier.trim() || undefined,
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
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-xs font-semibold">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#6D4C41]">
                Registrar Despesa
              </h3>
              <p className="text-[11px] text-[#8C8C8C]">
                Lançamento de custos, compras e despesas
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

          {/* Item / Material */}
          <div>
            <label className="block text-xs text-[#5C5C5C] mb-1">
              Item / Descrição do Gasto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Luvas nitrílicas, Anestésicos, Aluguel..."
              className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
            />
          </div>

          {/* Value & Category */}
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
                className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs font-semibold focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-rose-600"
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
                <option value="Insumos & Descartáveis">Insumos & Descartáveis</option>
                <option value="Injetáveis & Farmácia">Injetáveis & Farmácia</option>
                <option value="Cosméticos & Home Care">Cosméticos & Home Care</option>
                <option value="Aluguel & Contas da Clínica">Aluguel & Contas</option>
                <option value="Equipamentos & Manutenção">Equipamentos</option>
                <option value="Marketing & Anúncios">Marketing</option>
                <option value="Comissões & Salários">Comissões & Salários</option>
                <option value="Outras Despesas">Outras Despesas</option>
              </select>
            </div>
          </div>

          {/* Date & Payment Method */}
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
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
              >
                <option value="pix">Pix</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="transfer">Transferência</option>
                <option value="cash">Dinheiro</option>
              </select>
            </div>
          </div>

          {/* Supplier & Staff attribution */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#5C5C5C] mb-1">
                Fornecedor (Opcional)
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Ex: Dental Cremer"
                className="w-full px-3 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
              />
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

          {/* Description */}
          <div>
            <label className="block text-xs text-[#5C5C5C] mb-1">
              Detalhes Adicionais (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anotações sobre a compra..."
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
              Salvar Despesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

