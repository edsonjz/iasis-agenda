-- ==============================================================================
-- 🌸 IASIS AGENDA - POPULAR DADOS DEMONSTRATIVOS PARA TESTES (SEED COMPLETO)
-- Execute este script no SQL Editor do Supabase para ter todos os clientes,
-- agendamentos, financeiro, pacotes, produtos e CRM prontos para demonstração!
-- ==============================================================================

-- 1. CLIENTES DEMONSTRATIVOS
INSERT INTO clients (
  id, name, nickname, cpf, birth_date, phone, whatsapp, email, address, city, state, zip_code,
  preferred_professional_id, how_did_you_find_us, allow_contact, tags, notes,
  first_appointment_date, last_appointment_date, total_appointments, total_spent, active
) VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'Mariana Alcantara',
    'Mari',
    '123.456.789-01',
    '1994-05-14',
    '(11) 98877-6655',
    '11988776655',
    'mariana.alcantara@gmail.com',
    'Rua Augusta, 500 - Consolação',
    'São Paulo',
    'SP',
    '01305-000',
    'd2000000-0000-0000-0000-000000000002',
    'Instagram',
    true,
    ARRAY['VIP', 'Extensão de Cílios'],
    'Prefere cílios com efeito fox eyes e não gosta de cola com odor forte.',
    CURRENT_DATE - INTERVAL '180 days',
    CURRENT_DATE,
    6,
    1080.00,
    true
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'Fernanda Souza Costa',
    'Nanda',
    '234.567.890-12',
    '1988-11-23',
    '(11) 97766-5544',
    '11977665544',
    'nandacosta@hotmail.com',
    'Alameda Santos, 1200 - Jardins',
    'São Paulo',
    'SP',
    '01418-100',
    'd1000000-0000-0000-0000-000000000001',
    'Indicação de amiga',
    true,
    ARRAY['Frequente', 'Micropigmentação'],
    'Pele sensível na região das sobrancelhas.',
    CURRENT_DATE - INTERVAL '150 days',
    CURRENT_DATE - INTERVAL '1 day',
    4,
    1250.00,
    true
  ),
  (
    'b3000000-0000-0000-0000-000000000003',
    'Carolina Oliveira Martins',
    'Carol',
    '345.678.901-23',
    '2001-09-08',
    '(11) 96655-4433',
    '11966554433',
    'carol.martins@outlook.com',
    'Rua Vergueiro, 800 - Paraíso',
    'São Paulo',
    'SP',
    '04101-000',
    'd1000000-0000-0000-0000-000000000001',
    'Google',
    true,
    ARRAY['Nova cliente'],
    'Primeira experiência com extensões de cílios.',
    CURRENT_DATE,
    CURRENT_DATE,
    1,
    180.00,
    true
  ),
  (
    'b4000000-0000-0000-0000-000000000004',
    'Patricia Guimarães',
    'Paty',
    '456.789.012-34',
    '1982-03-30',
    '(11) 95544-3322',
    '11955443322',
    'paty.guimaraes@yahoo.com.br',
    'Rua Oscar Freire, 950 - Cerqueira César',
    'São Paulo',
    'SP',
    '01426-001',
    'd1000000-0000-0000-0000-000000000001',
    'Instagram',
    true,
    ARRAY['VIP', 'Lábios'],
    'Ama Hydra Gloss e faz manutenção mensal pontualmente.',
    CURRENT_DATE - INTERVAL '240 days',
    CURRENT_DATE + INTERVAL '1 day',
    8,
    1420.00,
    true
  ),
  (
    'b5000000-0000-0000-0000-000000000005',
    'Juliana Moreira Neves',
    'Ju',
    '567.890.123-45',
    '1990-12-19',
    '(11) 94433-2211',
    '11944332211',
    'ju.neves@uol.com.br',
    'Av. Brigadeiro Luís Antônio, 2300',
    'São Paulo',
    'SP',
    '01402-000',
    'd3000000-0000-0000-0000-000000000003',
    'Passou em frente',
    true,
    ARRAY['Inativa'],
    'Cliente sem retorno há mais de 70 dias.',
    CURRENT_DATE - INTERVAL '200 days',
    CURRENT_DATE - INTERVAL '75 days',
    2,
    220.00,
    true
  ),
  (
    'b6000000-0000-0000-0000-000000000006',
    'Renata Albuquerque',
    'Rê',
    '678.901.234-56',
    '1986-07-22',
    '(11) 93322-1100',
    '11933221100',
    'renata@empresa.com.br',
    'Rua Pamplona, 450 - Jardim Paulista',
    'São Paulo',
    'SP',
    '01405-000',
    'd2000000-0000-0000-0000-000000000002',
    'Instagram',
    true,
    ARRAY['Em risco', 'Cílios'],
    'Normalmente retorna a cada 25 dias para manutenção de cílios. Está há 48 dias sem vir.',
    CURRENT_DATE - INTERVAL '120 days',
    CURRENT_DATE - INTERVAL '48 days',
    5,
    750.00,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 2. AGENDAMENTOS DEMONSTRATIVOS (Hoje, Passado e Futuro)
INSERT INTO appointments (
  id, client_id, professional_id, service_id, start_time, end_time, duration_minutes, status,
  price, discount, deposit_requested, deposit_amount, deposit_paid, deposit_paid_at,
  payment_method, payment_status, notes
) VALUES
  (
    'aa100000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'd2000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000001',
    (CURRENT_DATE + TIME '09:00:00')::timestamptz,
    (CURRENT_DATE + TIME '11:00:00')::timestamptz,
    120,
    'in_service',
    180.00,
    0.00,
    true,
    54.00,
    true,
    (CURRENT_DATE + TIME '08:30:00')::timestamptz,
    'pix',
    'paid',
    'Volume brasileiro efeito fox.'
  ),
  (
    'aa200000-0000-0000-0000-000000000002',
    'b3000000-0000-0000-0000-000000000003',
    'd1000000-0000-0000-0000-000000000001',
    'e5000000-0000-0000-0000-000000000005',
    (CURRENT_DATE + TIME '11:30:00')::timestamptz,
    (CURRENT_DATE + TIME '12:15:00')::timestamptz,
    45,
    'confirmed',
    65.00,
    0.00,
    false,
    0.00,
    false,
    NULL,
    'credit_card',
    'pending',
    'Primeira vez no design com Henna.'
  ),
  (
    'aa300000-0000-0000-0000-000000000003',
    'b4000000-0000-0000-0000-000000000004',
    'd1000000-0000-0000-0000-000000000001',
    'e4000000-0000-0000-0000-000000000004',
    (CURRENT_DATE + TIME '14:00:00')::timestamptz,
    (CURRENT_DATE + TIME '15:00:00')::timestamptz,
    60,
    'scheduled',
    150.00,
    15.00,
    true,
    45.00,
    true,
    (CURRENT_DATE - INTERVAL '1 day' + TIME '10:00:00')::timestamptz,
    'pix',
    'partially_paid',
    'Cliente VIP - Aplicação de desconto de fidelidade.'
  ),
  (
    'aa400000-0000-0000-0000-000000000004',
    'b2000000-0000-0000-0000-000000000002',
    'd3000000-0000-0000-0000-000000000003',
    'e6000000-0000-0000-0000-000000000006',
    (CURRENT_DATE - INTERVAL '1 day' + TIME '15:00:00')::timestamptz,
    (CURRENT_DATE - INTERVAL '1 day' + TIME '16:30:00')::timestamptz,
    90,
    'completed',
    160.00,
    0.00,
    false,
    0.00,
    true,
    (CURRENT_DATE - INTERVAL '1 day' + TIME '16:30:00')::timestamptz,
    'debit_card',
    'paid',
    'Sessão de limpeza concluída com sucesso. Pele bem hidratada.'
  ),
  (
    'aa500000-0000-0000-0000-000000000005',
    'b4000000-0000-0000-0000-000000000004',
    'd1000000-0000-0000-0000-000000000001',
    'e3000000-0000-0000-0000-000000000003',
    (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00')::timestamptz,
    (CURRENT_DATE + INTERVAL '1 day' + TIME '12:30:00')::timestamptz,
    150,
    'confirmed',
    390.00,
    0.00,
    true,
    117.00,
    true,
    (CURRENT_DATE + TIME '09:00:00')::timestamptz,
    'pix',
    'partially_paid',
    'Retoque anual Microblading.'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. CATEGORIAS FINANCEIRAS
INSERT INTO financial_categories (id, name, type, color) VALUES
  ('fc100000-0000-0000-0000-000000000001', 'Procedimentos & Atendimentos', 'income', '#10b981'),
  ('fc200000-0000-0000-0000-000000000002', 'Venda de Produtos Home Care', 'income', '#06b6d4'),
  ('fc300000-0000-0000-0000-000000000003', 'Sinais de Reserva (PIX)', 'income', '#8b5cf6'),
  ('fc400000-0000-0000-0000-000000000004', 'Insumos e Cosméticos', 'expense', '#ef4444'),
  ('fc500000-0000-0000-0000-000000000005', 'Aluguel e Infraestrutura', 'expense', '#f97316'),
  ('fc600000-0000-0000-0000-000000000006', 'Comissões da Equipe', 'expense', '#ec4899')
ON CONFLICT (id) DO NOTHING;

-- 4. TRANSAÇÕES FINANCEIRAS
INSERT INTO financial_transactions (
  id, appointment_id, client_id, professional_id, category_id, type, description, amount, payment_method, paid_at, status
) VALUES
  (
    'ft100000-0000-0000-0000-000000000001',
    'aa400000-0000-0000-0000-000000000004',
    'b2000000-0000-0000-0000-000000000002',
    'd3000000-0000-0000-0000-000000000003',
    'fc100000-0000-0000-0000-000000000001',
    'income',
    'Atendimento - Limpeza de Pele Profunda (Fernanda Costa)',
    160.00,
    'debit_card',
    CURRENT_DATE - INTERVAL '1 day',
    'completed'
  ),
  (
    'ft200000-0000-0000-0000-000000000002',
    'aa100000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'd2000000-0000-0000-0000-000000000002',
    'fc300000-0000-0000-0000-000000000003',
    'income',
    'Sinal de Reserva 30% PIX - Extensão Cílios (Mariana Alcantara)',
    54.00,
    'pix',
    CURRENT_DATE,
    'completed'
  ),
  (
    'ft300000-0000-0000-0000-000000000003',
    'aa500000-0000-0000-0000-000000000005',
    'b4000000-0000-0000-0000-000000000004',
    'd1000000-0000-0000-0000-000000000001',
    'fc300000-0000-0000-0000-000000000003',
    'income',
    'Sinal de Reserva 30% PIX - Microblading (Patricia Guimarães)',
    117.00,
    'pix',
    CURRENT_DATE,
    'completed'
  ),
  (
    'ft400000-0000-0000-0000-000000000004',
    NULL,
    NULL,
    NULL,
    'fc400000-0000-0000-0000-000000000004',
    'expense',
    'Compra de fios Nagaraku, pinças de precisão e adesivos',
    340.00,
    'credit_card',
    CURRENT_DATE - INTERVAL '3 days',
    'completed'
  ),
  (
    'ft500000-0000-0000-0000-000000000005',
    NULL,
    NULL,
    NULL,
    'fc500000-0000-0000-0000-000000000005',
    'expense',
    'Condomínio e Energia da Clínica',
    580.00,
    'transfer',
    CURRENT_DATE - INTERVAL '5 days',
    'completed'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. PRODUTOS & ESTOQUE
INSERT INTO products (
  id, name, category, brand, cost_price, sale_price, stock_quantity, min_stock_alert, unit
) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'Espuma Higienizadora Lash Cleanse 150ml', 'Home Care', 'Lash Beauty', 22.00, 55.00, 14, 5, 'un'),
  ('p2000000-0000-0000-0000-000000000002', 'Sérum Regenerador Labial com Ácido Hialurônico', 'Home Care', 'DermaSkin', 35.00, 89.00, 8, 4, 'un'),
  ('p3000000-0000-0000-0000-000000000003', 'Kit Fios Nagaraku Volume Russo 0.07 Mix', 'Cabine', 'Nagaraku', 28.00, 0.00, 22, 6, 'un'),
  ('p4000000-0000-0000-0000-000000000004', 'Pigmento RB Kollors Castanho Escuro 15ml', 'Cabine', 'RB Kollors', 140.00, 0.00, 3, 2, 'un')
ON CONFLICT (id) DO NOTHING;

-- 6. PACOTES DE PROCEDIMENTOS
INSERT INTO packages (
  id, name, description, total_sessions, price, validity_days
) VALUES
  ('pk100000-0000-0000-0000-000000000001', 'Combo Retorno Cílios (4 Manutenções)', 'Pacote mensal de manutenção de cílios com desconto exclusivo.', 4, 380.00, 120),
  ('pk200000-0000-0000-0000-000000000002', 'Tratamento Facial Completo (3 Sessões)', 'Limpeza profunda + Peeling de diamante + Hidratação intensiva.', 3, 420.00, 90)
ON CONFLICT (id) DO NOTHING;

INSERT INTO client_packages (
  id, client_id, client_name, package_id, package_name, total_sessions, used_sessions, price_paid, expires_at, status
) VALUES
  (
    'cp100000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'Mariana Alcantara',
    'pk100000-0000-0000-0000-000000000001',
    'Combo Retorno Cílios (4 Manutenções)',
    4,
    2,
    380.00,
    CURRENT_DATE + INTERVAL '60 days',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- 7. FIDELIDADE (LOYALTY)
INSERT INTO loyalty_accounts (
  id, client_id, points_balance, cashback_balance, tier, total_earned_points, total_cashback_earned
) VALUES
  ('ly100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 450, 45.00, 'Ouro', 600, 60.00),
  ('ly200000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 280, 28.00, 'Prata', 350, 35.00),
  ('ly300000-0000-0000-0000-000000000003', 'b4000000-0000-0000-0000-000000000004', 620, 62.00, 'Ouro', 850, 85.00)
ON CONFLICT (client_id) DO NOTHING;

-- 8. FOLLOW-UPS & CRM RETENÇÃO
INSERT INTO client_follow_ups (
  id, client_id, client_name, client_phone, type, reason, recommended_date, assigned_to_name, status, recommended_message
) VALUES
  (
    'fu100000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000002',
    'Fernanda Souza Costa',
    '(11) 97766-5544',
    'pos_atendimento',
    'Acompanhamento de 24h pós Limpeza de Pele Profunda',
    CURRENT_DATE,
    'Beatriz Lima',
    'pending',
    'Olá Fernanda! Como está se sentindo após a limpeza de ontem? Sua pele ficou calma? Lembre-se de beber bastante água e usar protetor solar! ✨'
  ),
  (
    'fu200000-0000-0000-0000-000000000002',
    'b6000000-0000-0000-0000-000000000006',
    'Renata Albuquerque',
    '(11) 93322-1100',
    'risco_abandono',
    'Cliente em risco de abandono (48 dias sem retorno para manutenção de cílios)',
    CURRENT_DATE,
    'Juliana Santos',
    'pending',
    'Oi Rê! Sentimos sua falta aqui no estúdio! Seus cílios já devem estar precisando de um retoque. Vamos garantir um horário para você nesta semana?'
  ),
  (
    'fu300000-0000-0000-0000-000000000005',
    'b5000000-0000-0000-0000-000000000005',
    'Juliana Moreira Neves',
    '(11) 94433-2211',
    'resgate_inativa',
    'Cliente inativa há 75 dias - Oferecer cupom de boas-vindas de retorno',
    CURRENT_DATE,
    'Jaque Souza',
    'pending',
    'Olá Juliana! Temos um presente especial de 15% de desconto para sua próxima visita. Que tal agendarmos uma sessão de autocuidado? 💕'
  )
ON CONFLICT (id) DO NOTHING;

-- 9. COMISSÕES DA EQUIPE
INSERT INTO commission_records (
  id, professional_id, professional_name, client_name, service_name, appointment_date, gross_amount, commission_rate, commission_amount, status
) VALUES
  (
    'cm100000-0000-0000-0000-000000000001',
    'd3000000-0000-0000-0000-000000000003',
    'Beatriz Lima',
    'Fernanda Souza Costa',
    'Limpeza de Pele Profunda',
    CURRENT_DATE - INTERVAL '1 day',
    160.00,
    35.00,
    56.00,
    'pending'
  )
ON CONFLICT (id) DO NOTHING;
