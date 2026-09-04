// Re-export anamnesis, finance and CRM types
export * from './anamnesis';
export * from './finance';
export * from './crm';

// =========================================================
// IASIS AGENDA - CORE TYPES
// =========================================================

export type UserRole = 'admin' | 'professional' | 'receptionist';

export interface Profile {
  id: string;
  business_id?: string;
  role: UserRole;
  full_name: string;
  display_name?: string;
  phone?: string;
  avatar_url?: string;
  active: boolean;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  name: string;
  trade_name?: string;
  document?: string;
  phone?: string;
  whatsapp: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  instagram?: string;
  pix_key?: string;
  pix_type?: string;
  require_deposit_by_default: boolean;
  default_deposit_percentage: number;
  default_deposit_fixed_amount: number;
  business_hours: {
    [key: string]: {
      open: string;
      close: string;
      active: boolean;
    };
  };
  inactive_client_days: number;
}

export interface Professional {
  id: string;
  profile_id?: string;
  name: string;
  nickname?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  color: string;
  avatar_url?: string;
  specialties: string[];
  commission_type: 'percentage' | 'fixed';
  default_commission_rate: number;
  active: boolean;
  created_at?: string;
}

export interface ProfessionalSchedule {
  id: string;
  professional_id: string;
  day_of_week: number; // 0 = Dom, 1 = Seg, ... 6 = Sab
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  break_start?: string;
  break_end?: string;
  is_active: boolean;
}

export interface ScheduleBlock {
  id: string;
  professional_id?: string;
  title: string;
  reason_category: 'almoco' | 'compromisso' | 'ferias' | 'manutencao' | 'outro';
  start_datetime: string; // ISO String
  end_datetime: string;
  all_day: boolean;
  notes?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  sort_order: number;
  active: boolean;
}

export interface Service {
  id: string;
  category_id?: string;
  category?: ServiceCategory;
  name: string;
  description?: string;
  duration_minutes: number;
  buffer_minutes: number;
  price: number;
  promotional_price?: number;
  commission_rate?: number;
  requires_anamnesis: boolean;
  recommended_return_days?: number;
  post_procedure_followup_days?: number;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  nickname?: string;
  cpf?: string;
  birth_date?: string; // YYYY-MM-DD
  phone?: string;
  whatsapp: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  preferred_professional_id?: string;
  how_did_you_find_us?: string;
  allow_contact: boolean;
  tags: string[];
  notes?: string;
  first_appointment_date?: string;
  last_appointment_date?: string;
  total_appointments: number;
  total_spent: number;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled'
  | 'blocked';

export type PaymentMethod =
  | 'pix'
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'transfer'
  | 'other';

export interface Appointment {
  id: string;
  client_id: string;
  client?: Client;
  professional_id: string;
  professional?: Professional;
  service_id: string;
  service?: Service;
  start_time: string; // ISO 8601 string
  end_time: string;   // ISO 8601 string
  duration_minutes: number;
  status: AppointmentStatus;
  price: number;
  discount: number;
  final_price: number;
  deposit_requested: boolean;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_at?: string;
  payment_method?: PaymentMethod;
  payment_status: 'pending' | 'paid' | 'partially_paid';
  notes?: string;
  internal_notes?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface NotificationTemplate {
  id: string;
  category: 'confirmation' | 'reminder_24h' | 'reminder_today' | 'post_treatment' | 'birthday' | 'inactive_client' | 'deposit_request' | 'return';
  title: string;
  content: string;
  is_default: boolean;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  active: boolean;
}

export interface FinancialTransaction {
  id: string;
  appointment_id?: string;
  client_id?: string;
  professional_id?: string;
  category_id?: string;
  category_name?: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  payment_method?: PaymentMethod;
  paid_at: string;
  due_date?: string;
  status: 'completed' | 'pending';
  notes?: string;
  created_at: string;
}

export interface DashboardMetrics {
  todayAppointmentsCount: number;
  todayRevenue: number;
  todayPendingAmount: number;
  monthRevenue: number;
  activeClientsCount: number;
  newClientsThisMonth: number;
  averageTicket: number;
  noShowRate: number;
  pendingAnamnesisCount: number;
  upcomingBirthdaysCount: number;
  inactiveClientsCount: number;
  riskClientsCount?: number;
  todayFollowUpsCount?: number;
}
