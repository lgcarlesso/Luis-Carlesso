import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Client,
  ProcedureRecord,
  CashTransaction,
  StaffMember,
  PredefinedService,
  ConnectedDevice,
  PeriodFilter,
  Appointment,
  AppointmentStatus,
  NavTabId,
  SupabaseConfig,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_PROCEDURES,
  INITIAL_TRANSACTIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_STAFF,
  PREDEFINED_SERVICES,
  RETURN_MESSAGE_TEMPLATES,
} from '../data/initialData';
import {
  getSupabaseClient,
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  clearStoredSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabase';
import {
  fetchAllRemoteData,
  upsertRemoteClient,
  deleteRemoteClient,
  upsertRemoteProcedure,
  deleteRemoteProcedure,
  upsertRemoteTransaction,
  deleteRemoteTransaction,
  upsertRemoteAppointment,
  deleteRemoteAppointment,
  upsertRemoteService,
  deleteRemoteService,
  pushAllLocalDataToSupabase,
} from '../services/supabaseService';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Data
  clients: Client[];
  procedures: ProcedureRecord[];
  transactions: CashTransaction[];
  appointments: Appointment[];
  staff: StaffMember[];
  services: PredefinedService[];
  currentStaff: StaffMember;
  connectedDevices: ConnectedDevice[];
  activeDevicesCount: number;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  isAuthenticated: boolean;
  userEmail: string;

  // Supabase Cloud State
  supabaseConfig: SupabaseConfig;
  updateSupabaseCredentials: (url: string, anonKey: string) => Promise<{ success: boolean; message: string }>;
  disconnectSupabase: () => void;
  syncWithSupabase: () => Promise<void>;
  pushLocalToSupabase: () => Promise<{ success: boolean; message: string }>;

  // Navigation & UI State
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  currentView: NavTabId;
  setCurrentView: (tab: NavTabId) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  periodFilter: PeriodFilter;
  setPeriodFilter: (filter: PeriodFilter) => void;

  // Action Methods - Clients
  addClient: (
    client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'totalSpent' | 'totalVisits'>,
    initialProcedure?: {
      procedureName: string;
      category: string;
      price: number;
      paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer';
      notes?: string;
    }
  ) => { client: Client; procedure?: ProcedureRecord };
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Action Methods - Procedures & Cash
  addProcedure: (
    data: Omit<ProcedureRecord, 'id' | 'createdAt' | 'transactionId'>
  ) => ProcedureRecord;
  deleteProcedure: (id: string) => void;
  addTransaction: (
    data: Omit<CashTransaction, 'id' | 'createdAt'>
  ) => CashTransaction;
  deleteTransaction: (id: string) => void;

  // Action Methods - Appointments (Agenda / Calendário)
  addAppointment: (
    data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'convertedToProcedureId'>
  ) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  completeAppointmentAndBill: (
    appointmentId: string,
    paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer',
    finalPrice?: number,
    notes?: string
  ) => { procedure: ProcedureRecord; transaction: CashTransaction } | null;

  // Action Methods - Presets (Procedimentos Padrão)
  addServicePreset: (data: Omit<PredefinedService, 'id'>) => PredefinedService;
  updateServicePreset: (id: string, updates: Partial<PredefinedService>) => void;
  deleteServicePreset: (id: string) => void;

  // System & Utilities
  switchStaff: (staffId: string) => void;
  clearAllData: () => void;
  resetToMockData: () => void;
  login: (email: string, password?: string) => boolean;
  registerAccount: (email: string, clinicName: string, staffName: string) => boolean;
  logout: () => void;
  sendWhatsAppMessage: (client: Client, templateText: string) => void;
  sendAppointmentWhatsApp: (appointment: Appointment) => void;
  triggerCelebration: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_CLIENTS = 'lumina_clients_v2';
const STORAGE_KEY_PROCEDURES = 'lumina_procedures_v2';
const STORAGE_KEY_TRANSACTIONS = 'lumina_transactions_v2';
const STORAGE_KEY_APPOINTMENTS = 'lumina_appointments_v2';
const STORAGE_KEY_SERVICES = 'lumina_services_v2';
const STORAGE_KEY_STAFF = 'lumina_staff_v2';
const STORAGE_KEY_CURRENT_USER = 'lumina_current_user_v2';

export function calculateDaysAgo(dateStr?: string): number {
  if (!dateStr) return 999;
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - target.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or clean defaults
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLIENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CLIENTS;
  });

  const [procedures, setProcedures] = useState<ProcedureRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROCEDURES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PROCEDURES;
  });

  const [transactions, setTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_APPOINTMENTS;
  });

  const [services, setServices] = useState<PredefinedService[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SERVICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return PREDEFINED_SERVICES;
  });

  const [staff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STAFF);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_STAFF;
  });

  const [currentStaff, setCurrentStaff] = useState<StaffMember>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (saved) {
      try {
        const found = INITIAL_STAFF.find((s) => s.id === saved);
        if (found) return found;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_STAFF[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>('contato@luminaestetica.com.br');
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');

  // Supabase State
  const initialSupabaseConfig = getStoredSupabaseConfig();
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
    url: initialSupabaseConfig.url,
    anonKey: initialSupabaseConfig.anonKey,
    isConnected: !!(initialSupabaseConfig.url && initialSupabaseConfig.anonKey),
    lastSyncedAt: undefined,
  });

  // Real-time synchronization state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([
    {
      id: 'dev-1',
      deviceName: 'Este Aparelho (PWA / Web)',
      platform: 'Mac',
      staffName: currentStaff.name,
      lastActive: new Date().toISOString(),
      isCurrentDevice: true,
    },
  ]);
  const [activeDevicesCount, setActiveDevicesCount] = useState<number>(1);
  const [wsSocket, setWsSocket] = useState<WebSocket | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROCEDURES, JSON.stringify(procedures));
  }, [procedures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, currentStaff.id);
  }, [currentStaff]);

  // SUPABASE REALTIME SUBSCRIPTIONS & FETCH
  const syncWithSupabase = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) return;

    setIsSyncing(true);
    try {
      const remote = await fetchAllRemoteData();
      if (remote) {
        if (remote.clients && remote.clients.length >= 0) setClients(remote.clients);
        if (remote.procedures && remote.procedures.length >= 0) setProcedures(remote.procedures);
        if (remote.transactions && remote.transactions.length >= 0) setTransactions(remote.transactions);
        if (remote.appointments && remote.appointments.length >= 0) setAppointments(remote.appointments);
        if (remote.services && remote.services.length > 0) setServices(remote.services);

        setSupabaseConfig((prev) => ({
          ...prev,
          isConnected: true,
          lastSyncedAt: new Date().toLocaleTimeString('pt-BR'),
          syncError: undefined,
        }));
        setLastSyncedAt(new Date());
      }
    } catch (err: any) {
      console.warn('Supabase sync error:', err);
      setSupabaseConfig((prev) => ({
        ...prev,
        syncError: err?.message || 'Erro ao sincronizar',
      }));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initialize Supabase realtime listeners when configured
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Initial sync
    syncWithSupabase();

    // Setup realtime channel
    const channel = supabase
      .channel('lumina-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClients((prev) => [payload.new as Client, ...prev.filter((c) => c.id !== (payload.new as Client).id)]);
          } else if (payload.eventType === 'UPDATE') {
            setClients((prev) => prev.map((c) => (c.id === payload.new.id ? (payload.new as Client) : c)));
          } else if (payload.eventType === 'DELETE') {
            setClients((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
          setLastSyncedAt(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAppointments((prev) => [payload.new as Appointment, ...prev.filter((a) => a.id !== (payload.new as Appointment).id)]);
          } else if (payload.eventType === 'UPDATE') {
            setAppointments((prev) => prev.map((a) => (a.id === payload.new.id ? (payload.new as Appointment) : a)));
          } else if (payload.eventType === 'DELETE') {
            setAppointments((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
          setLastSyncedAt(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'procedures' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProcedures((prev) => [payload.new as ProcedureRecord, ...prev.filter((p) => p.id !== (payload.new as ProcedureRecord).id)]);
          } else if (payload.eventType === 'DELETE') {
            setProcedures((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
          setLastSyncedAt(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions((prev) => [payload.new as CashTransaction, ...prev.filter((t) => t.id !== (payload.new as CashTransaction).id)]);
          } else if (payload.eventType === 'DELETE') {
            setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
          setLastSyncedAt(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setServices((prev) => [payload.new as PredefinedService, ...prev.filter((s) => s.id !== (payload.new as PredefinedService).id)]);
          } else if (payload.eventType === 'UPDATE') {
            setServices((prev) => prev.map((s) => (s.id === payload.new.id ? (payload.new as PredefinedService) : s)));
          } else if (payload.eventType === 'DELETE') {
            setServices((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
          setLastSyncedAt(new Date());
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSupabaseConfig((prev) => ({ ...prev, isConnected: true, syncError: undefined }));
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [syncWithSupabase]);

  // UPDATE SUPABASE CREDENTIALS
  const updateSupabaseCredentials = useCallback(
    async (url: string, anonKey: string) => {
      setIsSyncing(true);
      const res = await testSupabaseConnection(url, anonKey);
      if (res.success) {
        saveStoredSupabaseConfig(url, anonKey);
        setSupabaseConfig({
          url,
          anonKey,
          isConnected: true,
          lastSyncedAt: new Date().toLocaleTimeString('pt-BR'),
          syncError: undefined,
        });
        await syncWithSupabase();
      } else {
        setSupabaseConfig((prev) => ({
          ...prev,
          url,
          anonKey,
          isConnected: false,
          syncError: res.message,
        }));
      }
      setIsSyncing(false);
      return res;
    },
    [syncWithSupabase]
  );

  const disconnectSupabase = useCallback(() => {
    clearStoredSupabaseConfig();
    setSupabaseConfig({
      url: '',
      anonKey: '',
      isConnected: false,
      lastSyncedAt: undefined,
      syncError: undefined,
    });
  }, []);

  const pushLocalToSupabase = useCallback(async () => {
    setIsSyncing(true);
    const res = await pushAllLocalDataToSupabase({
      clients,
      procedures,
      transactions,
      appointments,
      services,
    });
    setIsSyncing(false);
    if (res.success) {
      setSupabaseConfig((prev) => ({
        ...prev,
        lastSyncedAt: new Date().toLocaleTimeString('pt-BR'),
      }));
    }
    return res;
  }, [clients, procedures, transactions, appointments, services]);

  // WebSocket / Local broadcast helper
  const broadcastChange = useCallback(
    (type: string, payload: any) => {
      setIsSyncing(true);
      setLastSyncedAt(new Date());
      setTimeout(() => setIsSyncing(false), 500);

      if (wsSocket && wsSocket.readyState === WebSocket.OPEN) {
        wsSocket.send(
          JSON.stringify({
            event: 'data:broadcast',
            payload: { type, payload },
          })
        );
      }
    },
    [wsSocket]
  );

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#E11D48', '#FB7185', '#F43F5E', '#FDA4AF', '#FDE047'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  // ADD CLIENT
  const addClient = useCallback(
    (
      clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'totalSpent' | 'totalVisits'>,
      initialProcedure?: {
        procedureName: string;
        category: string;
        price: number;
        paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer';
        notes?: string;
      }
    ) => {
      const clientId = 'cli-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

      let createdProcedure: ProcedureRecord | undefined = undefined;
      let createdTransaction: CashTransaction | undefined = undefined;

      const hasProcedure = initialProcedure && initialProcedure.procedureName && Number(initialProcedure.price) > 0;

      if (hasProcedure) {
        const procId = 'prc-' + Date.now().toString(36);
        const txId = 'tx-' + Date.now().toString(36);

        createdProcedure = {
          id: procId,
          clientId,
          clientName: clientData.name,
          procedureName: initialProcedure.procedureName,
          category: initialProcedure.category || 'Facial',
          date: todayStr,
          time: timeStr,
          price: Number(initialProcedure.price),
          paymentMethod: initialProcedure.paymentMethod || 'pix',
          professionalId: currentStaff.id,
          professionalName: currentStaff.name,
          notes: initialProcedure.notes,
          transactionId: txId,
          createdAt: now.toISOString(),
        };

        createdTransaction = {
          id: txId,
          type: 'income',
          category: 'Procedimento Estético',
          title: `${initialProcedure.procedureName} - ${clientData.name}`,
          description: `Novo cadastro e procedimento realizado por ${currentStaff.name}`,
          amount: Number(initialProcedure.price),
          date: todayStr,
          time: timeStr,
          paymentMethod: initialProcedure.paymentMethod || 'pix',
          createdBy: currentStaff.name,
          clientId,
          clientName: clientData.name,
          procedureId: procId,
          createdAt: now.toISOString(),
        };
      }

      const newClient: Client = {
        ...clientData,
        id: clientId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        lastProcedureDate: hasProcedure ? todayStr : undefined,
        lastProcedureName: hasProcedure ? initialProcedure.procedureName : undefined,
        totalSpent: hasProcedure ? Number(initialProcedure.price) : 0,
        totalVisits: hasProcedure ? 1 : 0,
        tags: hasProcedure ? ['Novo Cliente'] : ['Sem Atendimento'],
      };

      setClients((prev) => [newClient, ...prev]);
      upsertRemoteClient(newClient);
      broadcastChange('CLIENT_ADDED', newClient);

      if (createdProcedure) {
        setProcedures((prev) => [createdProcedure!, ...prev]);
        upsertRemoteProcedure(createdProcedure);
        broadcastChange('PROCEDURE_ADDED', createdProcedure);
      }

      if (createdTransaction) {
        setTransactions((prev) => [createdTransaction!, ...prev]);
        upsertRemoteTransaction(createdTransaction);
        broadcastChange('TRANSACTION_ADDED', createdTransaction);
        triggerCelebration();
      }

      return { client: newClient, procedure: createdProcedure };
    },
    [currentStaff, broadcastChange, triggerCelebration]
  );

  // UPDATE CLIENT
  const updateClient = useCallback(
    (id: string, updates: Partial<Client>) => {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const updated = {
              ...c,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            upsertRemoteClient(updated);
            broadcastChange('CLIENT_UPDATED', updated);
            return updated;
          }
          return c;
        })
      );
    },
    [broadcastChange]
  );

  // DELETE CLIENT
  const deleteClient = useCallback(
    (id: string) => {
      setClients((prev) => prev.filter((c) => c.id !== id));
      deleteRemoteClient(id);
      broadcastChange('CLIENT_DELETED', { id });
    },
    [broadcastChange]
  );

  // ADD PROCEDURE
  const addProcedure = useCallback(
    (data: Omit<ProcedureRecord, 'id' | 'createdAt' | 'transactionId'>) => {
      const procId = 'prc-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const txId = 'tx-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const now = new Date();
      const timeStr = data.time || now.toTimeString().split(' ')[0].substring(0, 5);

      const newProcedure: ProcedureRecord = {
        ...data,
        id: procId,
        time: timeStr,
        transactionId: txId,
        createdAt: now.toISOString(),
      };

      const newTransaction: CashTransaction = {
        id: txId,
        type: 'income',
        category: 'Procedimento Estético',
        title: `${data.procedureName} - ${data.clientName}`,
        description: `Procedimento realizado por ${data.professionalName || currentStaff.name}`,
        amount: Number(data.price),
        date: data.date,
        time: timeStr,
        paymentMethod: data.paymentMethod,
        createdBy: data.professionalName || currentStaff.name,
        clientId: data.clientId,
        clientName: data.clientName,
        procedureId: procId,
        createdAt: now.toISOString(),
      };

      // Update client stats
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === data.clientId) {
            const updatedClient = {
              ...c,
              lastProcedureDate: data.date,
              lastProcedureName: data.procedureName,
              totalSpent: Number(c.totalSpent || 0) + Number(data.price),
              totalVisits: Number(c.totalVisits || 0) + 1,
              updatedAt: now.toISOString(),
            };
            upsertRemoteClient(updatedClient);
            return updatedClient;
          }
          return c;
        })
      );

      setProcedures((prev) => [newProcedure, ...prev]);
      setTransactions((prev) => [newTransaction, ...prev]);

      upsertRemoteProcedure(newProcedure);
      upsertRemoteTransaction(newTransaction);

      broadcastChange('PROCEDURE_ADDED', newProcedure);
      broadcastChange('TRANSACTION_ADDED', newTransaction);
      triggerCelebration();

      return newProcedure;
    },
    [currentStaff, broadcastChange, triggerCelebration]
  );

  const deleteProcedure = useCallback(
    (id: string) => {
      setProcedures((prev) => prev.filter((p) => p.id !== id));
      deleteRemoteProcedure(id);
      broadcastChange('PROCEDURE_DELETED', { id });
    },
    [broadcastChange]
  );

  // ADD TRANSACTION
  const addTransaction = useCallback(
    (data: Omit<CashTransaction, 'id' | 'createdAt'>) => {
      const txId = 'tx-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const now = new Date();

      const newTx: CashTransaction = {
        ...data,
        id: txId,
        createdAt: now.toISOString(),
      };

      setTransactions((prev) => [newTx, ...prev]);
      upsertRemoteTransaction(newTx);
      broadcastChange('TRANSACTION_ADDED', newTx);
      return newTx;
    },
    [broadcastChange]
  );

  // DELETE TRANSACTION
  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      deleteRemoteTransaction(id);
      broadcastChange('TRANSACTION_DELETED', { id });
    },
    [broadcastChange]
  );

  // APPOINTMENTS (AGENDA / CALENDÁRIO)
  const addAppointment = useCallback(
    (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'convertedToProcedureId'>) => {
      const aptId = 'apt-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const now = new Date();

      const newApt: Appointment = {
        ...data,
        id: aptId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      setAppointments((prev) => [newApt, ...prev]);
      upsertRemoteAppointment(newApt);
      broadcastChange('APPOINTMENT_ADDED', newApt);
      return newApt;
    },
    [broadcastChange]
  );

  const updateAppointment = useCallback(
    (id: string, updates: Partial<Appointment>) => {
      setAppointments((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            const updated = {
              ...a,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            upsertRemoteAppointment(updated);
            broadcastChange('APPOINTMENT_UPDATED', updated);
            return updated;
          }
          return a;
        })
      );
    },
    [broadcastChange]
  );

  const deleteAppointment = useCallback(
    (id: string) => {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      deleteRemoteAppointment(id);
      broadcastChange('APPOINTMENT_DELETED', { id });
    },
    [broadcastChange]
  );

  // COMPLETE APPOINTMENT AND GENERATE PROCEDURE & CASH RECORD
  const completeAppointmentAndBill = useCallback(
    (
      appointmentId: string,
      paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer',
      finalPrice?: number,
      notes?: string
    ) => {
      const apt = appointments.find((a) => a.id === appointmentId);
      if (!apt) return null;

      const price = finalPrice !== undefined ? finalPrice : apt.price;
      const proc = addProcedure({
        clientId: apt.clientId,
        clientName: apt.clientName,
        procedureName: apt.procedureName,
        category: apt.category,
        date: apt.date,
        time: apt.startTime,
        price,
        paymentMethod,
        professionalId: apt.professionalId || currentStaff.id,
        professionalName: apt.professionalName || currentStaff.name,
        notes: notes || apt.notes,
      });

      const updatedApt: Appointment = {
        ...apt,
        status: 'completed',
        convertedToProcedureId: proc.id,
        updatedAt: new Date().toISOString(),
      };

      setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? updatedApt : a)));
      upsertRemoteAppointment(updatedApt);

      const tx = transactions.find((t) => t.procedureId === proc.id);
      return { procedure: proc, transaction: tx! };
    },
    [appointments, addProcedure, currentStaff, transactions]
  );

  // PRESETS (PROCEDIMENTOS PADRÃO)
  const addServicePreset = useCallback(
    (data: Omit<PredefinedService, 'id'>) => {
      const srvId = 'srv-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const newSrv: PredefinedService = {
        ...data,
        id: srvId,
      };

      setServices((prev) => [newSrv, ...prev]);
      upsertRemoteService(newSrv);
      broadcastChange('SERVICE_ADDED', newSrv);
      return newSrv;
    },
    [broadcastChange]
  );

  const updateServicePreset = useCallback(
    (id: string, updates: Partial<PredefinedService>) => {
      setServices((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            const updated = { ...s, ...updates };
            upsertRemoteService(updated);
            broadcastChange('SERVICE_UPDATED', updated);
            return updated;
          }
          return s;
        })
      );
    },
    [broadcastChange]
  );

  const deleteServicePreset = useCallback(
    (id: string) => {
      setServices((prev) => prev.filter((s) => s.id !== id));
      deleteRemoteService(id);
      broadcastChange('SERVICE_DELETED', { id });
    },
    [broadcastChange]
  );

  // SWITCH ACTIVE STAFF
  const switchStaff = useCallback((staffId: string) => {
    const target = staff.find((s) => s.id === staffId);
    if (target) {
      setCurrentStaff(target);
    }
  }, [staff]);

  // CLEAR ALL DATA (FROM ZERO / PRODUCTION CLEAN START)
  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_CLIENTS);
    localStorage.removeItem(STORAGE_KEY_PROCEDURES);
    localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEY_APPOINTMENTS);

    setClients([]);
    setProcedures([]);
    setTransactions([]);
    setAppointments([]);
    setSelectedClientId(null);
    triggerCelebration();
  }, [triggerCelebration]);

  // RESET TO DEMONSTRATION DATA
  const resetToMockData = useCallback(() => {
    clearAllData();
  }, [clearAllData]);

  // AUTH METHODS
  const login = useCallback((email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    return true;
  }, []);

  const registerAccount = useCallback((email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  // WHATSAPP MESSAGING
  const sendWhatsAppMessage = useCallback((client: Client, templateText: string) => {
    const daysAgo = calculateDaysAgo(client.lastProcedureDate);
    const firstName = client.name.split(' ')[0];
    const procedure = client.lastProcedureName || 'seu procedimento';

    const personalized = templateText
      .replace(/{NOME}/g, firstName)
      .replace(/{DIAS}/g, daysAgo.toString())
      .replace(/{PROCEDIMENTO}/g, procedure);

    let cleanPhone = client.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = '55' + cleanPhone;
    }

    const encoded = encodeURIComponent(personalized);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(waUrl, '_blank');
  }, []);

  const sendAppointmentWhatsApp = useCallback((appointment: Appointment) => {
    const firstName = appointment.clientName.split(' ')[0];
    const dateFormatted = appointment.date.split('-').reverse().join('/');
    const text = `Olá ${firstName}! ✨ Confirmamos seu agendamento de *${appointment.procedureName}* para o dia *${dateFormatted}* às *${appointment.startTime}* na Lumina Estética. Qualquer dúvida estamos à disposição! 🌸`;

    const phone = appointment.clientPhone || '';
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = '55' + cleanPhone;
    }

    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(waUrl, '_blank');
  }, []);

  const value = useMemo(
    () => ({
      clients,
      procedures,
      transactions,
      appointments,
      staff,
      services,
      currentStaff,
      connectedDevices,
      activeDevicesCount,
      isSyncing,
      lastSyncedAt,
      isAuthenticated,
      userEmail,
      supabaseConfig,
      updateSupabaseCredentials,
      disconnectSupabase,
      syncWithSupabase,
      pushLocalToSupabase,
      activeTab,
      setActiveTab,
      currentView: activeTab,
      setCurrentView: setActiveTab,
      selectedClientId,
      setSelectedClientId,
      periodFilter,
      setPeriodFilter,
      addClient,
      updateClient,
      deleteClient,
      addProcedure,
      deleteProcedure,
      addTransaction,
      deleteTransaction,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      completeAppointmentAndBill,
      addServicePreset,
      updateServicePreset,
      deleteServicePreset,
      switchStaff,
      clearAllData,
      resetToMockData,
      login,
      registerAccount,
      logout,
      sendWhatsAppMessage,
      sendAppointmentWhatsApp,
      triggerCelebration,
    }),
    [
      clients,
      procedures,
      transactions,
      appointments,
      staff,
      services,
      currentStaff,
      connectedDevices,
      activeDevicesCount,
      isSyncing,
      lastSyncedAt,
      isAuthenticated,
      userEmail,
      supabaseConfig,
      updateSupabaseCredentials,
      disconnectSupabase,
      syncWithSupabase,
      pushLocalToSupabase,
      activeTab,
      selectedClientId,
      periodFilter,
      addClient,
      updateClient,
      deleteClient,
      addProcedure,
      deleteProcedure,
      addTransaction,
      deleteTransaction,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      completeAppointmentAndBill,
      addServicePreset,
      updateServicePreset,
      deleteServicePreset,
      switchStaff,
      clearAllData,
      resetToMockData,
      login,
      registerAccount,
      logout,
      sendWhatsAppMessage,
      sendAppointmentWhatsApp,
      triggerCelebration,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
