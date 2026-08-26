// Currency Formatter for Brazilian Real (BRL)
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Date Formatter: YYYY-MM-DD -> DD/MM/YYYY
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateStr;
  }
}

// Relative time or Days Ago text
export function formatDaysAgoText(days: number): string {
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 30) return `Há ${days} dias`;
  if (days < 60) return `Há +1 mês (${days} dias)`;
  if (days < 90) return `Há +2 meses (${days} dias)`;
  return `Há +3 meses (${days} dias)`;
}

// Phone Mask (XX) XXXXX-XXXX or (XX) XXXX-XXXX
export function maskPhone(value: string): string {
  const clean = value.replace(/\D/g, '').substring(0, 11);
  if (clean.length <= 2) return clean.length ? `(${clean}` : '';
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

// CPF Mask 000.000.000-00
export function maskCPF(value: string): string {
  const clean = value.replace(/\D/g, '').substring(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

// Payment method translation & icon color
export function getPaymentMethodDetails(method: string) {
  switch (method) {
    case 'pix':
      return { label: 'Pix Instantâneo', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'credit_card':
      return { label: 'Cartão de Crédito', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'debit_card':
      return { label: 'Cartão de Débito', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'cash':
      return { label: 'Dinheiro Espécie', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'transfer':
      return { label: 'Transferência / TED', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    default:
      return { label: method || 'Outro', color: 'bg-stone-50 text-stone-700 border-stone-200' };
  }
}
