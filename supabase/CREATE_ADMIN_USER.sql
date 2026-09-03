-- ==============================================================================
-- 🌸 IASIS AGENDA - CRIAÇÃO DO USUÁRIO ADMINISTRADOR
-- Email: studiojaquesouza@gmail.com
-- Senha Inicial: Agenda@2026
-- ==============================================================================

-- 1. Cria ou atualiza o usuário no Supabase Auth com senha encriptada em bcrypt
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
  crypt('Agenda@2026', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Jaque Souza"}',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE
SET encrypted_password = crypt('Agenda@2026', gen_salt('bf')),
    email_confirmed_at = NOW();

-- 2. Cria ou atualiza o perfil de Administradora na tabela profiles
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
