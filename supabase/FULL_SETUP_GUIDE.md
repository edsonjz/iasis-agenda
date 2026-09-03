# 🚀 GUIA DE CONFIGURAÇÃO DO BANCO SUPABASE — IASIS AGENDA

Este guia contém as instruções passo a passo para conectar e rodar todas as tabelas e políticas de segurança (RLS) no seu Supabase no login **`cartoledi10@gmail.com`**.

---

## 1. Criar o Projeto no Supabase
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard) e faça login com **cartoledi10@gmail.com**.
2. Clique em **New Project** (Novo Projeto).
3. Preencha os dados:
   - **Name**: `iasis-agenda`
   - **Database Password**: Escolha uma senha forte e guarde-a com segurança.
   - **Region**: `South America (São Paulo) - sa-east-1`
   - **Pricing Plan**: Free (Gratuito).
4. Clique em **Create new project** e aguarde cerca de 1 a 2 minutos até o status ficar `Active`.

---

## 2. Executar as Migrations SQL (Estrutura Completa com RLS)
No painel do Supabase, clique no menu lateral **SQL Editor** > **New query** e execute os arquivos de migration localizados na pasta `supabase/migrations/` na seguinte ordem:

1. `supabase/migrations/00001_initial_schema.sql` (Tabelas de Perfis, Serviços, Profissionais, Clientes, Agendamentos, Lembretes)
2. `supabase/migrations/00002_rls_policies.sql` (Políticas de Segurança e Acesso por Perfil)
3. `supabase/migrations/00003_anamnesis_evolution_photos.sql` (Fichas de Anamnese, Construtor, Evoluções, Fotos e Produtos)
4. `supabase/migrations/00004_financial_packages_loyalty.sql` (Financeiro, Caixa, Comissões, Pacotes, Promoções e Fidelidade)
5. `supabase/seed.sql` (Opcional — Dados iniciais e modelos de teste)

---

## 3. Conectar a Aplicação com suas Chaves
No painel do Supabase, vá em **Project Settings** (ícone de engrenagem) > **API**:
1. Copie o **Project URL** (`https://xxxxxxxxxxxx.supabase.co`).
2. Copie a chave **anon public** (`eyJhbGci...`).
3. Abra o arquivo `.env` na raiz de `iasis-agenda` e configure:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

4. Pronto! O IASIS AGENDA se conectará automaticamente ao seu banco Postgres na nuvem com autenticação segura. Caso as variáveis de ambiente não estejam preenchidas, o sistema continuará funcionando perfeitamente no modo demonstração local com armazenamento reativo no navegador.
