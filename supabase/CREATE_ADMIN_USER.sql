-- ==============================================================================
-- 🌸 IASIS AGENDA - CRIAÇÃO DO USUÁRIO ADMINISTRADOR (100% COMPATÍVEL)
-- Email: studiojaquesouza@gmail.com
-- Email: studiojaquesouza@gmail.com
-- Defina a senha desejada substituindo [DEFINA_SUA_SENHA_FORTE_AQUI] abaixo
-- ==============================================================================

-- 1. Remove registro anterior se houver para evitar conflitos de constraint
DELETE FROM auth.users WHERE email = 'studiojaquesouza@gmail.com';

-- 2. Cria o usuário no Supabase Auth com senha encriptada em Bcrypt
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
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'studiojaquesouza@gmail.com',
  crypt('[DEFINA_SUA_SENHA_FORTE_AQUI]', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Jaque Souza"}'::jsonb,
  NOW(),
  NOW()
);

-- 3. Cria ou atualiza o perfil de Administradora na tabela profiles
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
SET role = 'admin',
    full_name = 'Jaque Souza',
    display_name = 'Jaque Souza',
    active = true;
