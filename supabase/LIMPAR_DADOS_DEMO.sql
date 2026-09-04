-- ==============================================================================
-- 🌸 IASIS AGENDA - LIMPEZA DE DADOS FICTÍCIOS NO SUPABASE
-- ==============================================================================
-- ATENÇÃO:
-- 1. Este script remove APENAS os dados fictícios inseridos pelo script de demonstração.
-- 2. Clientes cadastrados ou importados via arquivo Excel NÃO SÃO REMOVIDOS.
-- 3. Deixa apenas a Profissional e Administradora Jaque Souza (studiojaquesouza@gmail.com).
-- ==============================================================================

BEGIN;

-- 1. Limpar Agendamentos de Demonstração
DELETE FROM appointments
WHERE id IN (
  'aa100000-0000-0000-0000-000000000001',
  'aa200000-0000-0000-0000-000000000002',
  'aa300000-0000-0000-0000-000000000003',
  'aa400000-0000-0000-0000-000000000004',
  'aa500000-0000-0000-0000-000000000005'
) OR client_id IN (
  'b1000000-0000-0000-0000-000000000001',
  'b2000000-0000-0000-0000-000000000002',
  'b3000000-0000-0000-0000-000000000003',
  'b4000000-0000-0000-0000-000000000004',
  'b5000000-0000-0000-0000-000000000005',
  'b6000000-0000-0000-0000-000000000006'
);

-- 2. Limpar Transações Financeiras de Demonstração
DELETE FROM financial_transactions
WHERE id IN (
  'fa100000-0000-0000-0000-000000000001',
  'fa200000-0000-0000-0000-000000000002',
  'fa300000-0000-0000-0000-000000000003',
  'fa400000-0000-0000-0000-000000000004',
  'fa500000-0000-0000-0000-000000000005'
);

-- 3. Limpar Comissões de Demonstração
DELETE FROM commission_records
WHERE id LIKE 'ce1%' OR professional_id IN (
  'd1000000-0000-0000-0000-000000000001',
  'd2000000-0000-0000-0000-000000000002',
  'd3000000-0000-0000-0000-000000000003'
);

-- 4. Limpar CRM, Follow-ups e Recuperação de Demonstração
DELETE FROM client_follow_ups
WHERE id IN (
  'cd100000-0000-0000-0000-000000000001',
  'cd200000-0000-0000-0000-000000000002',
  'cd300000-0000-0000-0000-000000000003'
);

-- 5. Limpar Fidelidade (Loyalty) de Demonstração
DELETE FROM loyalty_accounts
WHERE id IN (
  'cc100000-0000-0000-0000-000000000001',
  'cc200000-0000-0000-0000-000000000002',
  'cc300000-0000-0000-0000-000000000003'
) OR client_id IN (
  'b1000000-0000-0000-0000-000000000001',
  'b2000000-0000-0000-0000-000000000002',
  'b3000000-0000-0000-0000-000000000003',
  'b4000000-0000-0000-0000-000000000004',
  'b5000000-0000-0000-0000-000000000005',
  'b6000000-0000-0000-0000-000000000006'
);

-- 6. Limpar Pacotes e Sessões de Demonstração
DELETE FROM client_packages
WHERE id = 'cb100000-0000-0000-0000-000000000001'
   OR client_id IN (
     'b1000000-0000-0000-0000-000000000001',
     'b2000000-0000-0000-0000-000000000002',
     'b3000000-0000-0000-0000-000000000003',
     'b4000000-0000-0000-0000-000000000004',
     'b5000000-0000-0000-0000-000000000005',
     'b6000000-0000-0000-0000-000000000006'
   );

DELETE FROM packages
WHERE id IN (
  'ca100000-0000-0000-0000-000000000001',
  'ca200000-0000-0000-0000-000000000002'
);

-- 7. Limpar Produtos de Estoque de Demonstração
DELETE FROM products
WHERE id IN (
  'ba100000-0000-0000-0000-000000000001',
  'ba200000-0000-0000-0000-000000000002',
  'ba300000-0000-0000-0000-000000000003',
  'ba400000-0000-0000-0000-000000000004'
);

-- 8. Limpar Caixas e Movimentações Fictícias
DELETE FROM cash_movements WHERE cash_register_id LIKE 'cr-%';
DELETE FROM cash_registers WHERE id LIKE 'cr-%';

-- 9. Limpar APENAS os 6 Clientes de Demonstração (Preservando Clientes Importados do Excel)
DELETE FROM clients
WHERE id IN (
  'b1000000-0000-0000-0000-000000000001',
  'b2000000-0000-0000-0000-000000000002',
  'b3000000-0000-0000-0000-000000000003',
  'b4000000-0000-0000-0000-000000000004',
  'b5000000-0000-0000-0000-000000000005',
  'b6000000-0000-0000-0000-000000000006'
);

-- 10. Limpar Profissionais Fictícias e Garantir Apenas Jaque Souza
DELETE FROM professionals
WHERE id IN (
  'd1000000-0000-0000-0000-000000000001',
  'd2000000-0000-0000-0000-000000000002',
  'd3000000-0000-0000-0000-000000000003'
) OR name IN ('Dra. Camila Ribeiro', 'Juliana Santos', 'Beatriz Lima');

-- Garantir que a Profissional Jaque Souza esteja cadastrada e ativa
INSERT INTO professionals (
  id,
  name,
  nickname,
  email,
  phone,
  color,
  specialties,
  commission_type,
  default_commission_rate,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Jaque Souza',
  'Jaque',
  'studiojaquesouza@gmail.com',
  '(11) 98765-4321',
  '#bf3f57',
  ARRAY['Estética Avançada', 'Micropigmentação', 'Extensão de Cílios', 'Tratamentos Faciais'],
  'percentage',
  100,
  true
) ON CONFLICT (id) DO UPDATE
SET name = 'Jaque Souza',
    nickname = 'Jaque',
    email = 'studiojaquesouza@gmail.com',
    active = true,
    color = '#bf3f57';

-- 11. Atualizar Business Settings para Studio Jaque Souza com Horário 24h
UPDATE business_settings
SET name = 'Studio Jaque Souza',
    trade_name = 'Studio Jaque Souza',
    email = 'studiojaquesouza@gmail.com',
    pix_key = 'studiojaquesouza@gmail.com',
    pix_type = 'Email',
    instagram = '@studiojaquesouza',
    business_hours = '{
      "monday": {"open": "00:00", "close": "23:59", "active": true},
      "tuesday": {"open": "00:00", "close": "23:59", "active": true},
      "wednesday": {"open": "00:00", "close": "23:59", "active": true},
      "thursday": {"open": "00:00", "close": "23:59", "active": true},
      "friday": {"open": "00:00", "close": "23:59", "active": true},
      "saturday": {"open": "00:00", "close": "23:59", "active": true},
      "sunday": {"open": "00:00", "close": "23:59", "active": true}
    }'::jsonb
WHERE id IS NOT NULL;

COMMIT;
