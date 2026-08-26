import { getSupabaseClient } from '../lib/supabase';
import {
  Client,
  ProcedureRecord,
  CashTransaction,
  Appointment,
  PredefinedService,
} from '../types';

export interface RemoteSyncPayload {
  clients?: Client[];
  procedures?: ProcedureRecord[];
  transactions?: CashTransaction[];
  appointments?: Appointment[];
  services?: PredefinedService[];
}

export async function fetchAllRemoteData(): Promise<RemoteSyncPayload | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [clientsRes, proceduresRes, transactionsRes, appointmentsRes, servicesRes] =
      await Promise.all([
        client.from('clients').select('*'),
        client.from('procedures').select('*'),
        client.from('transactions').select('*'),
        client.from('appointments').select('*'),
        client.from('services').select('*'),
      ]);

    return {
      clients: clientsRes.data ? (clientsRes.data as Client[]) : undefined,
      procedures: proceduresRes.data ? (proceduresRes.data as ProcedureRecord[]) : undefined,
      transactions: transactionsRes.data ? (transactionsRes.data as CashTransaction[]) : undefined,
      appointments: appointmentsRes.data ? (appointmentsRes.data as Appointment[]) : undefined,
      services: servicesRes.data ? (servicesRes.data as PredefinedService[]) : undefined,
    };
  } catch (err) {
    console.error('Error fetching remote data from Supabase:', err);
    return null;
  }
}

export async function upsertRemoteClient(clientItem: Client): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('clients').upsert(clientItem);
    if (error) {
      console.warn('Supabase upsert client warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase error upserting client:', err);
    return false;
  }
}

export async function deleteRemoteClient(clientId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('clients').delete().eq('id', clientId);
    return !error;
  } catch (err) {
    console.error('Supabase error deleting client:', err);
    return false;
  }
}

export async function upsertRemoteProcedure(procedure: ProcedureRecord): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('procedures').upsert(procedure);
    return !error;
  } catch (err) {
    console.error('Supabase error upserting procedure:', err);
    return false;
  }
}

export async function deleteRemoteProcedure(procedureId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('procedures').delete().eq('id', procedureId);
    return !error;
  } catch (err) {
    console.error('Supabase error deleting procedure:', err);
    return false;
  }
}

export async function upsertRemoteTransaction(transaction: CashTransaction): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('transactions').upsert(transaction);
    return !error;
  } catch (err) {
    console.error('Supabase error upserting transaction:', err);
    return false;
  }
}

export async function deleteRemoteTransaction(transactionId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('transactions').delete().eq('id', transactionId);
    return !error;
  } catch (err) {
    console.error('Supabase error deleting transaction:', err);
    return false;
  }
}

export async function upsertRemoteAppointment(appointment: Appointment): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('appointments').upsert(appointment);
    return !error;
  } catch (err) {
    console.error('Supabase error upserting appointment:', err);
    return false;
  }
}

export async function deleteRemoteAppointment(appointmentId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('appointments').delete().eq('id', appointmentId);
    return !error;
  } catch (err) {
    console.error('Supabase error deleting appointment:', err);
    return false;
  }
}

export async function upsertRemoteService(service: PredefinedService): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('services').upsert(service);
    return !error;
  } catch (err) {
    console.error('Supabase error upserting service:', err);
    return false;
  }
}

export async function deleteRemoteService(serviceId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('services').delete().eq('id', serviceId);
    return !error;
  } catch (err) {
    console.error('Supabase error deleting service:', err);
    return false;
  }
}

export async function pushAllLocalDataToSupabase(data: {
  clients: Client[];
  procedures: ProcedureRecord[];
  transactions: CashTransaction[];
  appointments: Appointment[];
  services: PredefinedService[];
}): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase não está configurado.' };
  }

  try {
    if (data.clients.length > 0) {
      await client.from('clients').upsert(data.clients);
    }
    if (data.services.length > 0) {
      await client.from('services').upsert(data.services);
    }
    if (data.procedures.length > 0) {
      await client.from('procedures').upsert(data.procedures);
    }
    if (data.transactions.length > 0) {
      await client.from('transactions').upsert(data.transactions);
    }
    if (data.appointments.length > 0) {
      await client.from('appointments').upsert(data.appointments);
    }

    return { success: true, message: 'Todos os dados foram enviados para o Supabase!' };
  } catch (err: any) {
    console.error('Error pushing full local data to Supabase:', err);
    return { success: false, message: err?.message || 'Erro ao sincronizar dados com o Supabase.' };
  }
}
