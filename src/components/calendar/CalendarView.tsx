import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  DollarSign,
  User,
  Trash2,
  Edit2,
  CalendarDays,
  ListFilter,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Appointment, AppointmentStatus } from '../../types';
import { AppointmentModal } from './AppointmentModal';
import { CompleteAppointmentModal } from './CompleteAppointmentModal';

export const CalendarView: React.FC = () => {
  const {
    appointments,
    deleteAppointment,
    updateAppointment,
    sendAppointmentWhatsApp,
    services,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'list'>('day');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [completingAppointment, setCompletingAppointment] = useState<Appointment | null>(null);
  const [quickTimeSlot, setQuickTimeSlot] = useState<string>('10:00');

  // Date helpers
  const handleDateChange = (daysOffset: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    if (viewMode === 'week') {
      current.setDate(current.getDate() + daysOffset * 7);
    } else if (viewMode === 'month') {
      current.setMonth(current.getMonth() + daysOffset);
    } else {
      current.setDate(current.getDate() + daysOffset);
    }
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Format date display
  const formattedDateTitle = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  // Appointments for the selected day
  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === selectedDate)
      .filter((a) => (statusFilter === 'all' ? true : a.status === statusFilter))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDate, statusFilter]);

  // Daily Stats
  const dailyStats = useMemo(() => {
    const allDay = appointments.filter((a) => a.date === selectedDate);
    const scheduled = allDay.filter((a) => a.status === 'scheduled').length;
    const confirmed = allDay.filter((a) => a.status === 'confirmed').length;
    const completed = allDay.filter((a) => a.status === 'completed').length;
    const totalEstimated = allDay.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    return {
      total: allDay.length,
      scheduled,
      confirmed,
      completed,
      totalEstimated,
    };
  }, [appointments, selectedDate]);

  // Timeline slots (08:00 - 20:00)
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 8; h <= 20; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  // Status badges config
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmado',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'in_progress':
        return {
          label: 'Em Atendimento',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'completed':
        return {
          label: 'Concluído',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: 'Agendado',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
    }
  };

  const handleOpenSlot = (time: string) => {
    setQuickTimeSlot(time);
    setEditingAppointment(null);
    setIsNewModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#6D4C41]">
            Agenda & Horários
          </h1>
          <p className="text-xs text-[#8C8C8C] mt-0.5 capitalize">
            {formattedDateTitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Selector */}
          <div className="bg-white border border-[#EFE8E1] rounded-2xl p-1 flex items-center shadow-2xs">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-[#6D4C41] text-white shadow-xs'
                  : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-[#6D4C41] text-white shadow-xs'
                  : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-[#6D4C41] text-white shadow-xs'
                  : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#6D4C41] text-white shadow-xs'
                  : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
              }`}
            >
              Lista
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsNewModalOpen(true);
            }}
            id="btn-new-appointment"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6D4C41] text-white rounded-2xl text-xs font-semibold hover:bg-[#5D4037] transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Date Navigator Bar & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Navigation Controls */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 border border-[#EFE8E1] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDateChange(-1)}
              className="p-2 hover:bg-[#FAF8F5] border border-[#EFE8E1] text-[#6D4C41] rounded-xl transition-all cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleSetToday}
              className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EFE8E1] text-[#6D4C41] border border-[#EFE8E1] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={() => handleDateChange(1)}
              className="p-2 hover:bg-[#FAF8F5] border border-[#EFE8E1] text-[#6D4C41] rounded-xl transition-all cursor-pointer"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#8C8C8C]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#EFE8E1] rounded-xl text-xs font-semibold text-[#2D2D2D] focus:outline-none focus:border-[#6D4C41]"
            />
          </div>
        </div>

        {/* Metric Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-3xl border border-[#EFE8E1] shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-[#8C8C8C] uppercase tracking-wider">Agendados Hoje</span>
            <div className="text-xl font-bold text-[#6D4C41] mt-1">{dailyStats.total}</div>
            <div className="text-[10px] text-emerald-600 font-medium">{dailyStats.confirmed} confirmados</div>
          </div>
          <div className="bg-white p-3.5 rounded-3xl border border-[#EFE8E1] shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-[#8C8C8C] uppercase tracking-wider">Concluídos</span>
            <div className="text-xl font-bold text-purple-700 mt-1">{dailyStats.completed}</div>
            <div className="text-[10px] text-[#8C8C8C]">atendimentos feitos</div>
          </div>
          <div className="bg-white p-3.5 rounded-3xl border border-[#EFE8E1] shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-[#8C8C8C] uppercase tracking-wider">Faturamento Previsto</span>
            <div className="text-base sm:text-lg font-bold text-[#2D2D2D] mt-1">
              R$ {dailyStats.totalEstimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-[#8C8C8C]">no dia selecionado</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-[#8C8C8C] flex items-center gap-1 font-medium mr-1">
          <ListFilter className="w-3.5 h-3.5" />
          Filtro:
        </span>
        {[
          { id: 'all', label: 'Todos' },
          { id: 'scheduled', label: '🟡 Agendados' },
          { id: 'confirmed', label: '🟢 Confirmados' },
          { id: 'completed', label: '🟣 Concluídos' },
          { id: 'cancelled', label: '🔴 Cancelados' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-[#6D4C41] text-white shadow-2xs'
                : 'bg-white text-[#8C8C8C] border border-[#EFE8E1] hover:text-[#2D2D2D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW MODE: DAY (TIMELINE) */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-3xl border border-[#EFE8E1] p-4 sm:p-6 shadow-2xs">
          <div className="space-y-3">
            {timeSlots.map((slot) => {
              const matchedApts = dayAppointments.filter((a) => a.startTime === slot);

              return (
                <div
                  key={slot}
                  className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-2 border-b border-[#FAF8F5] last:border-0 group"
                >
                  {/* Time label */}
                  <div className="w-16 sm:w-20 pt-1 flex items-center sm:justify-start gap-1 text-xs font-bold text-[#6D4C41]">
                    <Clock className="w-3.5 h-3.5 text-[#8C8C8C]" />
                    {slot}
                  </div>

                  {/* Appointments or Empty slot */}
                  <div className="flex-1">
                    {matchedApts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matchedApts.map((apt) => {
                          const badge = getStatusBadge(apt.status);

                          return (
                            <div
                              key={apt.id}
                              className={`p-4 rounded-2xl border transition-all ${
                                apt.status === 'completed'
                                  ? 'bg-purple-50/40 border-purple-200'
                                  : apt.status === 'confirmed'
                                  ? 'bg-emerald-50/40 border-emerald-200'
                                  : 'bg-[#FAF8F5] border-[#EFE8E1]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-[#2D2D2D]">{apt.clientName}</h4>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${badge.bg}`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                      {badge.label}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-[#6D4C41] font-semibold mt-1">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {apt.procedureName}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-[#2D2D2D]">
                                    R$ {apt.price.toFixed(2)}
                                  </div>
                                  <div className="text-[10px] text-[#8C8C8C]">
                                    {apt.durationMinutes} min
                                  </div>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="flex items-center gap-4 text-[11px] text-[#8C8C8C] mt-2 pt-2 border-t border-black/5">
                                <div>
                                  Horário: {apt.startTime} - {apt.endTime}
                                </div>
                                <div>Profissional: {apt.professionalName}</div>
                              </div>

                              {apt.notes && (
                                <p className="text-[11px] text-[#555] bg-white/70 p-2 rounded-xl mt-2 border border-black/5">
                                  {apt.notes}
                                </p>
                              )}

                              {/* Action Buttons */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-black/5">
                                <div className="flex items-center gap-1.5">
                                  {apt.status !== 'completed' && (
                                    <button
                                      onClick={() => setCompletingAppointment(apt)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Finalizar & Caixa
                                    </button>
                                  )}
                                  <button
                                    onClick={() => sendAppointmentWhatsApp(apt)}
                                    className="p-1.5 bg-[#FAF8F5] hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                                    title="Enviar WhatsApp de Confirmação"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">WhatsApp</span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingAppointment(apt);
                                      setIsNewModalOpen(true);
                                    }}
                                    className="p-1.5 text-[#8C8C8C] hover:text-[#6D4C41] hover:bg-[#FAF8F5] rounded-xl transition-all cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteAppointment(apt.id)}
                                    className="p-1.5 text-[#8C8C8C] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenSlot(slot)}
                        className="w-full py-2 px-3 text-left rounded-xl border border-dashed border-[#EFE8E1] hover:border-[#6D4C41]/40 hover:bg-[#FAF8F5] text-xs text-[#8C8C8C] transition-all flex items-center justify-between opacity-70 hover:opacity-100 cursor-pointer"
                      >
                        <span>Horário livre</span>
                        <span className="text-[11px] font-semibold text-[#6D4C41] flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Agendar
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE: LIST / PRÓXIMOS */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-[#EFE8E1] p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#2D2D2D]">Próximos Agendamentos</h3>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-[#8C8C8C] mx-auto opacity-40 mb-3" />
              <h4 className="text-base font-semibold text-[#2D2D2D]">Nenhum agendamento cadastrado</h4>
              <p className="text-xs text-[#8C8C8C] mt-1 max-w-sm mx-auto">
                Clique no botão abaixo para agendar a primeira cliente ou selecione um preset de procedimento.
              </p>
              <button
                onClick={() => {
                  setEditingAppointment(null);
                  setIsNewModalOpen(true);
                }}
                className="mt-4 px-4 py-2 bg-[#6D4C41] text-white rounded-xl text-xs font-semibold hover:bg-[#5D4037] transition-all cursor-pointer"
              >
                + Novo Agendamento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments
                .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                .map((apt) => {
                  const badge = getStatusBadge(apt.status);
                  return (
                    <div
                      key={apt.id}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE8E1] flex flex-col justify-between space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-[#2D2D2D]">{apt.clientName}</h4>
                          <div className="text-xs font-semibold text-[#6D4C41] mt-0.5">{apt.procedureName}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="text-xs text-[#8C8C8C] space-y-1">
                        <div>
                          📅 {apt.date.split('-').reverse().join('/')} às {apt.startTime} ({apt.durationMinutes} min)
                        </div>
                        <div>💰 R$ {apt.price.toFixed(2)} • 👤 {apt.professionalName}</div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#EFE8E1]">
                        {apt.status !== 'completed' && (
                          <button
                            onClick={() => setCompletingAppointment(apt)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all cursor-pointer"
                          >
                            Finalizar
                          </button>
                        )}
                        <button
                          onClick={() => sendAppointmentWhatsApp(apt)}
                          className="px-3 py-1 bg-white border border-[#EFE8E1] text-[#6D4C41] rounded-xl text-xs font-semibold hover:bg-[#FAF8F5] transition-all cursor-pointer flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE: WEEK OR MONTH SUMMARY */}
      {(viewMode === 'week' || viewMode === 'month') && (
        <div className="bg-white rounded-3xl border border-[#EFE8E1] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2D2D2D]">
              {viewMode === 'week' ? 'Visão Semanal de Atendimentos' : 'Visão Mensal de Atendimentos'}
            </h3>
            <span className="text-xs text-[#8C8C8C]">{appointments.length} agendamentos no total</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
              const d = new Date(selectedDate + 'T00:00:00');
              d.setDate(d.getDate() - d.getDay() + offset);
              const dateStr = d.toISOString().split('T')[0];
              const aptsForDay = appointments.filter((a) => a.date === dateStr);
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={offset}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setViewMode('day');
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#6D4C41] text-white border-[#6D4C41]'
                      : 'bg-[#FAF8F5] border-[#EFE8E1] hover:border-[#6D4C41]/40'
                  }`}
                >
                  <div className={`text-[10px] uppercase font-bold ${isSelected ? 'text-white/80' : 'text-[#8C8C8C]'}`}>
                    {d.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </div>
                  <div className="text-base font-bold my-1">{d.getDate()}</div>
                  <div
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#EFE8E1] text-[#6D4C41]'
                    }`}
                  >
                    {aptsForDay.length} atend.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <AppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingAppointment(null);
        }}
        initialDate={selectedDate}
        initialTime={quickTimeSlot}
        editingAppointment={editingAppointment}
      />

      <CompleteAppointmentModal
        isOpen={!!completingAppointment}
        onClose={() => setCompletingAppointment(null)}
        appointment={completingAppointment}
      />
    </div>
  );
};
