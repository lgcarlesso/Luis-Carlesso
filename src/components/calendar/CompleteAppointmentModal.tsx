import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign, CreditCard, QrCode, Banknote, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Appointment, PaymentMethod } from '../../types';

interface CompleteAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const CompleteAppointmentModal: React.FC<CompleteAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const { completeAppointmentAndBill } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [finalPrice, setFinalPrice] = useState<string>(appointment ? appointment.price.toString() : '0');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeAppointmentAndBill(
      appointment.id,
      paymentMethod,
      parseFloat(finalPrice) || appointment.price,
      notes || `Atendimento agendado concluído: ${appointment.procedureName}`
    );
    onClose();
  };

  const paymentOptions: { id: PaymentMethod; label: string; icon: any }[] = [
    { id: 'pix', label: 'Pix Instantâneo', icon: QrCode },
    { id: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard },
    { id: 'debit_card', label: 'Cartão de Débito', icon: CreditCard },
    { id: 'cash', label: 'Dinheiro em Espécie', icon: Banknote },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#EFE8E1] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE8E1] bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2D2D2D]">Finalizar Atendimento & Caixa</h2>
              <p className="text-xs text-[#8C8C8C]">Lança o procedimento no histórico e a entrada no caixa</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE8E1] space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8C8C8C] font-semibold">Cliente</span>
                <h3 className="text-sm font-bold text-[#2D2D2D]">{appointment.clientName}</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6D4C41]/10 text-[#6D4C41]">
                {appointment.category}
              </span>
            </div>
            <div className="text-xs text-[#6D4C41] font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {appointment.procedureName}
            </div>
            <div className="text-[11px] text-[#8C8C8C]">
              Horário: {appointment.startTime} às {appointment.endTime} ({appointment.durationMinutes} min)
            </div>
          </div>

          {/* Final Price */}
          <div>
            <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Valor Final a Receber (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] rounded-2xl border border-[#EFE8E1] text-sm font-semibold text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold text-[#6D4C41] block mb-1.5">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#6D4C41] text-white border-[#6D4C41] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#2D2D2D] border-[#EFE8E1] hover:border-[#6D4C41]/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-[#6D4C41] block mb-1">Observações do Fechamento</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pagamento realizado via Pix sem intercorrências"
              className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-xs font-semibold hover:bg-emerald-700 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Recebimento e Salvar no Caixa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
