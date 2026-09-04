-- ==============================================================================
-- 🌸 IASIS AGENDA - GARANTIR PERMISSÕES TOTAIS DE PERSISTÊNCIA (RLS & ACESSO)
-- Execute este script no SQL Editor do Supabase para garantir que:
-- 1. Qualquer usuário autenticado ou via chave pública (anon) possa criar, editar e excluir
-- 2. As permissões de agendamentos, clientes, serviços e finanças estejam 100% liberadas
-- 3. A estrutura da tabela 'appointments' esteja perfeitamente alinhada
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Garantir permissões de acesso (GRANT) no schema público para anon e authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- 3. Recriar/Garantir políticas RLS amplas para todas as tabelas
DO $$ 
DECLARE
  tbl_name text;
  tables_list text[] := ARRAY[
    'business_settings',
    'profiles',
    'professionals',
    'professional_schedules',
    'schedule_blocks',
    'service_categories',
    'services',
    'clients',
    'appointments',
    'notification_templates',
    'financial_categories',
    'financial_transactions',
    'cash_registers',
    'cash_movements',
    'anamnesis_templates',
    'anamnesis_records',
    'products',
    'treatment_evolutions',
    'treatment_photos',
    'packages',
    'client_packages',
    'promotions',
    'loyalty_accounts',
    'commission_records',
    'crm_settings',
    'client_follow_ups',
    'client_recovery_logs'
  ];
BEGIN
  FOREACH tbl_name IN ARRAY tables_list LOOP
    -- Verifica se a tabela existe
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl_name) THEN
      -- Habilita RLS
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl_name);
      
      -- Remove políticas antigas se existirem
      EXECUTE format('DROP POLICY IF EXISTS "Public and Auth Full Access %I" ON public.%I;', tbl_name, tbl_name);
      EXECUTE format('DROP POLICY IF EXISTS "Auth access %I" ON public.%I;', tbl_name, tbl_name);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated staff have full access" ON public.%I;', tbl_name);
      
      -- Cria nova política permitindo SELECT, INSERT, UPDATE, DELETE para anon e authenticated
      EXECUTE format('CREATE POLICY "Public and Auth Full Access %I" ON public.%I FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);', tbl_name, tbl_name);
    END IF;
  END LOOP;
END $$;

-- 4. Notificação de Sucesso
SELECT '✅ Todas as permissões RLS e persistência de agendamentos foram aplicadas com sucesso no IASIS AGENDA!' AS status;
