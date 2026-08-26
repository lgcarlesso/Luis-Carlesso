import {
  Client,
  ProcedureRecord,
  CashTransaction,
  StaffMember,
  PredefinedService,
  ReturnMessageTemplate,
  Appointment,
} from '../types';

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Profissional / Administrador',
    role: 'admin',
    roleTitle: 'Responsável Técnica & Proprietária',
    email: 'contato@luminaestetica.com.br',
    phone: '(11) 99999-0000',
    avatarColor: 'from-rose-400 to-rose-600',
  },
];

export const PREDEFINED_SERVICES: PredefinedService[] = [
  {
    id: 'srv-1',
    name: 'Limpeza de Pele Profunda',
    category: 'Facial',
    defaultPrice: 180.0,
    durationMinutes: 60,
    recommendedReturnDays: 30,
    description: 'Higienização, extração manual, alta frequência e máscara regeneradora.',
    color: '#8B5CF6',
  },
  {
    id: 'srv-2',
    name: 'Aplicação de Toxina Botulínica (Botox)',
    category: 'Injetáveis',
    defaultPrice: 1200.0,
    durationMinutes: 45,
    recommendedReturnDays: 120,
    description: 'Tratamento de rugas dinâmicas na testa, glabela e pés de galinha.',
    color: '#EC4899',
  },
  {
    id: 'srv-3',
    name: 'Preenchimento com Ácido Hialurônico',
    category: 'Injetáveis',
    defaultPrice: 1100.0,
    durationMinutes: 60,
    recommendedReturnDays: 240,
    description: 'Contorno, hidratação profunda e volumização harmônica.',
    color: '#F43F5E',
  },
  {
    id: 'srv-4',
    name: 'Peeling Facial Químico / Diamante',
    category: 'Facial',
    defaultPrice: 200.0,
    durationMinutes: 50,
    recommendedReturnDays: 30,
    description: 'Renovação celular, fechamento de poros e luminosidade cutânea.',
    color: '#3B82F6',
  },
  {
    id: 'srv-5',
    name: 'Drenagem Linfática Corporal',
    category: 'Corporal',
    defaultPrice: 150.0,
    durationMinutes: 60,
    recommendedReturnDays: 15,
    description: 'Redução de retenção de líquidos, toxinas e inchaço.',
    color: '#10B981',
  },
  {
    id: 'srv-6',
    name: 'Bioestimulador de Colágeno',
    category: 'Injetáveis',
    defaultPrice: 2200.0,
    durationMinutes: 60,
    recommendedReturnDays: 180,
    description: 'Firmeza cutânea, neoformação de colágeno e sustentação tecidual.',
    color: '#6366F1',
  },
];

export const RETURN_MESSAGE_TEMPLATES: ReturnMessageTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Manutenção e Retoque Suave (+30 dias)',
    badge: '30+ Dias',
    text: 'Olá {NOME}, tudo bem? 🌸 Aqui é da Lumina Estética! Notamos que faz {DIAS} dias desde o seu procedimento de {PROCEDIMENTO}. Para manter sua pele impecável e os resultados perfeitos, recomendamos sua sessão de manutenção! Que dia fica melhor para você?',
  },
  {
    id: 'tpl-2',
    name: 'Reconquista com Mimo Especial (+60 dias)',
    badge: '60+ Dias',
    text: 'Oi {NOME}! ✨ Estamos com saudades de cuidar de você aqui no nosso espaço! Faz {DIAS} dias que nos vimos. Agendando seu retorno para esta semana preparamos uma hidratação especial cortesia. Vamos agendar seu horário de autocuidado?',
  },
  {
    id: 'tpl-3',
    name: 'VIP & Renovação de Procedimento (+90 dias)',
    badge: '90+ Dias',
    text: 'Olá {NOME}! 💖 Faz um tempinho ({DIAS} dias) desde seu último {PROCEDIMENTO} com a gente. Seu bem-estar e autoestima merecem prioridade! Responda aqui para conferir nossos horários disponíveis nesta semana!',
  },
];

// Completely clean/empty initial records for real production usage from zero
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_PROCEDURES: ProcedureRecord[] = [];
export const INITIAL_TRANSACTIONS: CashTransaction[] = [];
export const INITIAL_APPOINTMENTS: Appointment[] = [];
