-- ==============================================================================
-- 🌸 IASIS AGENDA - BLINDAGEM DE SEGURANÇA DEFINITIVA & KEEP-ALIVE CRON
-- ==============================================================================
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- 
-- O que este script faz:
-- 1. Revoga TODOS os acessos anônimos públicos (anon), protegendo contra vazamentos.
-- 2. Concede permissão estrita apenas para usuários autenticados (authenticated).
-- 3. Cria a função de checagem de privilégio admin (is_admin).
-- 4. Cria um gatilho para bloquear auto-escalonamento de privilégios (role injection).
-- 5. Configura RLS granular diferenciando:
--    - Finanças e Configurações: Apenas administradores podem alterar ou deletar.
--    - Operação diária (Agendamentos, Clientes, Anamnese): Equipe autenticada.
-- 6. Configura a extensão pg_cron para executar consulta periódica no próprio banco.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. REVOGAR ACESSO PÚBLICO (ANON)
-- ------------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon;

-- ------------------------------------------------------------------------------
-- 2. GARANTIR ACESSO CONTROLADO PARA USUÁRIOS AUTENTICADOS
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

-- ------------------------------------------------------------------------------
-- 3. FUNÇÃO SEGURA DE ADMIN (is_admin)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND active = TRUE
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. GATILHO: IMPEDIR QUE USUÁRIO COMUM MUDE SUA PRÓPRIA ROLE PARA ADMIN
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Se o campo role está sendo alterado e o executor NÃO é admin
  IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar permissões de usuário.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();

-- ------------------------------------------------------------------------------
-- 5. POLÍTICAS RLS PARA A TABELA PROFILES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_access_policy" ON public.profiles;
DROP POLICY IF EXISTS "Public and Auth Full Access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;

-- Qualquer membro logado da equipe pode visualizar os perfis dos colegas
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (TRUE);

-- Criação de perfil no primeiro login (apenas para o próprio ID)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR public.is_admin());

-- Usuário pode atualizar seu próprio nome/telefone, Admin pode atualizar qualquer um
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());

-- Apenas admin pode excluir perfis
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. POLÍTICAS RLS: TABELAS FINANCEIRAS & CRÍTICAS (Restritas a Admin)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  fin_tbl text;
  fin_tables text[] := ARRAY[
    'financial_transactions',
    'financial_categories',
    'cash_registers',
    'cash_movements',
    'commission_records',
    'business_settings',
    'audit_logs'
  ];
BEGIN
  FOREACH fin_tbl IN ARRAY fin_tables LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = fin_tbl) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', fin_tbl);
      
      -- Remove quaisquer políticas antigas
      EXECUTE format('DROP POLICY IF EXISTS "authenticated_access_policy" ON public.%I;', fin_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Public and Auth Full Access %I" ON public.%I;', fin_tbl, fin_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Public and Auth Full Access" ON public.%I;', fin_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "staff_read" ON public.%I;', fin_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "admin_manage" ON public.%I;', fin_tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'staff_read_' || fin_tbl, fin_tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'admin_manage_' || fin_tbl, fin_tbl);

      -- Leitura para equipe autenticada
      EXECUTE format('CREATE POLICY "staff_read" ON public.%I FOR SELECT TO authenticated USING (TRUE);', fin_tbl);
      
      -- Modificações (INSERT, UPDATE, DELETE) restritas estritamente ao Administrador
      EXECUTE format('CREATE POLICY "admin_manage" ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());', fin_tbl);
    END IF;
  END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 7. POLÍTICAS RLS: TABELAS OPERACIONAIS DO DIA A DIA
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  op_tbl text;
  op_tables text[] := ARRAY[
    'clients',
    'appointments',
    'appointment_status_history',
    'professionals',
    'professional_schedules',
    'schedule_blocks',
    'service_categories',
    'services',
    'professional_services',
    'products',
    'anamnesis_templates',
    'anamnesis_records',
    'treatment_evolutions',
    'treatment_photos',
    'packages',
    'client_packages',
    'promotions',
    'loyalty_accounts',
    'crm_settings',
    'client_follow_ups',
    'client_recovery_logs',
    'notification_templates'
  ];
BEGIN
  FOREACH op_tbl IN ARRAY op_tables LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = op_tbl) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', op_tbl);
      
      -- Remove políticas legadas
      EXECUTE format('DROP POLICY IF EXISTS "authenticated_access_policy" ON public.%I;', op_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Public and Auth Full Access %I" ON public.%I;', op_tbl, op_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Public and Auth Full Access" ON public.%I;', op_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "staff_operational" ON public.%I;', op_tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'staff_operational_' || op_tbl, op_tbl);

      -- Concede acesso operacional para qualquer membro autenticado com login válido
      EXECUTE format('CREATE POLICY "staff_operational" ON public.%I FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);', op_tbl);
    END IF;
  END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 8. GARANTIR A CONTA ADMINISTRADORA DA JAQUE SOUZA
-- ------------------------------------------------------------------------------
UPDATE public.profiles
SET role = 'admin',
    active = TRUE,
    full_name = 'Jaque Souza',
    display_name = 'Jaque Souza'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'studiojaquesouza@gmail.com'
);

-- ------------------------------------------------------------------------------
-- 9. CRON INTERNO (pg_cron) PARA KEEP-ALIVE DENTRO DO POSTGRESQL
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- Tenta habilitar a extensão pg_cron se estiver disponível
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  
  -- Remove agendamento anterior se houver
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'keep_supabase_alive';

  -- Agenda query a cada 2 dias às 04:00 da manhã
  PERFORM cron.schedule(
    'keep_supabase_alive',
    '0 4 */2 * *',
    'SELECT count(*) FROM public.business_settings;'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Caso a extensão pg_cron requeira ativação pelo painel Supabase -> Database -> Extensions
    RAISE NOTICE 'pg_cron requer ativação no painel Database -> Extensions ou já está em uso.';
END $$;

-- ------------------------------------------------------------------------------
-- 10. FUNÇÃO RPC KEEP-ALIVE (Permite ping leve externo sem expor dados)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.keep_alive()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'status', 'online',
    'app', 'IASIS AGENDA',
    'timestamp', now()
  );
$$;

GRANT EXECUTE ON FUNCTION public.keep_alive() TO anon, authenticated;

-- Notificação de Conclusão
SELECT '✅ Blindagem RLS, permissões RBAC e Keep-Alive aplicados com sucesso!' AS resultado;
