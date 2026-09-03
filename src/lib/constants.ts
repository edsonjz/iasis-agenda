import { AppointmentStatus, PaymentMethod } from '@/types';

export const APPOINTMENT_STATUS_MAP: Record<
  AppointmentStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  scheduled: {
    label: 'Agendado',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  confirmed: {
    label: 'Confirmado',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  in_service: {
    label: 'Em Atendimento',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500 animate-pulse',
  },
  completed: {
    label: 'Finalizado',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  no_show: {
    label: 'Faltou',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
  rescheduled: {
    label: 'Reagendado',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  blocked: {
    label: 'Bloqueado',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-300 dark:border-zinc-700',
    dot: 'bg-zinc-400',
  },
};

export const PAYMENT_METHODS_MAP: Record<PaymentMethod, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  transfer: 'Transferência Bancária',
  other: 'Outro',
};

export const DEFAULT_TAGS = [
  { name: 'VIP', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' },
  { name: 'Nova cliente', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' },
  { name: 'Frequente', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300' },
  { name: 'Inativa', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300' },
  { name: 'Extensão de cílios', color: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-300' },
  { name: 'Micropigmentação', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300' },
  { name: 'Lábios', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300' },
];

export const TEMPLATE_VARIABLES = [
  { tag: '{{cliente}}', description: 'Nome da cliente' },
  { tag: '{{data}}', description: 'Data do atendimento (ex: 10/09/2026)' },
  { tag: '{{hora}}', description: 'Horário do atendimento (ex: 14:00)' },
  { tag: '{{servico}}', description: 'Nome do serviço' },
  { tag: '{{profissional}}', description: 'Nome da profissional' },
  { tag: '{{valor}}', description: 'Valor total do atendimento' },
  { tag: '{{valor_sinal}}', description: 'Valor do sinal de reserva' },
];
