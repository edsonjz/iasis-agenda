-- =========================================================
-- IASIS AGENDA - MIGRATION 00005: CRM, RETENTION & FOLLOW-UP
-- =========================================================

-- 1. CRM Settings (Configurações de Relacionamento & Retenção)
CREATE TABLE IF NOT EXISTS crm_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_client_max_days INTEGER NOT NULL DEFAULT 60,
  new_client_max_appointments INTEGER NOT NULL DEFAULT 1,
  active_client_max_days INTEGER NOT NULL DEFAULT 60,
  loyal_min_appointments INTEGER NOT NULL DEFAULT 4,
  loyal_period_months INTEGER NOT NULL DEFAULT 12,
  loyal_max_gap_days INTEGER NOT NULL DEFAULT 90,
  vip_min_spent NUMERIC(10,2) NOT NULL DEFAULT 1000.00,
  vip_min_appointments INTEGER NOT NULL DEFAULT 8,
  risk_tolerance_percentage NUMERIC(5,2) NOT NULL DEFAULT 25.00,
  risk_min_days_overdue INTEGER NOT NULL DEFAULT 10,
  inactive_days INTEGER NOT NULL DEFAULT 90,
  abandoned_days INTEGER NOT NULL DEFAULT 180,
  service_configs JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Client Follow-ups (Atividades de Acompanhamento & Retorno)
CREATE TABLE IF NOT EXISTS client_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'post_procedure', 'return_maintenance', 'risk_retention', 'inactive_recovery', 'birthday', 'manual'
  reason VARCHAR(255) NOT NULL,
  recommended_date DATE NOT NULL,
  assigned_to_name VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'responded', 'booked', 'no_response', 'not_interested', 'reschedule', 'completed'
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  result TEXT,
  generated_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Client Recovery Logs (Registro de Clientes Recuperadas)
CREATE TABLE IF NOT EXISTS client_recovery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  recovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  inactive_days_count INTEGER NOT NULL,
  previous_status VARCHAR(50) NOT NULL, -- 'inativa', 'abandonou'
  procedure_name VARCHAR(255) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  professional_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_recovery_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated staff can manage crm settings" ON crm_settings FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage client follow-ups" ON client_follow_ups FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can view client recovery logs" ON client_recovery_logs FOR ALL TO authenticated USING (TRUE);
