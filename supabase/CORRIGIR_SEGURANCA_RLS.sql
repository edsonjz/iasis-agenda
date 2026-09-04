-- ==============================================================================
-- 🌸 IASIS AGENDA - CORREÇÃO DE SEGURANÇA CRÍTICA & BLINDAGEM RLS
-- ==============================================================================
-- Este script revoga o acesso irrestrito do role público (anon) e garante que:
-- 1. Usuários anônimos NÃO possam ler, alterar ou apagar nenhum dado.
-- 2. Apenas usuários autenticados (authenticated) possam acessar o sistema.
-- 3. As políticas de Row Level Security (RLS) exijam login ativo (auth.uid() IS NOT NULL).
-- ==============================================================================

-- 1. Revogar todas as permissões concedidas anteriormente ao role 'anon'
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon;

-- 2. Garantir permissões de acesso ao schema público para authenticated
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

-- 3. Recriar políticas de RLS seguras para cada tabela existente
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
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl_name) THEN
      -- Habilita RLS
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl_name);
      
      -- Remove políticas antigas inseguras
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow all for anon and authenticated', tbl_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'allow_all_' || tbl_name, tbl_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'anon_all_' || tbl_name, tbl_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'auth_all_' || tbl_name, tbl_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'authenticated_access_policy', tbl_name);

      -- Cria política estrita exigindo autenticação ativa
      EXECUTE format(
        'CREATE POLICY "authenticated_access_policy" ON public.%I FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);',
        tbl_name
      );
    END IF;
  END LOOP;
END $$;

-- 4. Garantir que a administradora studiojaquesouza@gmail.com permaneça protegida
UPDATE profiles
SET role = 'admin',
    active = true,
    full_name = 'Jaque Souza',
    display_name = 'Jaque Souza'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'studiojaquesouza@gmail.com'
);
