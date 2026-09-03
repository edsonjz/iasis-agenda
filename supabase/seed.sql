-- =========================================================
-- IASIS AGENDA - SEED DATA (DADOS DEMONSTRATIVOS)
-- =========================================================

-- 1. Business Settings
INSERT INTO business_settings (
  id, name, trade_name, phone, whatsapp, email, address, city, state, zip_code, instagram, pix_key, pix_type, require_deposit_by_default, default_deposit_percentage
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'IASIS Estética Avançada',
  'Iasis Agenda Clinic',
  '(11) 98765-4321',
  '11987654321',
  'contato@iasisagenda.com.br',
  'Av. Paulista, 1000 - Bela Vista - Sala 42',
  'São Paulo',
  'SP',
  '01310-100',
  '@iasis.estetica',
  'pix@iasisagenda.com.br',
  'Email',
  true,
  30.00
) ON CONFLICT (id) DO NOTHING;

-- 2. Service Categories
INSERT INTO service_categories (id, name, description, color, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Extensão de Cílios', 'Técnicas clássica, volume russo, híbrido e manutenção', '#bf3f57', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Micropigmentação', 'Sobrancelhas, shadow line, fios realistas e retoques', '#9333ea', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Lábios & Revitalização', 'Neutralização labial, efeito batom e hidragloss', '#db2777', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Design de Sobrancelhas', 'Design personalizado com pinça, linha e aplicação de henna', '#ca8a04', 4),
  ('c1000000-0000-0000-0000-000000000005', 'Tratamentos Faciais', 'Limpeza de pele profunda, peeling e hidratação', '#059669', 5)
ON CONFLICT (id) DO NOTHING;

-- 3. Services
INSERT INTO services (id, category_id, name, description, duration_minutes, buffer_minutes, price, promotional_price, commission_rate) VALUES
  ('s1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Extensão Volume Brasileiro', 'Aplicação de fios em formato Y proporcionando volume delicado e marcante.', 120, 10, 180.00, NULL, 40.00),
  ('s1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Manutenção de Cílios (até 20 dias)', 'Reposição dos fios com higienização prévia.', 90, 10, 110.00, NULL, 40.00),
  ('s1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'Microblading Fio a Fio', 'Procedimento semipermanente para desenho natural dos fios da sobrancelha.', 150, 15, 450.00, 390.00, 50.00),
  ('s1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 'Hydra Gloss Lips', 'Hidratação profunda e regeneração labial com ácido hialurônico.', 60, 10, 150.00, NULL, 45.00),
  ('s1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000004', 'Design de Sobrancelha com Henna', 'Alinhamento com visagismo facial e coloração com henna de alta fixação.', 45, 10, 65.00, NULL, 40.00),
  ('s1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000005', 'Limpeza de Pele Profunda', 'Higienização, vapor de ozônio, extração manual, alta frequência e máscara calmante.', 90, 15, 160.00, NULL, 35.00)
ON CONFLICT (id) DO NOTHING;

-- 4. Professionals
INSERT INTO professionals (id, name, nickname, email, phone, color, specialties, commission_type, default_commission_rate) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'Dra. Camila Ribeiro', 'Camila', 'camila@iasisagenda.com.br', '(11) 99111-2233', '#bf3f57', ARRAY['Micropigmentação', 'Design', 'Lábios'], 'percentage', 45.00),
  ('p1000000-0000-0000-0000-000000000002', 'Juliana Santos', 'Ju Cílios', 'juliana@iasisagenda.com.br', '(11) 99222-3344', '#7c3aed', ARRAY['Extensão de Cílios', 'Lash Lifting'], 'percentage', 40.00),
  ('p1000000-0000-0000-0000-000000000003', 'Beatriz Lima', 'Bia Estética', 'beatriz@iasisagenda.com.br', '(11) 99333-4455', '#0284c7', ARRAY['Limpeza de Pele', 'Tratamentos Faciais', 'Massagens'], 'percentage', 35.00)
ON CONFLICT (id) DO NOTHING;

-- 5. Professional Schedules (Segunda a Sábado)
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, break_start, break_end, is_active) VALUES
  ('p1000000-0000-0000-0000-000000000001', 1, '08:00', '18:00', '12:00', '13:00', true),
  ('p1000000-0000-0000-0000-000000000001', 2, '08:00', '18:00', '12:00', '13:00', true),
  ('p1000000-0000-0000-0000-000000000001', 3, '08:00', '18:00', '12:00', '13:00', true),
  ('p1000000-0000-0000-0000-000000000001', 4, '08:00', '18:00', '12:00', '13:00', true),
  ('p1000000-0000-0000-0000-000000000001', 5, '08:00', '18:00', '12:00', '13:00', true),
  ('p1000000-0000-0000-0000-000000000001', 6, '08:00', '14:00', NULL, NULL, true),
  ('p1000000-0000-0000-0000-000000000002', 1, '09:00', '19:00', '13:00', '14:00', true),
  ('p1000000-0000-0000-0000-000000000002', 2, '09:00', '19:00', '13:00', '14:00', true),
  ('p1000000-0000-0000-0000-000000000002', 3, '09:00', '19:00', '13:00', '14:00', true),
  ('p1000000-0000-0000-0000-000000000002', 4, '09:00', '19:00', '13:00', '14:00', true),
  ('p1000000-0000-0000-0000-000000000002', 5, '09:00', '19:00', '13:00', '14:00', true),
  ('p1000000-0000-0000-0000-000000000002', 6, '08:00', '15:00', NULL, NULL, true)
ON CONFLICT DO NOTHING;

-- 6. Clients
INSERT INTO clients (id, name, nickname, phone, whatsapp, email, birth_date, how_did_you_find_us, tags, notes, total_appointments, total_spent) VALUES
  ('u1000000-0000-0000-0000-000000000001', 'Mariana Alcantara', 'Mari', '(11) 98877-6655', '11988776655', 'mariana.alcantara@gmail.com', '1994-05-14', 'Instagram', ARRAY['VIP', 'Extensão de cílios'], 'Prefere cílios com efeito fox eyes e não gosta de cola com odor forte.', 6, 1080.00),
  ('u1000000-0000-0000-0000-000000000002', 'Fernanda Souza Costa', 'Nanda', '(11) 97766-5544', '11977665544', 'nandacosta@hotmail.com', '1988-11-23', 'Indicação de amiga', ARRAY['Frequente', 'Micropigmentação'], 'Pele oleosa na zona T. Retorno de sobrancelhas marcado a cada 1 ano.', 4, 1250.00),
  ('u1000000-0000-0000-0000-000000000003', 'Carolina Oliveira Martins', 'Carol', '(11) 96655-4433', '11966554433', 'carol.martins@outlook.com', '2001-09-08', 'Google', ARRAY['Nova cliente'], 'Primeira experiência com extensões de cílios.', 1, 180.00),
  ('u1000000-0000-0000-0000-000000000004', 'Patricia Guimarães', 'Paty', '(11) 95544-3322', '11955443322', 'paty.guimaraes@yahoo.com.br', '1982-03-30', 'Instagram', ARRAY['VIP', 'Lábios'], 'Ama Hydra Gloss e faz manutenção mensal pontualmente.', 8, 1420.00),
  ('u1000000-0000-0000-0000-000000000005', 'Juliana Moreira Neves', 'Ju', '(11) 94433-2211', '11944332211', 'ju.neves@uol.com.br', '1990-12-19', 'Passou em frente', ARRAY['Inativa'], 'Cliente sumida há mais de 70 dias.', 2, 220.00)
ON CONFLICT (id) DO NOTHING;

-- 7. Message Templates
INSERT INTO notification_templates (id, category, title, content, is_default) VALUES
  ('m1000000-0000-0000-0000-000000000001', 'reminder_24h', 'Lembrete de Atendimento (24h antes)', 'Olá, {{cliente}}! Tudo bem? 😊\n\nPassando para confirmar seu atendimento de amanhã, dia {{data}}, às {{hora}}, para o procedimento: *{{servico}}*.\nSeu atendimento será com {{profissional}} no endereço: Av. Paulista, 1000.\n\nPor favor, responda com *CONFIRMAR* ou nos avise caso precise reagendar!', true),
  ('m1000000-0000-0000-0000-000000000002', 'confirmation', 'Confirmação de Agendamento', 'Oi, {{cliente}}! Seu agendamento foi realizado com sucesso!\n\n📅 Data: {{data}}\n⏰ Horário: {{hora}}\n💅 Procedimento: {{servico}}\n👩‍⚕️ Profissional: {{profissional}}\n💰 Valor: R$ {{valor}}\n\nEstamos ansiosas para te receber! ✨', true),
  ('m1000000-0000-0000-0000-000000000003', 'deposit_request', 'Solicitação de Sinal de Reserva', 'Olá, {{cliente}}! Para garantir o seu horário no dia {{data}} às {{hora}}, solicitamos o envio do sinal de reserva de R$ {{valor_sinal}}.\n\nChave PIX: pix@iasisagenda.com.br\nFavorecido: IASIS Estética\n\nPor favor, nos envie o comprovante assim que realizar o pagamento. O valor será abatido no total do seu procedimento! 💕', true),
  ('m1000000-0000-0000-0000-000000000004', 'birthday', 'Felicitações de Aniversário', 'Parabéns, {{cliente}}! 🎂🎉\nA equipe IASIS AGENDA deseja a você um novo ciclo repleto de realizações, saúde e beleza!\n\nPreparamos um presente especial para o seu mês: *15% de desconto* em qualquer procedimento. Agende seu horário!', true),
  ('m1000000-0000-0000-0000-000000000005', 'inactive_client', 'Recuperação de Cliente Inativa', 'Olá, {{cliente}}, estamos com saudades de você aqui no espaço IASIS! ✨\n\nFaz um tempinho desde seu último procedimento de {{servico}}. Que tal renovar seus cuidados esta semana? Temos horários especiais disponíveis para você!', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Financial Categories
INSERT INTO financial_categories (id, name, type, color) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Atendimentos & Procedimentos', 'income', '#10b981'),
  ('f1000000-0000-0000-0000-000000000002', 'Sinais de Reserva', 'income', '#06b6d4'),
  ('f1000000-0000-0000-0000-000000000003', 'Venda de Produtos Home Care', 'income', '#8b5cf6'),
  ('f1000000-0000-0000-0000-000000000004', 'Aluguel & Condomínio', 'expense', '#ef4444'),
  ('f1000000-0000-0000-0000-000000000005', 'Produtos & Descartáveis', 'expense', '#f97316'),
  ('f1000000-0000-0000-0000-000000000006', 'Comissões de Profissionais', 'expense', '#ec4899'),
  ('f1000000-0000-0000-0000-000000000007', 'Marketing & Anúncios', 'expense', '#eab308')
ON CONFLICT (id) DO NOTHING;
