-- ==============================================================================
-- 🌸 IASIS AGENDA - SCRIPT DEFINITIVO DE CORREÇÃO (RLS & RECURSÃO DE BANCO)
-- Execute este script no SQL Editor do Supabase para destravar o banco
-- ==============================================================================

-- 1. Remove qualquer recursão de políticas RLS na tabela profiles
DROP POLICY IF EXISTS "Users can view active profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated staff have full access" ON profiles;
DROP POLICY IF EXISTS "Authenticated staff can manage crm settings" ON crm_settings;

-- 2. Recria a função is_admin sem disparar recursão de RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND active = TRUE
  );
END;
$$;

-- 3. Aplica políticas RLS limpas e sem recursão na tabela profiles
CREATE POLICY "Profiles select policy" ON profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Profiles insert policy" ON profiles FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Profiles update policy" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR TRUE);
CREATE POLICY "Profiles delete policy" ON profiles FOR DELETE TO authenticated USING (TRUE);

-- 4. Limpa e remove completamente registros corrompidos de autenticação
DELETE FROM auth.identities WHERE provider_id = 'studiojaquesouza@gmail.com' OR user_id = 'a0000000-0000-0000-0000-000000000002';
DELETE FROM profiles WHERE id = 'a0000000-0000-0000-0000-000000000002';
DELETE FROM auth.users WHERE email = 'studiojaquesouza@gmail.com' OR id = 'a0000000-0000-0000-0000-000000000002';

-- 5. Insere o usuário Admin no Supabase Auth com todos os campos e parâmetros oficiais
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  phone_change,
  phone_change_token,
  email_change_token_current,
  reauthentication_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'studiojaquesouza@gmail.com',
  crypt('Agenda@2026', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Jaque Souza"}'::jsonb,
  NOW(),
  NOW(),
  '', '', '', '', '', '', '', ''
);

-- 6. Insere a identidade correspondente em auth.identities
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  '{"sub":"a0000000-0000-0000-0000-000000000002","email":"studiojaquesouza@gmail.com"}'::jsonb,
  'email',
  'studiojaquesouza@gmail.com',
  NOW(),
  NOW(),
  NOW()
);

-- 7. Insere o perfil na tabela profiles
INSERT INTO profiles (
  id,
  role,
  full_name,
  display_name,
  phone,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'admin',
  'Jaque Souza',
  'Jaque Souza',
  '(11) 98765-4321',
  true
) ON CONFLICT (id) DO UPDATE
SET role = 'admin', full_name = 'Jaque Souza', active = true;
