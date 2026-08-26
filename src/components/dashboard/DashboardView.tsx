import React, { useMemo, useState } from 'react';
import { useApp, calculateDaysAgo } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Users,
  Clock,
  Plus,
  Receipt,
  MessageCircle,
  BarChart2,
  LineChart as LineChartIcon,
  ChevronRight,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewClient: () => void;
  onOpenNewProcedure: () => void;
  onOpenNewExpense: () => void;
}

// Sophisticated aesthetic color palette for charts & donut segments
const CHART_COLORS = [
  '#6D4C41', // Warm Deep Roast
  '#8D5B4C', // Rich Terracotta
  '#B87333', // Copper Bronze
  '#C48B71', // Soft Rosé Clay
  '#D4A373', // Warm Desert Gold
  '#8F7A6E', // Muted Mocca
  '#A06354', // Rosewood
  '#4A3728', // Dark Espresso
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewClient,
  onOpenNewProcedure,
  onOpenNewExpense,
}) => {
  const {
    clients,
    procedures,
    transactions,
    periodFilter,
    setPeriodFilter,
    setActiveTab,
    setSelectedClientId,
    sendWhatsAppMessage,
  } = useApp();

  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Today calculations
  const todaySummary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    const todayIncome = transactions
      .filter((t) => t.date === todayStr && t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const todayProcedures = procedures.filter((p) => p.date === todayStr);
    const todayClientsServed = new Set(todayProcedures.map((p) => p.clientId)).size;

    return {
      todayIncome,
      todayProceduresCount: todayProcedures.length,
      todayClientsServed,
    };
  }, [transactions, procedures]);

  // Absent clients (+30 days pending return)
  const absentClients = useMemo(() => {
    return clients
      .map((client) => {
        const days = client.lastProcedureDate ? calculateDaysAgo(client.lastProcedureDate) : 999;
        return { ...client, daysSinceLastVisit: days };
      })
      .filter((c) => c.daysSinceLastVisit >= 30)
      .sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);
  }, [clients]);

  // General Filtered Data for KPI cards & current view
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    let txFiltered = transactions;
    let procFiltered = procedures;

    if (periodFilter === 'today') {
      txFiltered = transactions.filter((t) => t.date === todayStr);
      procFiltered = procedures.filter((p) => p.date === todayStr);
    } else if (periodFilter === 'week') {
      txFiltered = transactions.filter((t) => t.date >= startOfWeekStr);
      procFiltered = procedures.filter((p) => p.date >= startOfWeekStr);
    } else if (periodFilter === 'month') {
      txFiltered = transactions.filter((t) => t.date >= startOfMonthStr);
      procFiltered = procedures.filter((p) => p.date >= startOfMonthStr);
    }

    const totalIncome = txFiltered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = txFiltered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    const totalAppointments = procFiltered.length;
    const averageTicket = totalAppointments > 0 ? totalIncome / totalAppointments : 0;

    return {
      txFiltered,
      procFiltered,
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin,
      totalAppointments,
      averageTicket,
    };
  }, [transactions, procedures, periodFilter]);

  // Monthly Revenue & Performance Trend (Last 6 Months)
  const monthlyRevenueData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const months: { [key: string]: { month: string; faturamento: number; despesas: number; lucro: number; atendimentos: number } } = {};

    // Generate last 6 months buckets
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = {
        month: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
        faturamento: 0,
        despesas: 0,
        lucro: 0,
        atendimentos: 0,
      };
    }

    // Populate from transactions
    transactions.forEach((tx) => {
      if (!tx.date) return;
      const key = tx.date.slice(0, 7);
      if (months[key]) {
        if (tx.type === 'income') {
          months[key].faturamento += Number(tx.amount || 0);
        } else if (tx.type === 'expense') {
          months[key].despesas += Number(tx.amount || 0);
        }
      }
    });

    // Populate procedure count
    procedures.forEach((prc) => {
      if (!prc.date) return;
      const key = prc.date.slice(0, 7);
      if (months[key]) {
        months[key].atendimentos += 1;
      }
    });

    // Calculate net profits
    return Object.values(months).map((m) => ({
      ...m,
      lucro: Math.max(0, m.faturamento - m.despesas),
    }));
  }, [transactions, procedures]);

  // Most Performed Procedures (Donut Chart)
  const topServicesData = useMemo(() => {
    const counts: { [name: string]: { name: string; count: number; totalRevenue: number; category: string } } = {};

    procedures.forEach((prc) => {
      const name = prc.procedureName || 'Outro Procedimento';
      if (!counts[name]) {
        counts[name] = {
          name,
          count: 0,
          totalRevenue: 0,
          category: prc.category || 'Estética',
        };
      }
      counts[name].count += 1;
      counts[name].totalRevenue += Number(prc.price || 0);
    });

    const totalProcedures = procedures.length || 1;
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);

    // Limit to top 5 and group others if more
    if (sorted.length <= 5) {
      return sorted.map((s) => ({
        ...s,
        percentage: ((s.count / totalProcedures) * 100).toFixed(0),
      }));
    }

    const top5 = sorted.slice(0, 4);
    const others = sorted.slice(4);
    const othersCount = others.reduce((acc, curr) => acc + curr.count, 0);
    const othersRevenue = others.reduce((acc, curr) => acc + curr.totalRevenue, 0);

    return [
      ...top5.map((s) => ({
        ...s,
        percentage: ((s.count / totalProcedures) * 100).toFixed(0),
      })),
      {
        name: 'Outros Procedimentos',
        count: othersCount,
        totalRevenue: othersRevenue,
        category: 'Diversos',
        percentage: ((othersCount / totalProcedures) * 100).toFixed(0),
      },
    ];
  }, [procedures]);

  // Total procedures executed
  const totalProceduresCount = useMemo(() => procedures.length, [procedures]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Greeting & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#6D4C41]">
              Dashboard de Gestão
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3ECE6] text-[#6D4C41] border border-[#EFE8E1]">
              L&A Estética
            </span>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-0.5 font-normal flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#C48B71]" />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Minimal Period Selector */}
        <div className="flex items-center bg-[#F3ECE6]/70 p-1 rounded-full text-xs self-start sm:self-auto border border-[#EFE8E1]">
          {(['today', 'week', 'month', 'all'] as const).map((filterKey) => {
            const labels: Record<string, string> = {
              today: 'Hoje',
              week: 'Semana',
              month: 'Mês',
              all: 'Todo Período',
            };
            const isSelected = periodFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => setPeriodFilter(filterKey)}
                className={`px-3 py-1 rounded-full transition-all text-xs font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#6D4C41] shadow-2xs'
                    : 'text-[#8C8C8C] hover:text-[#3E3E3E]'
                }`}
              >
                {labels[filterKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 HIGHLIGHTED TOP METRIC CARDS REQUESTED BY USER + 1 SUMMARY CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Faturamento do Dia */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1] transition-all hover:border-[#D4C3B8] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-semibold">
                Faturamento do Dia
              </span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Hoje
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-semibold text-[#2D2D2D] tracking-tight">
              {formatCurrency(todaySummary.todayIncome)}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>
                {todaySummary.todayProceduresCount > 0
                  ? `${todaySummary.todayProceduresCount} procedimento(s) hoje`
                  : 'Nenhum lançamento hoje'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Clientes Atendidos */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1] transition-all hover:border-[#D4C3B8] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F3ECE6] text-[#6D4C41] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-semibold">
                Clientes Atendidos
              </span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#6D4C41] border border-[#EFE8E1]">
              {periodFilter === 'today' ? 'Hoje' : periodFilter === 'week' ? 'Semana' : periodFilter === 'month' ? 'Mês' : 'Geral'}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-semibold text-[#2D2D2D] tracking-tight">
              {filteredData.totalAppointments} <span className="text-sm font-normal text-[#8C8C8C]">atendimentos</span>
            </div>
            <div className="text-[11px] text-[#8C8C8C] mt-1.5 font-normal flex items-center justify-between">
              <span>{clients.length} clientes na base</span>
              <span className="font-medium text-[#6D4C41]">Ticket: {formatCurrency(filteredData.averageTicket)}</span>
            </div>
          </div>
        </div>

        {/* 3. Retornos Pendentes */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1] transition-all hover:border-[#D4C3B8] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-semibold">
                Retornos Pendentes
              </span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              +30 Dias
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-semibold text-[#6D4C41] tracking-tight">
              {absentClients.length} <span className="text-sm font-normal text-[#8C8C8C]">clientes</span>
            </div>
            <div className="text-[11px] text-amber-700 mt-1.5 flex items-center justify-between">
              <span>Aguardando reconquista</span>
              <button
                onClick={() => setActiveTab('absent')}
                className="font-semibold hover:underline flex items-center gap-0.5 text-xs text-[#6D4C41] cursor-pointer"
              >
                Ver lista <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REFINED MODERN CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. GRÁFICO DE FATURAMENTO DOS ÚLTIMOS MESES (Bar / Area Chart) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EFE8E1] p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-sm text-[#6D4C41] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#8D5B4C]" />
                  Faturamento Financeiro dos Últimos Meses
                </h3>
                <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                  Evolução mensal de receitas, custos e rentabilidade da clínica
                </p>
              </div>

              {/* Chart Mode Toggle */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#EFE8E1]">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    chartType === 'bar'
                      ? 'bg-white text-[#6D4C41] font-semibold shadow-2xs'
                      : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
                  }`}
                  title="Gráfico de Barras"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Barras</span>
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    chartType === 'area'
                      ? 'bg-white text-[#6D4C41] font-semibold shadow-2xs'
                      : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
                  }`}
                  title="Gráfico de Linha/Área"
                >
                  <LineChartIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Área</span>
                </button>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3ECE6" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={{ stroke: '#EFE8E1' }}
                      tick={{ fill: '#8C8C8C', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#8C8C8C', fontSize: 10 }}
                      tickFormatter={(val) => `R$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-xl border border-[#EFE8E1] shadow-lg text-xs space-y-1 z-50">
                              <p className="font-semibold text-[#6D4C41] border-b border-[#EFE8E1] pb-1">
                                {data.month}
                              </p>
                              <p className="text-[#2D2D2D] flex items-center justify-between gap-3">
                                <span>Faturamento:</span>
                                <strong className="text-emerald-700">{formatCurrency(data.faturamento)}</strong>
                              </p>
                              <p className="text-[#2D2D2D] flex items-center justify-between gap-3">
                                <span>Despesas:</span>
                                <span className="text-rose-600">{formatCurrency(data.despesas)}</span>
                              </p>
                              <p className="text-[#6D4C41] flex items-center justify-between gap-3 pt-1 border-t border-[#EFE8E1]">
                                <span>Lucro Líquido:</span>
                                <strong className="text-[#6D4C41]">{formatCurrency(data.lucro)}</strong>
                              </p>
                              <p className="text-[10px] text-[#8C8C8C]">
                                {data.atendimentos} atendimentos realizados
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="faturamento" name="Faturamento" fill="#6D4C41" radius={[6, 6, 0, 0]} maxBarSize={38} />
                    <Bar dataKey="despesas" name="Despesas" fill="#E8D5C8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                ) : (
                  <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6D4C41" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6D4C41" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C48B71" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#C48B71" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3ECE6" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={{ stroke: '#EFE8E1' }}
                      tick={{ fill: '#8C8C8C', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#8C8C8C', fontSize: 10 }}
                      tickFormatter={(val) => `R$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-xl border border-[#EFE8E1] shadow-lg text-xs space-y-1 z-50">
                              <p className="font-semibold text-[#6D4C41] border-b border-[#EFE8E1] pb-1">
                                {data.month}
                              </p>
                              <p className="text-[#2D2D2D] flex items-center justify-between gap-3">
                                <span>Faturamento:</span>
                                <strong className="text-emerald-700">{formatCurrency(data.faturamento)}</strong>
                              </p>
                              <p className="text-[#6D4C41] flex items-center justify-between gap-3 pt-1 border-t border-[#EFE8E1]">
                                <span>Lucro Líquido:</span>
                                <strong className="text-[#6D4C41]">{formatCurrency(data.lucro)}</strong>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="faturamento"
                      stroke="#6D4C41"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorFaturamento)"
                    />
                    <Area
                      type="monotone"
                      dataKey="lucro"
                      stroke="#C48B71"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorLucro)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Chart Legend & Stats */}
          <div className="pt-3 mt-2 border-t border-[#EFE8E1] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#6D4C41]" />
                <span className="text-[#5C5C5C]">Faturamento</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#E8D5C8]" />
                <span className="text-[#5C5C5C]">Despesas</span>
              </div>
            </div>
            <div className="text-[11px] text-[#8C8C8C]">
              Média mensal:{' '}
              <strong className="text-[#6D4C41]">
                {formatCurrency(
                  monthlyRevenueData.reduce((acc, m) => acc + m.faturamento, 0) / (monthlyRevenueData.length || 1)
                )}
              </strong>
            </div>
          </div>
        </div>

        {/* 2. GRÁFICO DE ROSCA (DONUT) - PROCEDIMENTOS MAIS REALIZADOS */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EFE8E1] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm text-[#6D4C41] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8D5B4C]" />
                  Procedimentos Mais Realizados
                </h3>
                <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                  Distribuição por popularidade e volume de atendimentos
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#FAF8F5] text-[#6D4C41] rounded-full border border-[#EFE8E1]">
                {totalProceduresCount} total
              </span>
            </div>

            {/* Donut Chart */}
            <div className="relative h-48 w-full flex items-center justify-center mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topServicesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {topServicesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="#FFF"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2.5 rounded-xl border border-[#EFE8E1] shadow-lg text-xs space-y-1 z-50">
                            <p className="font-semibold text-[#6D4C41]">{data.name}</p>
                            <p className="text-[#2D2D2D]">
                              <strong>{data.count}</strong> atendimentos ({data.percentage}%)
                            </p>
                            <p className="text-[11px] text-emerald-700 font-medium">
                              {formatCurrency(data.totalRevenue)} gerados
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-[#6D4C41] leading-none">
                  {totalProceduresCount}
                </span>
                <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider font-medium mt-0.5">
                  Sessões
                </span>
              </div>
            </div>

            {/* Donut Legend Items */}
            <div className="space-y-1.5 mt-2">
              {topServicesData.slice(0, 4).map((service, index) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="truncate text-[#2D2D2D] font-medium text-[11px]">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-[11px]">
                    <span className="text-[#8C8C8C]">{service.count}x</span>
                    <span className="font-semibold text-[#6D4C41] w-8 text-right">
                      {service.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#EFE8E1] mt-2 text-center">
            <button
              onClick={() => setActiveTab('services')}
              className="text-xs text-[#6D4C41] font-medium hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              Ver tabela completa de serviços <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <button
          onClick={onOpenNewProcedure}
          className="flex items-center gap-1.5 bg-[#6D4C41] text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-[#5D4037] transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+ Novo Atendimento</span>
        </button>

        <button
          onClick={onOpenNewClient}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#6D4C41] border border-[#EFE8E1] hover:border-[#D4C3B8] hover:bg-[#FAF8F5] rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Cadastrar Cliente</span>
        </button>

        <button
          onClick={onOpenNewExpense}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#EFE8E1] text-[#5C5C5C] rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer"
        >
          <Receipt className="w-3.5 h-3.5 text-[#8C8C8C]" />
          <span>+ Registrar Despesa</span>
        </button>
      </div>

      {/* TWO COLUMNS: RECENT TRANSACTIONS + SMART RECONQUEST LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Col 1-3: Recent Transactions */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#EFE8E1] flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EFE8E1] flex justify-between items-center">
            <h3 className="font-medium text-sm text-[#6D4C41]">
              Movimentações Recentes do Caixa
            </h3>
            <button
              onClick={() => setActiveTab('cash')}
              className="text-xs text-[#8C8C8C] hover:text-[#6D4C41] transition-colors cursor-pointer"
            >
              Ver Extrato Completo →
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {filteredData.txFiltered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A0A0A0]">
                Nenhuma movimentação registrada no período selecionado.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#FAF8F5] text-[10px] uppercase text-[#8C8C8C] border-b border-[#EFE8E1]">
                  <tr>
                    <th className="px-5 py-2.5 font-medium">Data</th>
                    <th className="px-5 py-2.5 font-medium">Descrição</th>
                    <th className="px-5 py-2.5 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-[#EFE8E1]/60">
                  {filteredData.txFiltered.slice(0, 5).map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="px-5 py-3 text-[#8C8C8C] whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-5 py-3 font-medium text-[#2D2D2D]">
                          <div className="line-clamp-1">{tx.title}</div>
                          {tx.clientName && tx.clientName !== tx.title && (
                            <div className="text-[11px] text-[#8C8C8C] font-normal">{tx.clientName}</div>
                          )}
                        </td>
                        <td className={`px-5 py-3 text-right font-medium whitespace-nowrap ${
                          isIncome ? 'text-[#2D2D2D]' : 'text-rose-500'
                        }`}>
                          {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Col 4-5: SMART RECONQUEST ALERTS (+30d) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFE8E1] flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-[#6D4C41]">
                Alerta de Reconquista
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                {absentClients.length} pendentes
              </span>
            </div>

            <div className="space-y-2">
              {absentClients.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#A0A0A0]">
                  Nenhum cliente ausente no momento.
                </div>
              ) : (
                absentClients.slice(0, 3).map((client) => {
                  const days = client.daysSinceLastVisit || 30;
                  return (
                    <div
                      key={client.id}
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1] flex items-center justify-between gap-3 hover:border-[#D4C3B8] transition-all"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <button
                          onClick={() => setSelectedClientId(client.id)}
                          className="text-xs font-medium text-[#2D2D2D] hover:text-[#6D4C41] text-left truncate block cursor-pointer"
                        >
                          {client.name}
                        </button>
                        <p className="text-[11px] text-[#8C8C8C]">
                          {days} dias sem retorno • {client.lastProcedureName || 'Procedimento'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          sendWhatsAppMessage(
                            client,
                            `Olá ${client.name.split(' ')[0]}! 🌸 Sentimos sua falta na L&A! Faz ${days} dias desde seu último atendimento. Que tal agendar sua manutenção esta semana? ✨`
                          );
                        }}
                        className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors flex-shrink-0 cursor-pointer"
                        title="Enviar WhatsApp de Reconquista"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 text-center border-t border-[#EFE8E1] mt-3">
            <button
              onClick={() => setActiveTab('absent')}
              className="text-xs font-medium text-[#6D4C41] hover:underline cursor-pointer"
            >
              Ver todos os clientes para reconquista →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
