# 🌸 IASIS AGENDA — Sistema de Gestão Interna para Estética

**IASIS AGENDA** é um software de gestão estética e beleza moderno, veloz e responsivo (PWA), projetado para controle de atendimentos, clientes, profissionais, serviços, agenda sem conflitos e financeiro.

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18 / 19** + **TypeScript**
- **Vite** (Build ultrarrápido)
- **Tailwind CSS** (Design system moderno no estilo SaaS premium)
- **Lucide Icons**
- **date-fns** (Manipulação de datas e fusos horários brasileiros `America/Sao_Paulo`)
- **PWA (Progressive Web App)** — pronto para instalação no celular

### Backend & Banco de Dados
- **Supabase (PostgreSQL)**
- **Supabase Auth** (Autenticação e controle de perfis)
- **Row Level Security (RLS)** ativa em todas as tabelas
- **Storage seguro** para futuras fotos antes/depois e termos

---

## 📁 Estrutura do Projeto

```
iasis-agenda/
├── public/                     # Assets públicos, favicon e manifest PWA
├── src/
│   ├── components/
│   │   ├── common/             # Button, Input, Select, Modal, Badge, Card, etc.
│   │   ├── layout/             # Header, Sidebar, MobileNav, Layout
│   │   ├── agenda/             # Modal de agendamento, colisão de horários
│   │   ├── clients/            # Cadastro e perfil 360º da cliente
│   │   ├── professionals/      # Equipe e horários
│   │   └── services/           # Catálogo de serviços e categorias
│   ├── contexts/               # AuthContext, BusinessContext, ThemeContext, ToastContext
│   ├── lib/                    # Supabase client, storage sync, utils, formatters
│   ├── pages/                  # Dashboard, Agenda, Clientes, Profissionais, Serviços, Lembretes, Configurações, Login
│   └── types/                  # Tipagem estrita TypeScript
├── supabase/
│   ├── migrations/             # 00001_initial_schema.sql, 00002_rls_policies.sql
│   └── seed.sql                # Dados demonstrativos realistas
├── .env.example                # Variáveis de ambiente
├── vercel.json                 # Configuração de roteamento SPA na Vercel
└── package.json
```

---

## ⚡ Instalação e Execução Local

### 1. Clonar ou Acessar o Diretório
```bash
cd C:\Users\Acer\.gemini\antigravity\scratch\iasis-agenda
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
*(Caso ainda não tenha um projeto no Supabase, a aplicação funciona imediatamente em Modo Demonstração com persistência local).*

### 4. Executar em Desenvolvimento
```bash
npm run dev
```

### 5. Gerar Build de Produção
```bash
npm run build
```

---

## 🗄️ Configuração do Banco de Dados no Supabase

1. Crie um projeto no [Supabase Dashboard](https://supabase.com).
2. Acesse a aba **SQL Editor**.
3. Execute o script `supabase/migrations/00001_initial_schema.sql`.
4. Execute o script `supabase/migrations/00002_rls_policies.sql`.
5. *(Opcional)* Execute o script `supabase/seed.sql` para carregar dados fictícios de exemplo.
6. Copie a **Project URL** e a **Anon Public Key** das configurações de API do Supabase e cole no seu arquivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```

---

## 🌐 Deploy em Produção

### Opção 1: Vercel (Recomendado para início rápido)
1. Crie um repositório no GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit - Iasis Agenda Phase 1"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/iasis-agenda.git
   git push -u origin main
   ```
2. No painel da [Vercel](https://vercel.com), importe o repositório.
3. Adicione as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Clique em **Deploy**. O arquivo `vercel.json` já está configurado com os rewrites para SPA.

### Opção 2: Hostinger (Hospedagem Web / VPS)
Consulte o guia passo a passo em [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md).

---

## ⌨️ Atalhos de Teclado no Sistema

- `N` → Abrir modal de **Novo Agendamento**
- `C` → Cadastrar **Nova Cliente**
- `A` → Ir para a tela de **Agenda**
- `Ctrl + K` (ou `Cmd + K`) → **Busca Global Instantânea**

---

## 📄 Licença
Propriedade privada da **IASIS AGENDA**. Todos os direitos reservados.
