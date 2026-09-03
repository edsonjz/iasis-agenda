-- =========================================================
-- IASIS AGENDA - MIGRATION 00004: FINANCIAL, PACKAGES, LOYALTY & PROMOTIONS
-- =========================================================

-- 1. Packages (Pacotes de Procedimentos)
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

-- 2. Client Packages (Pacotes Adquiridos pelas Clientes)
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
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'expired'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Package Usages (Sessões Utilizadas do Pacote)
CREATE TABLE IF NOT EXISTS package_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_package_id UUID NOT NULL REFERENCES client_packages(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  session_number INTEGER NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- 4. Promotions & Coupons (Promoções e Cupons)
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
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

-- 5. Loyalty Accounts (Programa de Fidelidade e Cashback)
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  cashback_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  tier VARCHAR(30) NOT NULL DEFAULT 'Bronze', -- 'Bronze', 'Prata', 'Ouro', 'VIP'
  total_earned_points INTEGER NOT NULL DEFAULT 0,
  total_cashback_earned NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'earn', -- 'earn', 'redeem', 'adjust'
  points INTEGER DEFAULT 0,
  cashback_amount NUMERIC(10,2) DEFAULT 0.00,
  description VARCHAR(255) NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Commission Records (Comissões Calculadas)
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
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid'
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated staff can manage packages" ON packages FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage client packages" ON client_packages FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage package usages" ON package_usages FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage promotions" ON promotions FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage loyalty accounts" ON loyalty_accounts FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage loyalty transactions" ON loyalty_transactions FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage commissions" ON commission_records FOR ALL TO authenticated USING (TRUE);
