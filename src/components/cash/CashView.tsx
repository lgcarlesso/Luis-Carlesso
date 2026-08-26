import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  getPaymentMethodDetails,
} from '../../utils/formatters';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Printer,
  Trash2,
  Receipt,
} from 'lucide-react';

interface CashViewProps {
  onOpenNewExpense: () => void;
  onOpenNewIncome: () => void;
}

export const CashView: React.FC<CashViewProps> = ({
  onOpenNewExpense,
  onOpenNewIncome,
}) => {
  const { transactions, deleteTransaction, periodFilter, setPeriodFilter } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    let list = transactions;

    // Period filter
    if (periodFilter === 'today') {
      list = list.filter((t) => t.date === todayStr);
    } else if (periodFilter === 'week') {
      list = list.filter((t) => t.date >= startOfWeekStr);
    } else if (periodFilter === 'month') {
      list = list.filter((t) => t.date >= startOfMonthStr);
    }

    // Type filter
    if (typeFilter !== 'all') {
      list = list.filter((t) => t.type === typeFilter);
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.createdBy && t.createdBy.toLowerCase().includes(q)) ||
          (t.clientName && t.clientName.toLowerCase().includes(q))
      );
    }

    // Sort descending by date and time
    return list.sort((a, b) => {
      const dateA = `${a.date}T${a.time || '00:00'}`;
      const dateB = `${b.date}T${b.time || '00:00'}`;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [transactions, periodFilter, typeFilter, searchTerm]);

  // Financial summary calculations
  const totals = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const balance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, balance };
  }, [filteredTransactions]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#6D4C41]">
            Caixa & Financeiro
          </h2>
          <p className="text-xs text-[#8C8C8C] mt-0.5 font-normal">
            Controle de fluxo e movimentações
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenNewIncome}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#6D4C41] border border-[#EFE8E1] hover:border-[#D4C3B8] hover:bg-[#FAF8F5] rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Entrada</span>
          </button>

          <button
            onClick={onOpenNewExpense}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#6D4C41] text-white hover:bg-[#5D4037] rounded-full text-xs font-medium transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>+ Despesa</span>
          </button>
        </div>
      </div>

      {/* 3 SUMMARY BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1]">
          <p className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-medium">
            Entradas
          </p>
          <div className="text-2xl font-semibold text-[#2D2D2D] mt-1.5 tracking-tight">
            {formatCurrency(totals.totalIncome)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>Receitas do período</span>
          </div>
        </div>

        {/* Saídas */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1]">
          <p className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-medium">
            Saídas (Despesas)
          </p>
          <div className="text-2xl font-semibold text-[#2D2D2D] mt-1.5 tracking-tight">
            {formatCurrency(totals.totalExpense)}
          </div>
          <div className="text-[11px] text-rose-500 mt-2 flex items-center gap-1 font-medium">
            <ArrowDownRight className="w-3 h-3" />
            <span>Custos operacionais</span>
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8E1]">
          <p className="text-[11px] uppercase tracking-wider text-[#8C8C8C] font-medium">
            Saldo em Caixa
          </p>
          <div className={`text-2xl font-semibold mt-1.5 tracking-tight ${
            totals.balance >= 0 ? 'text-[#6D4C41]' : 'text-rose-500'
          }`}>
            {formatCurrency(totals.balance)}
          </div>
          <div className="text-[11px] text-[#8C8C8C] mt-2 font-normal">
            Saldo acumulado no período
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE8E1] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar lançamento..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EFE8E1] text-xs focus:outline-none focus:border-[#C48B71] bg-[#FAF8F5] text-[#2D2D2D]"
            />
          </div>

          {/* Period Filter Selector */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl text-xs gap-1 border border-[#EFE8E1]">
            {(['today', 'week', 'month', 'all'] as const).map((filterKey) => {
              const labels = { today: 'Hoje', week: 'Semana', month: 'Mês', all: 'Tudo' };
              const isSelected = periodFilter === filterKey;
              return (
                <button
                  key={filterKey}
                  onClick={() => setPeriodFilter(filterKey)}
                  className={`px-3 py-1 rounded-lg transition-all text-xs font-medium cursor-pointer ${
                    isSelected
                      ? 'bg-white text-[#6D4C41] shadow-2xs font-semibold'
                      : 'text-[#8C8C8C] hover:text-[#2D2D2D]'
                  }`}
                >
                  {labels[filterKey]}
                </button>
              );
            })}
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            title="Imprimir extrato"
            className="p-2 px-3 rounded-xl bg-[#FAF8F5] border border-[#EFE8E1] hover:bg-[#EFE8E1] text-[#5C5C5C] transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5 text-[#8C8C8C]" />
            <span>Imprimir</span>
          </button>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#6D4C41] text-white font-semibold'
                : 'bg-[#FAF8F5] text-[#8C8C8C] hover:text-[#2D2D2D]'
            }`}
          >
            Todos ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              typeFilter === 'income'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-[#FAF8F5] text-[#8C8C8C] hover:text-[#2D2D2D]'
            }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              typeFilter === 'expense'
                ? 'bg-rose-500 text-white font-semibold'
                : 'bg-[#FAF8F5] text-[#8C8C8C] hover:text-[#2D2D2D]'
            }`}
          >
            Saídas
          </button>
        </div>
      </div>

      {/* CHRONOLOGICAL FINANCIAL LEDGER LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#6D4C41]">
            Extrato ({filteredTransactions.length})
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#EFE8E1] text-center space-y-2">
            <Receipt className="w-8 h-8 text-[#D4C3B8] mx-auto" />
            <h4 className="text-sm font-semibold text-[#6D4C41]">
              Nenhuma movimentação no período
            </h4>
            <p className="text-xs text-[#8C8C8C]">
              Lançamentos de atendimentos e gastos aparecerão listados aqui.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EFE8E1] divide-y divide-[#EFE8E1]/60 overflow-hidden">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const method = getPaymentMethodDetails(tx.paymentMethod);

              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-[#FAF8F5]/60 transition-colors flex items-center justify-between gap-3"
                >
                  {/* Left */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-500'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#2D2D2D] truncate">
                          {tx.title}
                        </span>
                        <span className="text-[10px] text-[#8C8C8C] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#EFE8E1] hidden sm:inline">
                          {tx.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#8C8C8C] mt-0.5">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span>{method.label}</span>
                        {tx.createdBy && (
                          <>
                            <span>•</span>
                            <span>{tx.createdBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-semibold ${
                        isIncome ? 'text-[#2D2D2D]' : 'text-rose-500'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Excluir lançamento"
                      className="p-1 rounded-lg text-[#A0A0A0] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

