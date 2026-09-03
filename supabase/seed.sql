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
  ('c2000000-0000-0000-0000-000000000002', 'Micropigmentação', 'Sobrancelhas, shadow line, fios realistas e retoques', '#9333ea', 2),
  ('c3000000-0000-0000-0000-000000000003', 'Lábios & Revitalização', 'Neutralização labial, efeito batom e hidragloss', '#db2777', 3),
  ('c4000000-0000-0000-0000-000000000004', 'Design de Sobrancelhas', 'Design personalizado com pinça, linha e aplicação de henna', '#ca8a04', 4),
  ('c5000000-0000-0000-0000-000000000005', 'Tratamentos Faciais', 'Limpeza de pele profunda, peeling e hidratação', '#059669', 5)
ON CONFLICT (id) DO NOTHING;

-- 3. Services
INSERT INTO services (id, category_id, name, description, duration_minutes, buffer_minutes, price, promotional_price, commission_rate) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Extensão Volume Brasileiro', 'Aplicação de fios em formato Y proporcionando volume delicado e marcante.', 120, 10, 180.00, NULL, 40.00),
  ('e2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Manutenção de Cílios (até 20 dias)', 'Reposição dos fios com higienização prévia.', 90, 10, 110.00, NULL, 40.00),
  ('e3000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000002', 'Microblading Fio a Fio', 'Procedimento semipermanente para desenho natural dos fios da sobrancelha.', 150, 15, 450.00, 390.00, 50.00),
  ('e4000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000003', 'Hydra Gloss Lips', 'Hidratação profunda e regeneração labial com ácido hialurônico.', 60, 10, 150.00, NULL, 45.00),
  ('e5000000-0000-0000-0000-000000000005', 'c4000000-0000-0000-0000-000000000004', 'Design de Sobrancelha com Henna', 'Alinhamento com visagismo facial e coloração com henna de alta fixação.', 45, 10, 65.00, NULL, 40.00),
  ('e6000000-0000-0000-0000-000000000006', 'c5000000-0000-0000-0000-000000000005', 'Limpeza de Pele Profunda', 'Higienização, vapor de ozônio, extração manual, alta frequência e máscara calmante.', 90, 15, 160.00, NULL, 35.00)
ON CONFLICT (id) DO NOTHING;

-- 4. Professionals
INSERT INTO professionals (id, name, nickname, email, phone, color, specialties, commission_type, default_commission_rate) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Dra. Camila Ribeiro', 'Camila', 'camila@iasisagenda.com.br', '(11) 99111-2233', '#bf3f57', ARRAY['Micropigmentação', 'Design', 'Lábios'], 'percentage', 45.00),
  ('d2000000-0000-0000-0000-000000000002', 'Juliana Santos', 'Ju Cílios', 'juliana@iasisagenda.com.br', '(11) 99222-3344', '#7c3aed', ARRAY['Extensão de Cílios', 'Lash Lifting'], 'percentage', 40.00),
  ('d3000000-0000-0000-0000-000000000003', 'Beatriz Lima', 'Bia Estética', 'beatriz@iasisagenda.com.br', '(11) 99333-4455', '#0284c7', ARRAY['Limpeza de Pele', 'Tratamentos Faciais', 'Massagens'], 'percentage', 35.00)
ON CONFLICT (id) DO NOTHING;

-- 5. Message Templates
INSERT INTO notification_templates (id, category, title, content, is_default) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'reminder_24h', 'Lembrete de Atendimento (24h antes)', 'Olá, {{cliente}}! Tudo bem? 😊\n\nPassando para confirmar seu atendimento de amanhã, dia {{data}}, às {{hora}}, para o procedimento: *{{servico}}*.\nSeu atendimento será com {{profissional}} no endereço: Av. Paulista, 1000.\n\nPor favor, responda com *CONFIRMAR* ou nos avise caso precise reagendar!', true),
  ('f2000000-0000-0000-0000-000000000002', 'confirmation', 'Confirmação de Agendamento', 'Oi, {{cliente}}! Seu agendamento foi realizado com sucesso!\n\n📅 Data: {{data}}\n⏰ Horário: {{hora}}\n💅 Procedimento: {{servico}}\n👩‍⚕️ Profissional: {{profissional}}\n💰 Valor: R$ {{valor}}\n\nEstamos ansiosas para te receber! ✨', true),
  ('f3000000-0000-0000-0000-000000000003', 'deposit_request', 'Solicitação de Sinal de Reserva', 'Olá, {{cliente}}! Para garantir o seu horário no dia {{data}} às {{hora}}, solicitamos o envio do sinal de reserva de R$ {{valor_sinal}}.\n\nChave PIX: pix@iasisagenda.com.br\nFavorecido: IASIS Estética\n\nPor favor, nos envie o comprovante assim que realizar o pagamento. O valor será abatido no total do seu procedimento! 💕', true)
ON CONFLICT (id) DO NOTHING;
