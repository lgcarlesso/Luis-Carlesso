import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Sparkles, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Appointment, PredefinedService } from '../../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
  editingAppointment?: Appointment | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialTime,
  editingAppointment,
}) => {
  const { clients, services, staff, currentStaff, addAppointment, updateAppointment, addClient } = useApp();

  const [clientId, setClientId] = useState<string>('');
  const [isCreatingNewClient, setIsCreatingNewClient] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [procedureName, setProcedureName] = useState<string>('');
  const [category, setCategory] = useState<string>('Facial');
  const [price, setPrice] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>(initialTime || '10:00');
  const [professionalId, setProfessionalId] = useState<string>(currentStaff.id);
  const [status, setStatus] = useState<Appointment['status']>('scheduled');
  const [notes, setNotes] = useState<string>('');

  // Reset or populate form
  useEffect(() => {
    if (editingAppointment) {
      setClientId(editingAppointment.clientId);
      setSelectedServiceId(editingAppointment.serviceId || '');
      setProcedureName(editingAppointment.procedureName);
      setCategory(editingAppointment.category);
      setPrice(editingAppointment.price.toString());
      setDurationMinutes(editingAppointment.durationMinutes);
      setDate(editingAppointment.date);
      setStartTime(editingAppointment.startTime);
      setProfessionalId(editingAppointment.professionalId);
      setStatus(editingAppointment.status);
      setNotes(editingAppointment.notes || '');
      setIsCreatingNewClient(false);
    } else {
      setClientId(clients.length > 0 ? clients[0].id : '');
      setSelectedServiceId('');
      setProcedureName(services.length > 0 ? services[0].name : '');
      setCategory(services.length > 0 ? services[0].category : 'Facial');
      setPrice(services.length > 0 ? services[0].defaultPrice.toString() : '150');
      setDurationMinutes(services.length > 0 ? services[0].durationMinutes : 60);
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setStartTime(initialTime || '10:00');
      setProfessionalId(currentStaff.id);
      setStatus('scheduled');
      setNotes('');
      setIsCreatingNewClient(clients.length === 0);
    }
  }, [editingAppointment, initialDate, initialTime, isOpen, clients, services, currentStaff]);

  // Handle Preset selection
  const handleSelectPreset = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const srv = services.find((s) => s.id === serviceId);
    if (srv) {
      setProcedureName(srv.name);
      setCategory(srv.category);
      setPrice(srv.defaultPrice.toString());
      setDurationMinutes(srv.durationMinutes);
    }
  };

  // Compute end time based on start time and duration
  const calculateEndTime = (start: string, durationMin: number): string => {
    const [h, m] = start.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMin;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetClientId = clientId;
    let targetClientName = '';
    let targetClientPhone = '';

    if (isCreatingNewClient) {
      if (!newClientName.trim()) return;
      const { client: created } = addClient({
        name: newClientName.trim(),
        cpf: '',
        birthDate: '',
        phone: newClientPhone.trim() || '(11) 99999-9999',
      });
      targetClientId = created.id;
      targetClientName = created.name;
      targetClientPhone = created.phone;
    } else {
      const existing = clients.find((c) => c.id === clientId);
      if (existing) {
        targetClientName = existing.name;
        targetClientPhone = existing.phone;
      }
    }

    const selectedStaff = staff.find((s) => s.id === professionalId) || currentStaff;
    const endTime = calculateEndTime(startTime, durationMinutes);

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, {
        clientId: targetClientId,
        clientName: targetClientName || editingAppointment.clientName,
        clientPhone: targetClientPhone || editingAppointment.clientPhone,
        serviceId: selectedServiceId || undefined,
        procedureName: procedureName.trim() || 'Atendimento Geral',
        category,
        date,
        startTime,
        endTime,
        durationMinutes,
        price: parseFloat(price) || 0,
        professionalId: selectedStaff.id,
        professionalName: selectedStaff.name,
        status,
        notes,
      });
    } else {
      addAppointment({
        clientId: targetClientId,
        clientName: targetClientName || newClientName || 'Cliente Lumina',
        clientPhone: targetClientPhone || newClientPhone,
        serviceId: selectedServiceId || undefined,
        procedureName: procedureName.trim() || 'Atendimento Geral',
        category,
        date,
        startTime,
        endTime,
        durationMinutes,
        price: parseFloat(price) || 0,
        professionalId: selectedStaff.id,
        professionalName: selectedStaff.name,
        status,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-[#EFE8E1] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="modal-appointment"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE8E1] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#6D4C41]/10 text-[#6D4C41] rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2D2D2D]">
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento na Agenda'}
              </h2>
              <p className="text-xs text-[#8C8C8C]">Vincule a cliente e o preset do procedimento</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Client Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Cliente
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNewClient(!isCreatingNewClient)}
                className="text-xs font-medium text-[#6D4C41] hover:underline cursor-pointer"
              >
                {isCreatingNewClient ? 'Selecionar Cadastrada' : '+ Cadastrar Nova Cliente'}
              </button>
            </div>

            {isCreatingNewClient || clients.length === 0 ? (
              <div className="space-y-2 p-3 bg-[#FAF8F5] rounded-2xl border border-[#EFE8E1]">
                <div>
                  <label className="text-[11px] text-[#8C8C8C] block mb-1">Nome Completo da Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mariana Silveira"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8C8C8C] block mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 98452-9901"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
                  />
                </div>
              </div>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] rounded-2xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41] cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Procedure Preset Selector */}
          <div>
            <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Preset de Procedimento
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2 max-h-32 overflow-y-auto p-1">
              {services.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <button
                    type="button"
                    key={srv.id}
                    onClick={() => handleSelectPreset(srv.id)}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#6D4C41] text-white border-[#6D4C41] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#2D2D2D] border-[#EFE8E1] hover:border-[#6D4C41]/40'
                    }`}
                  >
                    <div className="font-semibold line-clamp-1">{srv.name}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#8C8C8C]'}`}>
                      R$ {srv.defaultPrice.toFixed(2)} • {srv.durationMinutes} min
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#8C8C8C] block mb-1">Nome do Procedimento *</label>
                <input
                  type="text"
                  required
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  placeholder="Ex: Limpeza de Pele"
                  className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#8C8C8C] block mb-1">Categoria</label>
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
            </div>
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5" />
                Início
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
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
          </div>

          {/* Price & Status */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150.00"
                className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Appointment['status'])}
                className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41] cursor-pointer"
              >
                <option value="scheduled">🟡 Agendado</option>
                <option value="confirmed">🟢 Confirmado</option>
                <option value="in_progress">🔵 Em Atendimento</option>
                <option value="completed">🟣 Concluído</option>
                <option value="cancelled">🔴 Cancelado</option>
              </select>
            </div>
          </div>

          {/* Professional */}
          <div>
            <label className="text-xs font-semibold text-[#6D4C41] block mb-1">Profissional Responsável</label>
            <select
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41] cursor-pointer"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roleTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-[#6D4C41] flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5" />
              Observações do Agendamento
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Primeira sessão, cliente prefere sala climatizada..."
              className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EFE8E1] text-xs text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41] resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#6D4C41] text-white rounded-2xl text-xs font-semibold hover:bg-[#5D4037] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingAppointment ? 'Salvar Alterações do Agendamento' : 'Confirmar e Agendar Horário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
