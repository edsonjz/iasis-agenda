-- ==============================================================================
-- 🌸 IASIS AGENDA - ESTRUTURA COMPLETA (SEM MEXER NO SEU LOGIN FUNCIONAL)
-- Execute este script no SQL Editor para garantir todas as 22 tabelas e dados
-- Mantém o seu login 'studiojaquesouza@gmail.com' 100% intacto e protegido!
-- ==============================================================================

-- Habilita extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tipos ENUM
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'professional', 'receptionist');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'scheduled', 'confirmed', 'in_service', 'completed', 'cancelled', 'no_show', 'rescheduled', 'blocked'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'pix', 'cash', 'credit_card', 'debit_card', 'transfer', 'other'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE financial_type AS ENUM ('income', 'expense');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Business Settings
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL DEFAULT 'Iasis Estética Avançada',
  trade_name VARCHAR(255),
  document VARCHAR(30),
  phone VARCHAR(30),
  whatsapp VARCHAR(30),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  instagram VARCHAR(100),
  pix_key VARCHAR(255),
  pix_type VARCHAR(50),
  require_deposit_by_default BOOLEAN DEFAULT FALSE,
  default_deposit_percentage NUMERIC(5,2) DEFAULT 30.00,
  default_deposit_fixed_amount NUMERIC(10,2) DEFAULT 0.00,
  business_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "18:00", "active": true}, "tuesday": {"open": "08:00", "close": "18:00", "active": true}, "wednesday": {"open": "08:00", "close": "18:00", "active": true}, "thursday": {"open": "08:00", "close": "18:00", "active": true}, "friday": {"open": "08:00", "close": "18:00", "active": true}, "saturday": {"open": "08:00", "close": "14:00", "active": true}, "sunday": {"open": "00:00", "close": "00:00", "active": false}}'::jsonb,
  inactive_client_days INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Professionals
CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(30),
  cpf VARCHAR(20),
  color VARCHAR(20) DEFAULT '#bf3f57',
  avatar_url TEXT,
  specialties TEXT[] DEFAULT '{}',
  commission_type VARCHAR(20) DEFAULT 'percentage',
  default_commission_rate NUMERIC(5,2) DEFAULT 30.00,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Professional Work Schedules
CREATE TABLE IF NOT EXISTS professional_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  break_start TIME,
  break_end TIME,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(professional_id, day_of_week)
);

-- 4. Schedule Blocks
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  reason_category VARCHAR(50) DEFAULT 'indisponivel',
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Service Categories
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT '#bf3f57',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  promotional_price NUMERIC(10,2),
  commission_rate NUMERIC(5,2),
  requires_anamnesis BOOLEAN DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  cpf VARCHAR(20),
  birth_date DATE,
  phone VARCHAR(30),
  whatsapp VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  preferred_professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  how_did_you_find_us VARCHAR(100),
  allow_contact BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  first_appointment_date DATE,
  last_appointment_date DATE,
  total_appointments INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0.00,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10,2) DEFAULT 0.00,
  final_price NUMERIC(10,2) GENERATED ALWAYS AS (price - COALESCE(discount, 0)) STORED,
  deposit_requested BOOLEAN DEFAULT FALSE,
  deposit_amount NUMERIC(10,2) DEFAULT 0.00,
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_paid_at TIMESTAMPTZ,
  payment_method payment_method,
  payment_status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  internal_notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Financial Categories & Transactions
CREATE TABLE IF NOT EXISTS financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type financial_type NOT NULL,
  color VARCHAR(20) DEFAULT '#64748b',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
  type financial_type NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_method payment_method,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date DATE,
  status VARCHAR(20) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Cash Registers & Movements
