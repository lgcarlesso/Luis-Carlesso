import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Printer,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calendar,
  Layers,
  Award,
  BarChart2,
  LineChart as LineChartIcon,
  CheckCircle2,
  HelpCircle,
  Download,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

type ReportPeriod = '7d' | '30d' | 'month' | 'year';

interface DailyRevenuePoint {
  date: string;
  label: string;
  faturamento: number;
  custos: number;
  lucro: number;
  atendimentos: number;
}

interface PaymentMethodStat {
  name: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

interface ServiceRankingItem {
  id: string;
  name: string;
  category: 'Injetáveis' | 'Facial' | 'Corporal' | 'Laser & Alta Tecnologia';
  count: number;
  revenue: number;
  avgTicket: number;
  percentage: number;
}

interface StaffPerformanceItem {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  initials: string;
  proceduresCount: number;
  grossRevenue: number;
  commissionRate: number; // in percentage, e.g. 35
  commissionAmount: number;
  avgTicket: number;
  topService: string;
}

// Consistent Mock Data Generator for each period filter
const MOCK_REPORT_DATA: Record<
  ReportPeriod,
  {
    periodLabel: string;
    comparisonLabel: string;
    grossRevenue: number;
    netRevenue: number;
    costs: number;
    profitMargin: number;
    avgTicket: number;
    totalAppointments: number;
    growthRate: number; // positive or negative
    previousGrossRevenue: number;
    dailyData: DailyRevenuePoint[];
    paymentMethods: PaymentMethodStat[];
    topServices: ServiceRankingItem[];
    staffPerformance: StaffPerformanceItem[];
  }
> = {
  '7d': {
    periodLabel: 'Últimos 7 dias',
    comparisonLabel: 'vs. 7 dias anteriores',
    grossRevenue: 14850.0,
    netRevenue: 11280.0,
    costs: 3570.0,
    profitMargin: 76.0,
    avgTicket: 530.35,
    totalAppointments: 28,
    growthRate: 14.8,
    previousGrossRevenue: 12935.0,
    dailyData: [
      { date: '2026-08-20', label: 'Qui (20)', faturamento: 1850, custos: 450, lucro: 1400, atendimentos: 3 },
      { date: '2026-08-21', label: 'Sex (21)', faturamento: 2600, custos: 620, lucro: 1980, atendimentos: 5 },
      { date: '2026-08-22', label: 'Sáb (22)', faturamento: 3400, custos: 790, lucro: 2610, atendimentos: 7 },
      { date: '2026-08-23', label: 'Dom (23)', faturamento: 0, custos: 0, lucro: 0, atendimentos: 0 },
      { date: '2026-08-24', label: 'Seg (24)', faturamento: 1950, custos: 480, lucro: 1470, atendimentos: 4 },
      { date: '2026-08-25', label: 'Ter (25)', faturamento: 2350, custos: 580, lucro: 1770, atendimentos: 4 },
      { date: '2026-08-26', label: 'Qua (26)', faturamento: 2700, custos: 650, lucro: 2050, atendimentos: 5 },
    ],
    paymentMethods: [
      { name: 'Pix Instantâneo', amount: 7870.5, percentage: 53, count: 15, color: '#10B981' },
      { name: 'Cartão de Crédito', amount: 5049.0, percentage: 34, count: 9, color: '#6D4C41' },
      { name: 'Cartão de Débito', amount: 1336.5, percentage: 9, count: 3, color: '#C48B71' },
      { name: 'Dinheiro em Espécie', amount: 594.0, percentage: 4, count: 1, color: '#D4A373' },
    ],
    topServices: [
      { id: '1', name: 'Aplicação de Toxina Botulínica (Botox)', category: 'Injetáveis', count: 6, revenue: 7500, avgTicket: 1250, percentage: 50.5 },
      { id: '2', name: 'Preenchimento Labial / Facial (Ácido Hialurônico)', category: 'Injetáveis', count: 3, revenue: 3300, avgTicket: 1100, percentage: 22.2 },
      { id: '3', name: 'Limpeza de Pele Profunda com LED Fototerapia', category: 'Facial', count: 8, revenue: 1440, avgTicket: 180, percentage: 9.7 },
      { id: '4', name: 'Bioestimulador de Colágeno Facial', category: 'Injetáveis', count: 1, revenue: 1400, avgTicket: 1400, percentage: 9.4 },
      { id: '5', name: 'Drenagem Linfática Modeladora Corporal', category: 'Corporal', count: 6, revenue: 960, avgTicket: 160, percentage: 6.5 },
      { id: '6', name: 'Peeling Químico Renovador', category: 'Facial', count: 4, revenue: 250, avgTicket: 62.5, percentage: 1.7 },
    ],
    staffPerformance: [
      {
        id: 'staff-1',
        name: 'Dra. Camila Vasconcelos',
        role: 'Biomédica Esteta & Responsável',
        avatarColor: '#6D4C41',
        initials: 'CV',
        proceduresCount: 10,
        grossRevenue: 12200,
        commissionRate: 40,
        commissionAmount: 4880,
        avgTicket: 1220,
        topService: 'Toxina Botulínica',
      },
      {
        id: 'staff-2',
        name: 'Juliana Paes Costa',
        role: 'Esteticista & Cosmiatra',
        avatarColor: '#8D5B4C',
        initials: 'JP',
        proceduresCount: 14,
        grossRevenue: 2400,
        commissionRate: 35,
        commissionAmount: 840,
        avgTicket: 171.4,
        topService: 'Limpeza de Pele LED',
      },
      {
        id: 'staff-3',
        name: 'Beatriz Ramos',
        role: 'Terapeuta Corporal & Massoterapeuta',
        avatarColor: '#B87333',
        initials: 'BR',
        proceduresCount: 4,
        grossRevenue: 250,
        commissionRate: 30,
        commissionAmount: 75,
        avgTicket: 62.5,
        topService: 'Drenagem Modeladora',
      },
    ],
  },

  '30d': {
    periodLabel: 'Últimos 30 dias',
    comparisonLabel: 'vs. 30 dias anteriores',
    grossRevenue: 58920.0,
    netRevenue: 44780.0,
    costs: 14140.0,
    profitMargin: 76.0,
    avgTicket: 491.0,
    totalAppointments: 120,
    growthRate: 18.5,
    previousGrossRevenue: 49720.0,
    dailyData: [
      { date: 'Semana 1', label: 'Semana 1', faturamento: 12400, custos: 2980, lucro: 9420, atendimentos: 26 },
      { date: 'Semana 2', label: 'Semana 2', faturamento: 15100, custos: 3620, lucro: 11480, atendimentos: 31 },
      { date: 'Semana 3', label: 'Semana 3', faturamento: 16570, custos: 3970, lucro: 12600, atendimentos: 35 },
      { date: 'Semana 4', label: 'Semana 4', faturamento: 14850, custos: 3570, lucro: 11280, atendimentos: 28 },
    ],
    paymentMethods: [
      { name: 'Pix Instantâneo', amount: 30638.4, percentage: 52, count: 64, color: '#10B981' },
      { name: 'Cartão de Crédito', amount: 21211.2, percentage: 36, count: 42, color: '#6D4C41' },
      { name: 'Cartão de Débito', amount: 4713.6, percentage: 8, count: 10, color: '#C48B71' },
      { name: 'Dinheiro em Espécie', amount: 2356.8, percentage: 4, count: 4, color: '#D4A373' },
    ],
    topServices: [
      { id: '1', name: 'Aplicação de Toxina Botulínica (Botox)', category: 'Injetáveis', count: 24, revenue: 30000, avgTicket: 1250, percentage: 50.9 },
      { id: '2', name: 'Bioestimulador de Colágeno Facial (Radiesse/Sculptra)', category: 'Injetáveis', count: 7, revenue: 10500, avgTicket: 1500, percentage: 17.8 },
      { id: '3', name: 'Preenchimento Labial com Ácido Hialurônico', category: 'Injetáveis', count: 8, revenue: 8800, avgTicket: 1100, percentage: 14.9 },
      { id: '4', name: 'Limpeza de Pele Profunda com Fototerapia', category: 'Facial', count: 32, revenue: 5760, avgTicket: 180, percentage: 9.8 },
      { id: '5', name: 'Drenagem Linfática Modeladora Corporal', category: 'Corporal', count: 22, revenue: 3520, avgTicket: 160, percentage: 6.0 },
      { id: '6', name: 'Microagulhamento Drug Delivery', category: 'Facial', count: 7, revenue: 340, avgTicket: 48.5, percentage: 0.6 },
    ],
    staffPerformance: [
      {
        id: 'staff-1',
        name: 'Dra. Camila Vasconcelos',
        role: 'Biomédica Esteta & Responsável',
        avatarColor: '#6D4C41',
        initials: 'CV',
        proceduresCount: 42,
        grossRevenue: 49300,
        commissionRate: 40,
        commissionAmount: 19720,
        avgTicket: 1173.8,
        topService: 'Toxina Botulínica',
      },
      {
        id: 'staff-2',
        name: 'Juliana Paes Costa',
        role: 'Esteticista & Cosmiatra',
        avatarColor: '#8D5B4C',
        initials: 'JP',
        proceduresCount: 58,
        grossRevenue: 9280,
        commissionRate: 35,
        commissionAmount: 3248,
        avgTicket: 160.0,
        topService: 'Limpeza Facial LED',
      },
      {
        id: 'staff-3',
        name: 'Beatriz Ramos',
        role: 'Terapeuta Corporal & Massoterapeuta',
        avatarColor: '#B87333',
        initials: 'BR',
        proceduresCount: 20,
        grossRevenue: 340,
        commissionRate: 30,
        commissionAmount: 102,
        avgTicket: 17.0,
        topService: 'Drenagem Linfática',
      },
    ],
  },

  month: {
    periodLabel: 'Mês Atual (Agosto)',
    comparisonLabel: 'vs. Mês Anterior (Julho)',
    grossRevenue: 52400.0,
    netRevenue: 39824.0,
    costs: 12576.0,
    profitMargin: 76.0,
    avgTicket: 503.85,
    totalAppointments: 104,
    growthRate: 12.6,
    previousGrossRevenue: 46530.0,
    dailyData: [
      { date: '01/08 - 05/08', label: '01-05 Ago', faturamento: 8900, custos: 2130, lucro: 6770, atendimentos: 18 },
      { date: '06/08 - 10/08', label: '06-10 Ago', faturamento: 11200, custos: 2680, lucro: 8520, atendimentos: 23 },
      { date: '11/08 - 15/08', label: '11-15 Ago', faturamento: 9800, custos: 2350, lucro: 7450, atendimentos: 19 },
      { date: '16/08 - 20/08', label: '16-20 Ago', faturamento: 10600, custos: 2540, lucro: 8060, atendimentos: 21 },
      { date: '21/08 - 26/08', label: '21-26 Ago', faturamento: 11900, custos: 2856, lucro: 9044, atendimentos: 23 },
    ],
    paymentMethods: [
      { name: 'Pix Instantâneo', amount: 28820.0, percentage: 55, count: 58, color: '#10B981' },
      { name: 'Cartão de Crédito', amount: 17292.0, percentage: 33, count: 34, color: '#6D4C41' },
      { name: 'Cartão de Débito', amount: 4192.0, percentage: 8, count: 8, color: '#C48B71' },
      { name: 'Dinheiro em Espécie', amount: 2096.0, percentage: 4, count: 4, color: '#D4A373' },
    ],
    topServices: [
      { id: '1', name: 'Aplicação de Toxina Botulínica (Botox)', category: 'Injetáveis', count: 21, revenue: 26250, avgTicket: 1250, percentage: 50.1 },
      { id: '2', name: 'Bioestimulador de Colágeno Facial', category: 'Injetáveis', count: 6, revenue: 9000, avgTicket: 1500, percentage: 17.2 },
      { id: '3', name: 'Preenchimento Labial / Malar', category: 'Injetáveis', count: 7, revenue: 7700, avgTicket: 1100, percentage: 14.7 },
      { id: '4', name: 'Limpeza de Pele Profunda com Fototerapia', category: 'Facial', count: 28, revenue: 5040, avgTicket: 180, percentage: 9.6 },
      { id: '5', name: 'Drenagem Linfática Corporal Modeladora', category: 'Corporal', count: 20, revenue: 3200, avgTicket: 160, percentage: 6.1 },
      { id: '6', name: 'Peeling de Diamante Renovador', category: 'Facial', count: 6, revenue: 1210, avgTicket: 201.6, percentage: 2.3 },
    ],
    staffPerformance: [
      {
        id: 'staff-1',
        name: 'Dra. Camila Vasconcelos',
        role: 'Biomédica Esteta & Responsável',
        avatarColor: '#6D4C41',
        initials: 'CV',
        proceduresCount: 37,
        grossRevenue: 42950,
        commissionRate: 40,
        commissionAmount: 17180,
        avgTicket: 1160.8,
        topService: 'Toxina Botulínica',
      },
      {
        id: 'staff-2',
        name: 'Juliana Paes Costa',
        role: 'Esteticista & Cosmiatra',
        avatarColor: '#8D5B4C',
        initials: 'JP',
        proceduresCount: 49,
        grossRevenue: 8240,
        commissionRate: 35,
        commissionAmount: 2884,
        avgTicket: 168.1,
        topService: 'Limpeza de Pele',
      },
      {
        id: 'staff-3',
        name: 'Beatriz Ramos',
        role: 'Terapeuta Corporal & Massoterapeuta',
        avatarColor: '#B87333',
        initials: 'BR',
        proceduresCount: 18,
        grossRevenue: 1210,
        commissionRate: 30,
        commissionAmount: 363,
        avgTicket: 67.2,
        topService: 'Drenagem Linfática',
      },
    ],
  },

  year: {
    periodLabel: 'Ano de 2026 (Acumulado)',
    comparisonLabel: 'vs. Ano Anterior (2025)',
    grossRevenue: 384500.0,
    netRevenue: 292220.0,
    costs: 92280.0,
    profitMargin: 76.0,
    avgTicket: 512.67,
    totalAppointments: 750,
    growthRate: 24.3,
    previousGrossRevenue: 309300.0,
    dailyData: [
      { date: 'Jan', label: 'Jan/26', faturamento: 38200, custos: 9160, lucro: 29040, atendimentos: 74 },
      { date: 'Fev', label: 'Fev/26', faturamento: 41500, custos: 9960, lucro: 31540, atendimentos: 82 },
      { date: 'Mar', label: 'Mar/26', faturamento: 46800, custos: 11230, lucro: 35570, atendimentos: 90 },
      { date: 'Abr', label: 'Abr/26', faturamento: 49100, custos: 11780, lucro: 37320, atendimentos: 96 },
      { date: 'Mai', label: 'Mai/26', faturamento: 52400, custos: 12570, lucro: 39830, atendimentos: 102 },
      { date: 'Jun', label: 'Jun/26', faturamento: 50800, custos: 12190, lucro: 38610, atendimentos: 99 },
      { date: 'Jul', label: 'Jul/26', faturamento: 53300, custos: 12790, lucro: 40510, atendimentos: 103 },
      { date: 'Ago', label: 'Ago/26', faturamento: 52400, custos: 12576, lucro: 39824, atendimentos: 104 },
    ],
    paymentMethods: [
      { name: 'Pix Instantâneo', amount: 207630.0, percentage: 54, count: 410, color: '#10B981' },
      { name: 'Cartão de Crédito', amount: 134575.0, percentage: 35, count: 260, color: '#6D4C41' },
      { name: 'Cartão de Débito', amount: 26915.0, percentage: 7, count: 52, color: '#C48B71' },
      { name: 'Dinheiro em Espécie', amount: 15380.0, percentage: 4, count: 28, color: '#D4A373' },
    ],
    topServices: [
      { id: '1', name: 'Aplicação de Toxina Botulínica (Botox)', category: 'Injetáveis', count: 155, revenue: 193750, avgTicket: 1250, percentage: 50.4 },
      { id: '2', name: 'Bioestimulador de Colágeno Facial (Radiesse/Sculptra)', category: 'Injetáveis', count: 46, revenue: 69000, avgTicket: 1500, percentage: 17.9 },
      { id: '3', name: 'Preenchimento Labial / Malar', category: 'Injetáveis', count: 52, revenue: 57200, avgTicket: 1100, percentage: 14.9 },
      { id: '4', name: 'Limpeza de Pele Profunda com Fototerapia', category: 'Facial', count: 210, revenue: 37800, avgTicket: 180, percentage: 9.8 },
      { id: '5', name: 'Drenagem Linfática Corporal Modeladora', category: 'Corporal', count: 145, revenue: 23200, avgTicket: 160, percentage: 6.0 },
      { id: '6', name: 'Tratamentos a Laser & Peelings', category: 'Laser & Alta Tecnologia', count: 25, revenue: 3550, avgTicket: 142, percentage: 1.0 },
    ],
    staffPerformance: [
      {
        id: 'staff-1',
        name: 'Dra. Camila Vasconcelos',
        role: 'Biomédica Esteta & Responsável',
        avatarColor: '#6D4C41',
        initials: 'CV',
        proceduresCount: 268,
        grossRevenue: 319950,
        commissionRate: 40,
        commissionAmount: 127980,
        avgTicket: 1193.8,
        topService: 'Toxina Botulínica',
      },
      {
        id: 'staff-2',
        name: 'Juliana Paes Costa',
        role: 'Esteticista & Cosmiatra',
        avatarColor: '#8D5B4C',
        initials: 'JP',
        proceduresCount: 355,
        grossRevenue: 61000,
        commissionRate: 35,
        commissionAmount: 21350,
        avgTicket: 171.8,
        topService: 'Limpeza Facial LED',
      },
      {
        id: 'staff-3',
        name: 'Beatriz Ramos',
        role: 'Terapeuta Corporal & Massoterapeuta',
        avatarColor: '#B87333',
        initials: 'BR',
        proceduresCount: 127,
        grossRevenue: 3550,
        commissionRate: 30,
        commissionAmount: 1065,
        avgTicket: 27.9,
        topService: 'Drenagem Modeladora',
      },
    ],
  },
};

export const ReportsView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Active dataset according to the selected dynamic period
  const activeData = useMemo(() => {
    return MOCK_REPORT_DATA[selectedPeriod];
  }, [selectedPeriod]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ------------------------------------------------------------- */}
      {/* HEADER & DYNAMIC PERIOD SELECTOR */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFE8E1] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#6D4C41]">
              Relatórios & Análise Estratégica
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3ECE6] text-[#6D4C41] border border-[#EFE8E1]">
              Inteligência Financeira
            </span>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1 font-normal flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#C48B71]" />
            Visão consolidada de receitas, ticket médio, lucratividade e comissionamento da equipe
          </p>
        </div>

        {/* Dynamic Period Selector Toolbar */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <div className="flex items-center bg-[#F3ECE6]/70 p-1 rounded-xl text-xs border border-[#EFE8E1]">
            <button
              onClick={() => setSelectedPeriod('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs font-medium cursor-pointer ${
                selectedPeriod === '7d'
                  ? 'bg-white text-[#6D4C41] shadow-2xs font-semibold'
                  : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setSelectedPeriod('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs font-medium cursor-pointer ${
                selectedPeriod === '30d'
                  ? 'bg-white text-[#6D4C41] shadow-2xs font-semibold'
                  : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
              }`}
            >
              Últimos 30 dias
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs font-medium cursor-pointer ${
                selectedPeriod === 'month'
                  ? 'bg-white text-[#6D4C41] shadow-2xs font-semibold'
                  : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
              }`}
            >
              Mês Atual
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs font-medium cursor-pointer ${
                selectedPeriod === 'year'
                  ? 'bg-white text-[#6D4C41] shadow-2xs font-semibold'
                  : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
              }`}
            >
              Ano (2026)
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="p-2 px-3 rounded-xl bg-white border border-[#EFE8E1] hover:bg-[#FAF8F5] text-[#5C5C5C] transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-2xs"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#8C8C8C]" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. VISÃO GERAL FINANCEIRA (CARDS NO TOPO) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento Bruto vs Líquido */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1] shadow-2xs transition-all hover:border-[#D4C3B8] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-semibold">
              Faturamento Bruto
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#6D4C41] flex items-center justify-center border border-[#EFE8E1]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-semibold text-[#2D2D2D] tracking-tight">
              {formatCurrency(activeData.grossRevenue)}
            </div>
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#EFE8E1]/80">
              <span className="text-[#8C8C8C]">Líquido:</span>
              <strong className="text-emerald-700 font-semibold">
                {formatCurrency(activeData.netRevenue)}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 2: Ticket Médio por Atendimento */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1] shadow-2xs transition-all hover:border-[#D4C3B8] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-semibold">
              Ticket Médio / Sessão
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#6D4C41] flex items-center justify-center border border-[#EFE8E1]">
              <Sparkles className="w-4 h-4 text-[#8D5B4C]" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-semibold text-[#6D4C41] tracking-tight">
              {formatCurrency(activeData.avgTicket)}
            </div>
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#EFE8E1]/80 text-[#8C8C8C]">
              <span>Volume atendido:</span>
              <strong className="text-[#2D2D2D] font-medium">
                {activeData.totalAppointments} atendimentos
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Comparativo Percentual com Período Anterior */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1] shadow-2xs transition-all hover:border-[#D4C3B8] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-semibold">
              Crescimento vs. Anterior
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                activeData.growthRate >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {activeData.growthRate >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </div>
          </div>

          <div className="mt-2.5">
            <div
              className={`text-2xl sm:text-3xl font-semibold tracking-tight ${
                activeData.growthRate >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {activeData.growthRate >= 0 ? `+${activeData.growthRate}%` : `${activeData.growthRate}%`}
            </div>
            <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-[#EFE8E1]/80 text-[#8C8C8C]">
              <span className="truncate">{activeData.comparisonLabel}:</span>
              <span className="font-medium text-[#5C5C5C] flex-shrink-0">
                {formatCurrency(activeData.previousGrossRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Margem Operacional Líquida */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1] shadow-2xs transition-all hover:border-[#D4C3B8] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-semibold">
              Margem de Lucro
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#6D4C41] flex items-center justify-center border border-[#EFE8E1]">
              <Percent className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-semibold text-[#2D2D2D] tracking-tight">
              {activeData.profitMargin.toFixed(1)}%
            </div>
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#EFE8E1]/80 text-[#8C8C8C]">
              <span>Custos totais:</span>
              <span className="text-rose-600 font-medium">{formatCurrency(activeData.costs)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. GRÁFICOS DE ANÁLISE (FLUXO DIÁRIO/MENSAL & DONUT FORMAS DE PGTO) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Gráfico 1: Fluxo de Faturamento no Período (Linhas / Barras) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EFE8E1] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-sm text-[#6D4C41] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#8D5B4C]" />
                  Fluxo de Faturamento & Rentabilidade
                </h3>
                <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                  Evolução temporal das receitas brutas e lucro apurado no período selecionado
                </p>
              </div>

              {/* Chart Switcher */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#EFE8E1] self-start sm:self-auto">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    chartType === 'line'
                      ? 'bg-white text-[#6D4C41] font-semibold shadow-2xs'
                      : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
                  }`}
                  title="Visualização em Linhas Suaves"
                >
                  <LineChartIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Linhas</span>
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    chartType === 'bar'
                      ? 'bg-white text-[#6D4C41] font-semibold shadow-2xs'
                      : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
                  }`}
                  title="Visualização em Barras"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Barras</span>
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-68 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <AreaChart
                    data={activeData.dailyData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorFaturamentoReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6D4C41" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#6D4C41" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorLucroReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3ECE6" />
                    <XAxis
                      dataKey="label"
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
                          const data = payload[0].payload as DailyRevenuePoint;
                          return (
                            <div className="bg-white p-3 rounded-xl border border-[#EFE8E1] shadow-lg text-xs space-y-1.5 z-50">
                              <p className="font-semibold text-[#6D4C41] border-b border-[#EFE8E1] pb-1">
                                {data.label}
                              </p>
                              <div className="flex items-center justify-between gap-4 text-[#2D2D2D]">
                                <span>Faturamento Bruto:</span>
                                <strong className="text-[#6D4C41]">{formatCurrency(data.faturamento)}</strong>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-[#2D2D2D]">
                                <span>Lucro Líquido:</span>
                                <strong className="text-emerald-700">{formatCurrency(data.lucro)}</strong>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-[#8C8C8C] text-[10px] pt-1 border-t border-[#EFE8E1]">
                                <span>Atendimentos:</span>
                                <span>{data.atendimentos} sessões</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="faturamento"
                      name="Faturamento Bruto"
                      stroke="#6D4C41"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorFaturamentoReport)"
                    />
                    <Area
                      type="monotone"
                      dataKey="lucro"
                      name="Lucro Líquido"
                      stroke="#10B981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorLucroReport)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={activeData.dailyData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3ECE6" />
                    <XAxis
                      dataKey="label"
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
                          const data = payload[0].payload as DailyRevenuePoint;
                          return (
                            <div className="bg-white p-3 rounded-xl border border-[#EFE8E1] shadow-lg text-xs space-y-1.5 z-50">
                              <p className="font-semibold text-[#6D4C41] border-b border-[#EFE8E1] pb-1">
                                {data.label}
                              </p>
                              <div className="flex items-center justify-between gap-4 text-[#2D2D2D]">
                                <span>Faturamento Bruto:</span>
                                <strong className="text-[#6D4C41]">{formatCurrency(data.faturamento)}</strong>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-rose-600">
                                <span>Custos Operacionais:</span>
                                <span>{formatCurrency(data.custos)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-emerald-700 font-semibold pt-1 border-t border-[#EFE8E1]">
                                <span>Lucro Líquido:</span>
                                <span>{formatCurrency(data.lucro)}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="faturamento" name="Faturamento" fill="#6D4C41" radius={[6, 6, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="custos" name="Custos" fill="#E8D5C8" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Footer Indicators */}
          <div className="pt-3 mt-2 border-t border-[#EFE8E1] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#6D4C41]" />
                <span className="text-[#5C5C5C]">Faturamento Bruto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#10B981]" />
                <span className="text-[#5C5C5C]">Lucro Líquido</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#E8D5C8]" />
                <span className="text-[#5C5C5C]">Custos</span>
              </div>
            </div>
            <div className="text-[11px] text-[#8C8C8C]">
              Período ativo: <strong className="text-[#6D4C41]">{activeData.periodLabel}</strong>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Divisão das Formas de Pagamento (Donut) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EFE8E1] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm text-[#6D4C41] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#8D5B4C]" />
                  Formas de Pagamento
                </h3>
                <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                  Distribuição de entradas por Pix, Cartões e Espécie
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#FAF8F5] text-emerald-700 rounded-full border border-emerald-200">
                Pix {activeData.paymentMethods[0]?.percentage}%
              </span>
            </div>

            {/* Donut Chart */}
            <div className="relative h-48 w-full flex items-center justify-center mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeData.paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {activeData.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-pm-${index}`} fill={entry.color} stroke="#FFF" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as PaymentMethodStat;
                        return (
                          <div className="bg-white p-2.5 rounded-xl border border-[#EFE8E1] shadow-lg text-xs space-y-1 z-50">
                            <p className="font-semibold text-[#6D4C41]">{data.name}</p>
                            <p className="text-[#2D2D2D] font-medium">
                              {formatCurrency(data.amount)} ({data.percentage}%)
                            </p>
                            <p className="text-[10px] text-[#8C8C8C]">
                              {data.count} transações registradas
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
                <span className="text-sm font-bold text-[#6D4C41]">
                  {formatCurrency(activeData.grossRevenue)}
                </span>
                <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider font-medium">
                  Total Pago
                </span>
              </div>
            </div>

            {/* Payment Method Breakdown List */}
            <div className="space-y-2 mt-3">
              {activeData.paymentMethods.map((pm) => (
                <div
                  key={pm.name}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1]/80 hover:border-[#D4C3B8] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pm.color }}
                    />
                    <span className="font-medium text-[#2D2D2D] text-[11px] truncate">
                      {pm.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[11px] flex-shrink-0">
                    <span className="text-[#8C8C8C]">{formatCurrency(pm.amount)}</span>
                    <span className="font-semibold text-[#6D4C41] w-9 text-right">
                      {pm.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#EFE8E1] mt-3 flex items-center justify-between text-[11px] text-[#8C8C8C]">
            <span>Menor custo de taxa: <strong className="text-emerald-700">Pix (0% taxa)</strong></span>
            <span>{activeData.totalAppointments} transações</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. DESEMPENHO E OPERAÇÃO (RANKING DE SERVIÇOS & TABELA DA EQUIPE) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* RANKING DE SERVIÇOS/PROCEDIMENTOS MAIS RENTÁVEIS */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EFE8E1] shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-[#EFE8E1] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#6D4C41] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#8D5B4C]" />
                  Ranking dos Procedimentos Mais Rentáveis
                </h3>
                <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                  Serviços ordenados por maior receita total gerada para a clínica
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#FAF8F5] text-[#6D4C41] rounded-full border border-[#EFE8E1]">
                Top {activeData.topServices.length}
              </span>
            </div>

            <div className="divide-y divide-[#EFE8E1]/60">
              {activeData.topServices.map((service, index) => {
                const position = index + 1;
                return (
                  <div
                    key={service.id}
                    className="p-4 px-5 hover:bg-[#FAF8F5]/60 transition-colors flex items-center justify-between gap-3"
                  >
                    {/* Rank Badge & Service Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          position === 1
                            ? 'bg-[#6D4C41] text-white shadow-2xs'
                            : position === 2
                            ? 'bg-[#C48B71] text-white'
                            : position === 3
                            ? 'bg-[#D4A373] text-white'
                            : 'bg-[#FAF8F5] text-[#8C8C8C] border border-[#EFE8E1]'
                        }`}
                      >
                        {position}º
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-[#2D2D2D] truncate">
                            {service.name}
                          </p>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-[#F3ECE6] text-[#6D4C41] flex-shrink-0">
                            {service.category}
                          </span>
                        </div>

                        {/* Progress Bar & Volume */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 bg-[#F3ECE6] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#6D4C41] h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${service.percentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#8C8C8C] flex-shrink-0">
                            {service.count} sessões ({service.percentage}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Revenue & Ticket */}
                    <div className="text-right flex-shrink-0 pl-2">
                      <div className="text-xs font-semibold text-[#2D2D2D]">
                        {formatCurrency(service.revenue)}
                      </div>
                      <div className="text-[10px] text-[#8C8C8C]">
                        Ticket: {formatCurrency(service.avgTicket)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 px-5 bg-[#FAF8F5] border-t border-[#EFE8E1] flex items-center justify-between text-xs text-[#8C8C8C]">
            <span>Maior faturamento por sessão: <strong className="text-[#6D4C41]">Injetáveis</strong></span>
            <span>Total: {activeData.totalAppointments} atendimentos</span>
          </div>
        </div>

        {/* TABELA DE DESEMPENHO POR PROFISSIONAL & CÁLCULO DE COMISSÃO */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EFE8E1] shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-[#EFE8E1] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#6D4C41] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#8D5B4C]" />
                  Desempenho por Profissional & Comissões
                </h3>
                <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                  Produção individual, faturamento bruto gerado e repasse calculado
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                {activeData.staffPerformance.length} profissionais
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#FAF8F5] text-[10px] uppercase text-[#8C8C8C] border-b border-[#EFE8E1]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Profissional</th>
                    <th className="px-3 py-3 font-semibold text-center">Sessões</th>
                    <th className="px-4 py-3 font-semibold text-right">Faturado</th>
                    <th className="px-4 py-3 font-semibold text-right">Comissão</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-[#EFE8E1]/60">
                  {activeData.staffPerformance.map((staff) => (
                    <tr key={staff.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      {/* Name & Role */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full text-white font-semibold text-xs flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: staff.avatarColor }}
                          >
                            {staff.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#2D2D2D] truncate">
                              {staff.name}
                            </p>
                            <p className="text-[10px] text-[#8C8C8C] truncate">
                              {staff.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Sessions */}
                      <td className="px-3 py-3.5 text-center font-medium text-[#2D2D2D]">
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE8E1] text-[11px]">
                          {staff.proceduresCount}
                        </span>
                      </td>

                      {/* Gross Revenue */}
                      <td className="px-4 py-3.5 text-right font-medium text-[#2D2D2D]">
                        <div>{formatCurrency(staff.grossRevenue)}</div>
                        <div className="text-[10px] text-[#8C8C8C]">
                          Ticket {formatCurrency(staff.avgTicket)}
                        </div>
                      </td>

                      {/* Commission & Rate */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="font-semibold text-emerald-700">
                          {formatCurrency(staff.commissionAmount)}
                        </div>
                        <div className="text-[10px] text-[#8C8C8C] font-normal">
                          Taxa de {staff.commissionRate}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commission Summary Footer */}
          <div className="p-3.5 px-5 bg-[#FAF8F5] border-t border-[#EFE8E1] flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-[#8C8C8C]">
              Total de comissões calculadas:{' '}
              <strong className="text-emerald-700 font-semibold">
                {formatCurrency(
                  activeData.staffPerformance.reduce((acc, s) => acc + s.commissionAmount, 0)
                )}
              </strong>
            </span>
            <span className="text-[11px] text-[#8C8C8C]">
              Repasse médio: {((activeData.staffPerformance.reduce((acc, s) => acc + s.commissionAmount, 0) / (activeData.grossRevenue || 1)) * 100).toFixed(1)}% do faturamento
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUMMARY BANNER / STRATEGIC INSIGHT */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#EFE8E1] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#6D4C41] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#6D4C41]">
              Resumo Executivo do Período ({activeData.periodLabel})
            </h4>
            <p className="text-[11px] text-[#5C5C5C] mt-0.5">
              O faturamento apresentou crescimento de <strong className="text-emerald-700">{activeData.growthRate >= 0 ? `+${activeData.growthRate}%` : `${activeData.growthRate}%`}</strong> em relação ao período anterior, impulsionado pela categoria de <strong className="text-[#6D4C41]">Injetáveis</strong> e adesão de <strong>{activeData.paymentMethods[0]?.percentage}%</strong> via Pix.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="self-start sm:self-auto px-4 py-2 bg-white text-[#6D4C41] border border-[#EFE8E1] hover:border-[#D4C3B8] hover:bg-[#F3ECE6]/40 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 flex-shrink-0 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Relatório</span>
        </button>
      </div>
    </div>
  );
};
