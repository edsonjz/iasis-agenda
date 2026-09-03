-- =========================================================
-- IASIS AGENDA - MIGRATION 00003: ANAMNESIS, EVOLUTION, PHOTOS & PRODUCTS
-- =========================================================

-- 1. Anamnesis Templates (Modelos de Fichas)
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

-- 2. Anamnesis Records (Fichas Preenchidas / Histórico Imutável)
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

-- 3. Products & Consumables (Produtos Utilizados e Estoque)
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

-- 4. Treatment Evolution (Evolução Cronológica dos Procedimentos)
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

-- 5. Treatment Photos (Fotos Antes e Depois)
CREATE TABLE IF NOT EXISTS treatment_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  evolution_id UUID REFERENCES treatment_evolutions(id) ON DELETE SET NULL,
  procedure_name VARCHAR(255) NOT NULL,
  photo_type VARCHAR(30) NOT NULL DEFAULT 'before', -- 'before', 'after', 'during', 'reference'
  image_url TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE anamnesis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_photos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated staff can manage anamnesis templates" ON anamnesis_templates FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage anamnesis records" ON anamnesis_records FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage products" ON products FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage treatment evolutions" ON treatment_evolutions FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Authenticated staff can manage treatment photos" ON treatment_photos FOR ALL TO authenticated USING (TRUE);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_anamnesis_records_client ON anamnesis_records(client_id);
CREATE INDEX IF NOT EXISTS idx_treatment_evolutions_client ON treatment_evolutions(client_id);
CREATE INDEX IF NOT EXISTS idx_treatment_photos_client ON treatment_photos(client_id);