CREATE TABLE IF NOT EXISTS cash_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opened_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  closed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  initial_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  closing_expected_amount NUMERIC(10,2),
  closing_reported_amount NUMERIC(10,2),
  difference_amount NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'open',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID REFERENCES cash_registers(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Anamnesis Templates & Records
CREATE TABLE IF NOT EXISTS anamnesis_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'personalizado',
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  terms_text TEXT,
  requires_signature BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anamnesis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id UUID REFERENCES anamnesis_templates(id) ON DELETE SET NULL,
  template_title VARCHAR(255) NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  fields_snapshot JSONB NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature_data_url TEXT,
  signed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Geral',
  brand VARCHAR(100),
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  sale_price NUMERIC(10,2),
  stock_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_stock_alert NUMERIC(10,2) DEFAULT 5,
  unit VARCHAR(20) NOT NULL DEFAULT 'un',
  expiration_date DATE,
  batch_number VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Treatment Evolutions & Photos
CREATE TABLE IF NOT EXISTS treatment_evolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  procedure_name VARCHAR(255) NOT NULL,
  session_number INTEGER DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  products_used TEXT[] DEFAULT '{}',
  reaction_result TEXT,
  client_feedback TEXT,
  recommendations TEXT,
  next_session_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treatment_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  evolution_id UUID REFERENCES treatment_evolutions(id) ON DELETE SET NULL,
  procedure_name VARCHAR(255) NOT NULL,
  photo_type VARCHAR(30) NOT NULL DEFAULT 'before',
  image_url TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Packages & Usages
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name VARCHAR(255),
  total_sessions INTEGER NOT NULL DEFAULT 5 CHECK (total_sessions > 0),
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  validity_days INTEGER DEFAULT 180,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name VARCHAR(255),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  package_name VARCHAR(255) NOT NULL,
  total_sessions INTEGER NOT NULL,
  used_sessions INTEGER NOT NULL DEFAULT 0,
  price_paid NUMERIC(10,2) NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10,2) NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  min_spend NUMERIC(10,2) DEFAULT 0.00,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Loyalty & Commissions
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  cashback_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  tier VARCHAR(30) NOT NULL DEFAULT 'Bronze',
  total_earned_points INTEGER NOT NULL DEFAULT 0,
  total_cashback_earned NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commission_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  professional_name VARCHAR(255) NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  appointment_date DATE NOT NULL,
  gross_amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. CRM Settings, Follow-ups & Recovery Logs
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

CREATE TABLE IF NOT EXISTS client_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  type VARCHAR(50) NOT NULL DEFAULT 'manual',
  reason VARCHAR(255) NOT NULL,
  recommended_date DATE NOT NULL,
  assigned_to_name VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  result TEXT,
  generated_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_recovery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  recovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  inactive_days_count INTEGER NOT NULL,
  previous_status VARCHAR(50) NOT NULL,
  procedure_name VARCHAR(255) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  professional_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_recovery_logs ENABLE ROW LEVEL SECURITY;

-- Permissões globais para equipe autenticada
CREATE POLICY "Auth access business_settings" ON business_settings FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access professionals" ON professionals FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access professional_schedules" ON professional_schedules FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access schedule_blocks" ON schedule_blocks FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access service_categories" ON service_categories FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access services" ON services FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access clients" ON clients FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access appointments" ON appointments FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access notification_templates" ON notification_templates FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access financial_categories" ON financial_categories FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access financial_transactions" ON financial_transactions FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access cash_registers" ON cash_registers FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access cash_movements" ON cash_movements FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access anamnesis_templates" ON anamnesis_templates FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access anamnesis_records" ON anamnesis_records FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access products" ON products FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access treatment_evolutions" ON treatment_evolutions FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access treatment_photos" ON treatment_photos FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access packages" ON packages FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access client_packages" ON client_packages FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access promotions" ON promotions FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access loyalty_accounts" ON loyalty_accounts FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access commission_records" ON commission_records FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access crm_settings" ON crm_settings FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access client_follow_ups" ON client_follow_ups FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth access client_recovery_logs" ON client_recovery_logs FOR ALL TO authenticated USING (TRUE);

-- ==============================================================================
-- DADOS INICIAIS (SEED)
-- ==============================================================================
INSERT INTO business_settings (
  id, name, trade_name, phone, whatsapp, email, address, city, state, zip_code, instagram, pix_key, pix_type, require_deposit_by_default, default_deposit_percentage
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'IASIS Estética Avançada',
  'Studio Jaque Souza',
  '(11) 98765-4321',
  '11987654321',
  'studiojaquesouza@gmail.com',
  'Av. Paulista, 1000 - Bela Vista - Sala 42',
  'São Paulo',
  'SP',
  '01310-100',
  '@studiojaquesouza',
  'studiojaquesouza@gmail.com',
  'Email',
  true,
  30.00
) ON CONFLICT (id) DO NOTHING;

