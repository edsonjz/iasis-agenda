-- =========================================================
-- IASIS AGENDA - MIGRATION 00001: INITIAL SCHEMA
-- PostgreSQL / Supabase Schema for Aesthetic Clinic Management
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
CREATE TYPE user_role AS ENUM ('admin', 'professional', 'receptionist');
CREATE TYPE appointment_status AS ENUM (
  'scheduled',    -- Agendado
  'confirmed',    -- Confirmado
  'in_service',   -- Em atendimento
  'completed',    -- Finalizado
  'cancelled',    -- Cancelado
  'no_show',      -- Faltou
  'rescheduled',  -- Reagendado
  'blocked'       -- Bloqueado
);
CREATE TYPE payment_method AS ENUM (
  'pix',
  'cash',
  'credit_card',
  'debit_card',
  'transfer',
  'other'
);
CREATE TYPE financial_type AS ENUM ('income', 'expense');

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Business Settings (Configurações da Estética)
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL DEFAULT 'Iasis Estética Avançada',
  trade_name VARCHAR(255),
  document VARCHAR(30), -- CNPJ / CPF
  phone VARCHAR(30),
  whatsapp VARCHAR(30),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  instagram VARCHAR(100),
  pix_key VARCHAR(255),
  pix_type VARCHAR(50), -- CPF, CNPJ, Telefone, Email, Aleatoria
  require_deposit_by_default BOOLEAN DEFAULT FALSE,
  default_deposit_percentage NUMERIC(5,2) DEFAULT 30.00,
  default_deposit_fixed_amount NUMERIC(10,2) DEFAULT 0.00,
  business_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "18:00", "active": true}, "tuesday": {"open": "08:00", "close": "18:00", "active": true}, "wednesday": {"open": "08:00", "close": "18:00", "active": true}, "thursday": {"open": "08:00", "close": "18:00", "active": true}, "friday": {"open": "08:00", "close": "18:00", "active": true}, "saturday": {"open": "08:00", "close": "14:00", "active": true}, "sunday": {"open": "00:00", "close": "00:00", "active": false}}'::jsonb,
  inactive_client_days INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles (Vínculo com Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES business_settings(id) ON DELETE SET NULL,
  role user_role NOT NULL DEFAULT 'admin',
  full_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  phone VARCHAR(30),
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Professionals (Profissionais da Estética)
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
  commission_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage' | 'fixed'
  default_commission_rate NUMERIC(5,2) DEFAULT 30.00,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Professional Work Schedules (Horários de Trabalho Semanais)
CREATE TABLE IF NOT EXISTS professional_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  break_start TIME,
  break_end TIME,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(professional_id, day_of_week)
);

-- 5. Schedule Blocks (Bloqueios de agenda: Almoço, Férias, Manutenção)
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE, -- Null se bloquear a clínica inteira
  title VARCHAR(255) NOT NULL,
  reason_category VARCHAR(50) DEFAULT 'indisponivel', -- 'almoco', 'compromisso', 'ferias', 'manutencao', 'outro'
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Service Categories (Categorias de Serviços)
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT '#bf3f57',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Services (Procedimentos / Serviços)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  promotional_price NUMERIC(10,2),
  commission_rate NUMERIC(5,2), -- Percentual específico deste serviço (opcional)
  requires_anamnesis BOOLEAN DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Professional Services (Quais serviços cada profissional realiza)
CREATE TABLE IF NOT EXISTS professional_services (
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  custom_price NUMERIC(10,2),
  custom_duration_minutes INTEGER,
  custom_commission_rate NUMERIC(5,2),
  PRIMARY KEY (professional_id, service_id)
);

-- 9. Clients (Clientes)
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

-- 10. Appointments (Agendamentos)
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
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'partially_paid'
  notes TEXT,
  internal_notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Appointment Status History (Auditoria de Status)
CREATE TABLE IF NOT EXISTS appointment_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  previous_status appointment_status,
  new_status appointment_status NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Notification / Message Templates (Biblioteca de Mensagens Prontas)
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL, -- 'confirmation', 'reminder_24h', 'reminder_today', 'post_treatment', 'birthday', 'inactive_client', 'deposit_request', 'return'
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Financial Categories & Transactions (Estrutura Financeira)
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
  status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'pending'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Cash Registers & Movements (Caixa)
CREATE TABLE IF NOT EXISTS cash_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opened_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  closed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  initial_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  closing_expected_amount NUMERIC(10,2),
  closing_reported_amount NUMERIC(10,2),
  difference_amount NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  notes TEXT
);

-- 15. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'STATUS_CHANGE', etc.
  entity VARCHAR(50) NOT NULL, -- 'appointment', 'client', 'financial', etc.
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_prof_time ON appointments(professional_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_clients_whatsapp ON clients(whatsapp);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_paid_at ON financial_transactions(paid_at);

-- Triggers for updated_at
CREATE TRIGGER trg_business_settings_updated BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_professionals_updated BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_professional_schedules_updated BEFORE UPDATE ON professional_schedules FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_schedule_blocks_updated BEFORE UPDATE ON schedule_blocks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_financial_transactions_updated BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
