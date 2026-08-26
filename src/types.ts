export type UserRole = 'admin' | 'esteticista' | 'biomedica' | 'recepcionista' | 'terapeuta';

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  phone?: string;
  avatarColor: string;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  birthDate: string; // YYYY-MM-DD
  phone: string;
  email?: string;
  notes?: string;
  allergies?: string;
  skinType?: string;
  createdAt: string;
  updatedAt: string;
  lastProcedureDate?: string;
  lastProcedureName?: string;
  totalSpent: number;
  totalVisits: number;
  daysSinceLastVisit?: number;
  tags?: string[];
}

export interface ProcedureRecord {
  id: string;
  clientId: string;
  clientName: string;
  procedureName: string;
  category: string;
  date: string; // YYYY-MM-DD
  time?: string;
  price: number;
  paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer';
  professionalId: string;
  professionalName: string;
  notes?: string;
  transactionId?: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer';

export interface CashTransaction {
  id: string;
  type: TransactionType;
  category: string;
  title: string;
  description?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  createdBy: string;
  clientId?: string;
  clientName?: string;
  procedureId?: string;
  supplier?: string;
  createdAt: string;
}

export interface PredefinedService {
  id: string;
  name: string;
  category: string;
  defaultPrice: number;
  durationMinutes: number;
  recommendedReturnDays: number;
  description?: string;
  color?: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  serviceId?: string;
  procedureName: string;
  category: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  price: number;
  professionalId: string;
  professionalName: string;
  status: AppointmentStatus;
  notes?: string;
  convertedToProcedureId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnMessageTemplate {
  id: string;
  name: string;
  badge: string;
  text: string;
}

export interface ConnectedDevice {
  id: string;
  deviceName: string;
  platform: 'iPhone' | 'Android' | 'Mac' | 'Windows' | 'Web';
  staffName: string;
  lastActive: string;
  isCurrentDevice?: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  syncError?: string;
}

export interface AppStateData {
  clients: Client[];
  procedures: ProcedureRecord[];
  transactions: CashTransaction[];
  appointments: Appointment[];
  staff: StaffMember[];
  services: PredefinedService[];
  clinicInfo: {
    name: string;
    cnpj?: string;
    phone: string;
    address: string;
    ownerName: string;
  };
}

export type NavTabId = 'dashboard' | 'calendar' | 'clients' | 'absent' | 'cash' | 'reports' | 'services' | 'settings';

export type PeriodFilter = 'today' | 'week' | 'month' | 'all' | 'custom';