INSERT INTO service_categories (id, name, description, color, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Extensão de Cílios', 'Técnicas clássica, volume russo, híbrido e manutenção', '#bf3f57', 1),
  ('c2000000-0000-0000-0000-000000000002', 'Micropigmentação', 'Sobrancelhas, shadow line, fios realistas e retoques', '#9333ea', 2),
  ('c3000000-0000-0000-0000-000000000003', 'Lábios & Revitalização', 'Neutralização labial, efeito batom e hidragloss', '#db2777', 3),
  ('c4000000-0000-0000-0000-000000000004', 'Design de Sobrancelhas', 'Design personalizado com pinça, linha e aplicação de henna', '#ca8a04', 4),
  ('c5000000-0000-0000-0000-000000000005', 'Tratamentos Faciais', 'Limpeza de pele profunda, peeling e hidratação', '#059669', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, category_id, name, description, duration_minutes, buffer_minutes, price, promotional_price, commission_rate) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Extensão Volume Brasileiro', 'Aplicação de fios em formato Y proporcionando volume delicado e marcante.', 120, 10, 180.00, NULL, 40.00),
  ('e2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Manutenção de Cílios (até 20 dias)', 'Reposição dos fios com higienização prévia.', 90, 10, 110.00, NULL, 40.00),
  ('e3000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000002', 'Microblading Fio a Fio', 'Procedimento semipermanente para desenho natural dos fios da sobrancelha.', 150, 15, 450.00, 390.00, 50.00),
  ('e4000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000003', 'Hydra Gloss Lips', 'Hidratação profunda e regeneração labial com ácido hialurônico.', 60, 10, 150.00, NULL, 45.00),
  ('e5000000-0000-0000-0000-000000000005', 'c4000000-0000-0000-0000-000000000004', 'Design de Sobrancelha com Henna', 'Alinhamento com visagismo facial e coloração com henna de alta fixação.', 45, 10, 65.00, NULL, 40.00),
  ('e6000000-0000-0000-0000-000000000006', 'c5000000-0000-0000-0000-000000000005', 'Limpeza de Pele Profunda', 'Higienização, vapor de ozônio, extração manual, alta frequência e máscara calmante.', 90, 15, 160.00, NULL, 35.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO professionals (id, name, nickname, email, phone, color, specialties, commission_type, default_commission_rate) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Jaque Souza', 'Jaque', 'studiojaquesouza@gmail.com', '(11) 99111-2233', '#bf3f57', ARRAY['Micropigmentação', 'Design', 'Lábios'], 'percentage', 45.00),
  ('d2000000-0000-0000-0000-000000000002', 'Juliana Santos', 'Ju Cílios', 'juliana@iasisagenda.com.br', '(11) 99222-3344', '#7c3aed', ARRAY['Extensão de Cílios', 'Lash Lifting'], 'percentage', 40.00),
  ('d3000000-0000-0000-0000-000000000003', 'Beatriz Lima', 'Bia Estética', 'beatriz@iasisagenda.com.br', '(11) 99333-4455', '#0284c7', ARRAY['Limpeza de Pele', 'Tratamentos Faciais', 'Massagens'], 'percentage', 35.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO notification_templates (id, category, title, content, is_default) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'reminder_24h', 'Lembrete de Atendimento (24h antes)', 'Olá, {{cliente}}! Tudo bem? 😊\n\nPassando para confirmar seu atendimento de amanhã, dia {{data}}, às {{hora}}, para o procedimento: *{{servico}}*.\nSeu atendimento será com {{profissional}} no endereço: Av. Paulista, 1000.\n\nPor favor, responda com *CONFIRMAR* ou nos avise caso precise reagendar!', true),
  ('f2000000-0000-0000-0000-000000000002', 'confirmation', 'Confirmação de Agendamento', 'Oi, {{cliente}}! Seu agendamento foi realizado com sucesso!\n\n📅 Data: {{data}}\n⏰ Horário: {{hora}}\n💅 Procedimento: {{servico}}\n👩‍⚕️ Profissional: {{profissional}}\n💰 Valor: R$ {{valor}}\n\nEstamos ansiosas para te receber! ✨', true),
  ('f3000000-0000-0000-0000-000000000003', 'deposit_request', 'Solicitação de Sinal de Reserva', 'Olá, {{cliente}}! Para garantir o seu horário no dia {{data}} às {{hora}}, solicitamos o envio do sinal de reserva de R$ {{valor_sinal}}.\n\nChave PIX: studiojaquesouza@gmail.com\nFavorecido: Studio Jaque Souza\n\nPor favor, nos envie o comprovante assim que realizar o pagamento. O valor será abatido no total do seu procedimento! 💕', true)
ON CONFLICT (id) DO NOTHING;
