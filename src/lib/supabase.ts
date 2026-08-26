import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'lumina_supabase_config_v1';

export interface StoredSupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): StoredSupabaseConfig {
  // Check env first
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
      };
    }
  } catch (e) {
    console.error('Failed to parse stored Supabase config:', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      url: url.trim(),
      anonKey: anonKey.trim(),
    })
  );
  // Reset cached client
  cachedClient = null;
}

export function clearStoredSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL e Chave Anon são obrigatórias.' };
  }

  try {
    const client = createClient(url, anonKey);
    // Ping by checking any auth/health or simple select
    const { error } = await client.from('clients').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's connected to Supabase project, but schema needs creation
      if (error.message.includes('relation') || error.code === '42P01') {
        return {
          success: true,
          message: 'Conectado ao projeto Supabase! Tabelas precisam ser criadas com o script SQL.',
        };
      }
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }
    return { success: true, message: 'Conexão estabelecida e sincronizada com sucesso!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Falha de rede ao conectar ao Supabase.' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Copie e cole este script no Editor SQL do seu Supabase Dashboard:
-- Dashboard > SQL Editor > Novo Script > Run

-- 1. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT,
  birthDate TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  allergies TEXT,
  skinType TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  lastProcedureDate TEXT,
  lastProcedureName TEXT,
  totalSpent NUMERIC DEFAULT 0,
  totalVisits INT DEFAULT 0,
  daysSinceLastVisit INT,
  tags JSONB DEFAULT '[]'::jsonb
);

-- 2. Tabela de Presets de Serviços / Procedimentos
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  defaultPrice NUMERIC NOT NULL DEFAULT 0,
  durationMinutes INT NOT NULL DEFAULT 60,
  recommendedReturnDays INT DEFAULT 30,
  description TEXT,
  color TEXT
);

-- 3. Tabela de Procedimentos Realizados
CREATE TABLE IF NOT EXISTS public.procedures (
  id TEXT PRIMARY KEY,
  clientId TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  clientName TEXT NOT NULL,
  procedureName TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  paymentMethod TEXT NOT NULL,
  professionalId TEXT,
  professionalName TEXT NOT NULL,
  notes TEXT,
  transactionId TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Transações de Caixa (Entradas e Saídas)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  paymentMethod TEXT NOT NULL,
  createdBy TEXT NOT NULL,
  clientId TEXT,
  clientName TEXT,
  procedureId TEXT,
  supplier TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Agenda / Calendário de Atendimentos
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  clientId TEXT,
  clientName TEXT NOT NULL,
  clientPhone TEXT,
  serviceId TEXT,
  procedureName TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  durationMinutes INT NOT NULL DEFAULT 60,
  price NUMERIC NOT NULL DEFAULT 0,
  professionalId TEXT,
  professionalName TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  convertedToProcedureId TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Habilitar Realtime para todas as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.procedures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- 7. Políticas de Acesso Público para o Applet
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público procedures" ON public.procedures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
`;
