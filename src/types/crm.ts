// =========================================================
// IASIS AGENDA - CRM, HISTÓRICO, COMPORTAMENTO & RETENÇÃO
// =========================================================

export type ClientRelationshipCategory =
  | 'nova'
  | 'ativa'
  | 'fiel'
  | 'vip'
  | 'em_risco'
  | 'inativa'
  | 'abandonou'
  | 'recuperada';

export type LoyaltyTier = 'baixa' | 'moderada' | 'alta' | 'excelente';

export type FollowUpStatus =
  | 'pending'
  | 'contacted'
  | 'responded'
  | 'booked'
  | 'no_response'
  | 'not_interested'
  | 'reschedule'
  | 'completed';

export type FollowUpType =
  | 'post_procedure'
  | 'return_maintenance'
  | 'risk_retention'
  | 'inactive_recovery'
  | 'birthday'
  | 'manual';

export interface ServiceReturnConfig {
  service_id: string;
  service_name: string;
  recommended_return_days: number;   // Ex: 20 dias para manutenção de cílios
  post_procedure_followup_days: number; // Ex: 7 dias para conferir cicatrização de micropigmentação
}

export interface CRMConfig {
  id: string;
  new_client_max_days: number;          // Ex: 60 dias
  new_client_max_appointments: number;  // Ex: 1 atendimento
  active_client_max_days: number;       // Ex: 60 dias
  loyal_min_appointments: number;       // Ex: 4 atendimentos
  loyal_period_months: number;          // Ex: 12 meses
  loyal_max_gap_days: number;           // Ex: 90 dias sem atendimento
  vip_min_spent: number;                // Ex: R$ 1.000,00
  vip_min_appointments: number;         // Ex: 8 atendimentos
  risk_tolerance_percentage: number;    // Ex: 25% acima do intervalo habitual da cliente
  risk_min_days_overdue: number;        // Ex: 10 dias acima do habitual
  inactive_days: number;                // Ex: 90 dias
  abandoned_days: number;               // Ex: 180 dias
  service_configs: ServiceReturnConfig[];
}

export interface ClientRecoveryLog {
  id: string;
  client_id: string;
  recovered_at: string;
  inactive_days_count: number;
  previous_status: 'inativa' | 'abandonou';
  procedure_name: string;
  amount: number;
  professional_name: string;
  created_at?: string;
}

export interface ClientFollowUp {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  type: FollowUpType;
  reason: string;
  recommended_date: string;
  assigned_to_name?: string;
  status: FollowUpStatus;
  notes?: string;
  contacted_at?: string;
  result?: string;
  generated_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface ClientBehaviorMetrics {
  first_visit_date?: string;
  last_visit_date?: string;
  next_appointment_date?: string;
  total_appointments: number;
  completed_appointments_count: number;
  cancelled_count: number;
  no_show_count: number;
  total_spent: number;
  average_ticket: number;
  top_service_name: string;
  top_professional_name: string;
  
  // Frequency & Interval Analysis
  intervals_days: number[];
  average_interval_days: number;
  min_interval_days: number;
  max_interval_days: number;
  days_since_last_visit: number;
  days_overdue: number; // Quantos dias está acima do intervalo médio pessoal
  is_overdue: boolean;
  
  // Loyalty & Relationship
  category: ClientRelationshipCategory;
  category_label: string;
  loyalty_score: number; // 0 a 100
  loyalty_tier: LoyaltyTier;
  risk_priority?: 'high' | 'medium' | 'low';
  recovery_info?: ClientRecoveryLog;
}

export interface ClientTimelineEvent {
  id: string;
  date: string; // ISO string
  type:
    | 'appointment_completed'
    | 'appointment_scheduled'
    | 'appointment_cancelled'
    | 'appointment_no_show'
    | 'payment'
    | 'anamnesis_signed'
    | 'evolution_logged'
    | 'photo_added'
    | 'package_purchased'
    | 'package_used'
    | 'promotion_used'
    | 'followup_created'
    | 'followup_contacted'
    | 'recovery';
  title: string;
  description: string;
  amount?: number;
  professional_name?: string;
  icon_type: string;
  metadata?: Record<string, any>;
}
