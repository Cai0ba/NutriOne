# NutriOne — Frontend

Plataforma web completa para nutricionistas e pacientes, construída com **Next.js 16 App Router**, **Material UI v9** e **TypeScript**.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução local](#instalação-e-execução-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura de Rotas](#estrutura-de-rotas)
- [Arquitetura de Componentes](#arquitetura-de-componentes)
- [Autenticação e Sessão](#autenticação-e-sessão)
- [Design System](#design-system)
- [SEO e Metadados](#seo-e-metadados)
- [Monitoramento de Erros (Sentry)](#monitoramento-de-erros-sentry)
- [Testes](#testes)
- [Deploy (Vercel)](#deploy-vercel)
- [Acesso à Plataforma](#acesso-à-plataforma)

---

## Visão Geral

O NutriOne é uma plataforma **invite-only** (acesso somente mediante convite). Não existe auto-cadastro público. O fluxo de acesso é:

1. O dono da plataforma cria a conta do nutricionista via script CLI no backend.
2. O nutricionista faz login e cadastra seus pacientes diretamente na plataforma.
3. O paciente recebe uma senha temporária e acessa o próprio painel.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| UI | Material UI v9 + Emotion |
| Ícones | Lucide React |
| Gráficos | Recharts |
| PDF | @react-pdf/renderer |
| Formulários | React Hook Form + Zod |
| Toast | Sonner |
| Monitoramento | Sentry (`@sentry/nextjs`) |
| Testes | Jest + Testing Library |
| Fonte | Geist (Google Fonts) |

---

## Pré-requisitos

- Node.js >= 20
- npm >= 10
- Backend NutriOne API rodando (local ou Render)

---

## Instalação e execução local

```bash
# 1. Clone o repositório
git clone https://github.com/Cai0ba/NutriOne.git
cd NutriOne

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# (não há .env.example no repositório: crie o .env.local manualmente
#  com as variáveis da seção abaixo)

# 4. Inicie o servidor de desenvolvimento (porta 3001)
npm run dev
```

Acesse `http://localhost:3001`.

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz com as seguintes variáveis:

```env
# URL da API backend (NutriOne API)
NEXT_PUBLIC_API_URL=http://localhost:3000

# URL base do site (metadados Open Graph, robots e sitemap)
NEXT_PUBLIC_SITE_URL=https://nutrioneapp.com.br

# Auth token do Sentry (necessário apenas para upload de source maps no build)
SENTRY_AUTH_TOKEN=
```

> O DSN do Sentry está fixo em `sentry.client.config.ts`, `sentry.server.config.ts` e `sentry.edge.config.ts`; não é lido de variável de ambiente.
> Se `NEXT_PUBLIC_API_URL` não for definida, o front usa `http://localhost:3000`.
> Em produção no Vercel, configure estas variáveis no painel **Settings → Environment Variables**.

---

## Estrutura de Rotas

### Rotas Públicas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `LandingPage` | Página de apresentação do produto; todos os CTAs apontam para o WhatsApp |
| `/login` | `LoginPage` | Formulário de login (paciente ou nutricionista) |
| `/reset-password?token=` | `ResetPasswordPage` | Redefinição de senha via token recebido por e-mail |

### Rotas do Nutricionista (protegidas — role: `nutritionist`)

| Rota | Componente | Descrição |
|---|---|---|
| `/nutritionist/dashboard` | `NutritionistDashboard` | Lista de pacientes; cadastro de novos pacientes |
| `/nutritionist/patients/[patientId]` | `PatientEvolutionPage` | Histórico de avaliações físicas do paciente |
| `/nutritionist/patients/[patientId]/diet` | `DietPlanListPage` | Lista de planos alimentares do paciente |
| `/nutritionist/patients/[patientId]/diet/new` | `DietPlanBuilder` | Criação de novo plano alimentar |
| `/nutritionist/patients/[patientId]/diet/[planId]` | `DietPlanBuilder` | Edição de plano alimentar existente |
| `/nutritionist/appointments` | `NutritionistCalendarPage` | Agenda de consultas do nutricionista |
| `/nutritionist/messages` | `NutritionistMessagesPage` | Chat com pacientes |

### Rotas do Paciente (protegidas — role: `client`)

| Rota | Componente | Descrição |
|---|---|---|
| `/home` | `PatientDashboard` | Painel inicial do paciente |
| `/home/evolution` | `PatientEvolutionView` | Histórico de avaliações físicas |
| `/home/diet` | `MealPlanListView` | Lista de planos alimentares |
| `/home/diet/[planId]` | `MealPlanViewer` | Visualização do plano + download em PDF |
| `/home/appointments` | `PatientCalendarPage` | Agenda de consultas do paciente |
| `/home/messages` | `PatientMessagesPage` | Chat com o nutricionista |

### Rotas de Sistema

| Rota | Descrição |
|---|---|
| `/sitemap.xml` | Sitemap gerado dinamicamente (`src/app/sitemap.ts`) |
| `/robots.txt` | Robots gerado dinamicamente (`src/app/robots.ts`) |
| `/opengraph-image` | Imagem Open Graph dinâmica 1200×630 (`src/app/opengraph-image.tsx`) |

---

## Arquitetura de Componentes

```
src/
├── app/                        # App Router (Next.js)
│   ├── layout.tsx              # Root layout: metadados SEO, providers MUI, fontes
│   ├── page.tsx                # / → LandingPage
│   ├── login/page.tsx          # /login → LoginPage
│   ├── reset-password/page.tsx # /reset-password → ResetPasswordPage
│   ├── home/                   # Rotas do paciente
│   └── nutritionist/           # Rotas do nutricionista
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx           # Formulário de login com tabs Paciente/Nutricionista
│   │   ├── LoginPage.tsx           # Wrapper da página de login
│   │   ├── AuthHeader.tsx          # Logo NutriOne no topo das páginas de auth
│   │   ├── ProtectedRoute.tsx      # HOC que redireciona para /login se não autenticado
│   │   ├── ForgotPasswordModal.tsx # Modal "Esqueceu a senha?" com envio de e-mail
│   │   ├── ResetPasswordPage.tsx   # Formulário de nova senha com token da URL
│   │   ├── ChangePasswordModal.tsx # Modal obrigatório no primeiro acesso
│   │   └── AccountAccessAlert.tsx  # Aviso "acesso somente mediante convite" na /login
│   │
│   ├── landing/
│   │   └── LandingPage.tsx         # Página de marketing completa (NavBar, Hero, Features,
│   │                               # HowItWorks, Benefits, CTA, Footer)
│   │
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx         # Layout do nutricionista: Drawer (desktop) +
│   │   │                               # AppBar + BottomNavigation (mobile)
│   │   ├── NutritionistDashboard.tsx   # Lista de pacientes (cards mobile / tabela desktop)
│   │   ├── PatientEvolutionPage.tsx    # Histórico de avaliações do paciente
│   │   ├── NewAssessmentModal.tsx      # Modal para nova avaliação física
│   │   ├── EditAssessmentModal.tsx     # Modal para editar avaliação existente
│   │   ├── PatientProfileModal.tsx     # Modal para ver/editar ficha do paciente
│   │   └── UserRegistrationModal.tsx   # Modal para cadastrar novo paciente
│   │
│   ├── patient/
│   │   ├── PatientLayout.tsx       # Layout do paciente: AppBar + BottomNavigation (mobile)
│   │   ├── PatientDashboard.tsx    # Painel inicial do paciente
│   │   ├── PatientEvolutionView.tsx # Avaliações físicas do paciente (cards mobile / tabela desktop)
│   │   ├── MealPlanListView.tsx    # Lista de planos alimentares do paciente
│   │   ├── MealPlanViewer.tsx      # Visualização detalhada do plano
│   │   ├── MealPlanDownloadButton.tsx # Botão de download do plano em PDF
│   │   ├── MealPlanPDF.tsx         # Template PDF (@react-pdf/renderer)
│   │   └── _PDFButtonInner.tsx     # Componente interno do botão PDF
│   │
│   ├── diet/
│   │   ├── DietPlanBuilder.tsx     # Builder completo de planos alimentares
│   │   ├── DietPlanListPage.tsx    # Lista de planos do paciente (visão nutricionista)
│   │   ├── MealCard.tsx            # Card de uma refeição dentro do plano
│   │   └── MealItemRow.tsx         # Linha de um item alimentar dentro da refeição
│   │
│   ├── appointments/
│   │   ├── NutritionistCalendarPage.tsx  # Calendário do nutricionista
│   │   ├── PatientCalendarPage.tsx       # Calendário do paciente
│   │   ├── MonthCalendar.tsx             # Componente de calendário mensal
│   │   ├── AppointmentFormModal.tsx      # Modal para criar/editar consulta
│   │   └── AppointmentDetailModal.tsx    # Modal de detalhes de uma consulta
│   │
│   ├── messages/
│   │   ├── NutritionistMessagesPage.tsx  # Chat do nutricionista (master-detail mobile)
│   │   ├── PatientMessagesPage.tsx       # Chat do paciente
│   │   └── ConversationPanel.tsx         # Painel de mensagens com input e envio
│   │
│   ├── charts/
│   │   └── MetricLineChart.tsx     # Gráfico de linha (Recharts) para métricas de evolução
│   │
│   └── common/
│       └── ConfirmDialog.tsx       # Dialog genérico de confirmação
│
├── lib/               # Camada de acesso à API (cada arquivo tem seu próprio helper de fetch)
│   ├── auth.ts        # login, register, change/forgot/reset password, my-patients,
│   │                  # getStoredToken, getStoredUser, saveSession, clearSession, getDashboardPathByRole
│   ├── patients.ts    # Ficha e avaliações físicas (visão nutricionista): /patients/:id/...
│   ├── patient-self.ts# Dados do próprio paciente: /me/profile, /me/assessments, /me/meal-plans
│   ├── diet.ts        # CRUD de planos alimentares + tipos (MealPlanSummary/Detail)
│   ├── appointments.ts# Consultas (nutricionista e paciente)
│   ├── messages.ts    # Mensagens (nutricionista e paciente), contagem de não lidas
│   ├── useUnreadMessages.ts # Hook de polling (30 s) do badge de mensagens não lidas
│   └── formatters.ts  # CPF, data de nascimento (DD/MM/AAAA ↔ ISO) e validações
│
└── app/providers.tsx  # MUI ThemeProvider + CssBaseline
```

---

## Acompanhamento e consentimento

- **Painel "Acompanhamento"** (`/nutritionist/dashboard`): mostra os pacientes que merecem contato, com nível de risco (urgente, acompanhar, em dia) e os motivos, vindos de `GET /engagement/patients`. Atalhos: mensagem (`/nutritionist/messages?patientId=…`), agendar retorno e evolução. Os limites das regras ficam no back (`engagement.rules.ts`).
- **Agenda:** novo status `faltou`; o detalhe da consulta tem "Marcar realizada" e "Faltou" para dar baixa. O nutricionista só cancela consultas agendadas.
- **Ficha do paciente:** campo "Histórico de transtorno alimentar" (só o nutricionista vê; controla recursos de jogo futuros).
- **Consentimento do paciente** (`ConsentGate`, dentro do `ProtectedRoute`): pede o termo de dados de saúde (obrigatório) e o de acompanhamento do uso do app (opcional) via `/me/consents`. **Os textos em `consentTexts.ts` são rascunho** e precisam de revisão jurídica antes de abrir para mais pacientes. A recusa do termo opcional é lembrada por aparelho (`localStorage`); ainda não há tela para revogar.
- **Modo sem números** (Preferências, ícone de engrenagem no layout do paciente): esconde peso, IMC, gordura e gráficos no início e na evolução. Estado compartilhado em `usePatientPreferences` (amarrado ao token da sessão; enquanto carrega ou se falhar, esconde).

## Autenticação e Sessão

- O token JWT e os dados do usuário são armazenados no **`localStorage`** com as chaves `nutriconnect.accessToken` e `nutriconnect.user`.
- A função `getStoredToken()` recupera o token para chamadas autenticadas à API.
- A função `getStoredUser()` retorna os dados completos do usuário (incluindo `nome`).
- `ProtectedRoute` — HOC que verifica o token e o role; redireciona para `/login` se inválido.
- No primeiro login, **pacientes** (`role: client`) com `mustChangePassword: true` são obrigados a trocar a senha via `ChangePasswordModal` antes de acessar qualquer rota. Hoje isso **não é aplicado a nutricionistas**. A flag vem do `localStorage` (o `/auth/me` devolve só o payload do JWT).
- Regras de senha: troca no primeiro acesso exige 8+ caracteres; redefinição por e-mail aceita 6+ (o backend exige 6+).
- Não há tratamento global de `401`/token expirado: a sessão só é revalidada quando uma rota protegida é aberta.

### Fluxo de Recuperação de Senha

1. Usuário clica em "Esqueceu a senha?" na `/login`.
2. `ForgotPasswordModal` coleta o e-mail e chama `POST /auth/forgot-password`.
3. O backend envia um e-mail com link para `/reset-password?token=<token>`.
4. `ResetPasswordPage` lê o token da URL e chama `POST /auth/reset-password` com a nova senha.
5. Após sucesso, redireciona para `/login` em 3 segundos.

---

## Design System

- **Cor primária:** `#10b981` (verde esmeralda) / escura: `#059669`
- **Tipografia:** Geist Sans (UI) + Geist Mono (código)
- **Breakpoints responsivos:** `xs` (mobile) / `md` (desktop, >= 900px)

### Layout Mobile-First

- **Nutricionista:** `DashboardLayout` — Drawer permanente no desktop; AppBar + `BottomNavigation` no mobile
- **Paciente:** `PatientLayout` — mesmo padrão
- **Mensagens:** padrão master-detail — lista de pacientes ou chat nunca aparecem juntos no mobile
- **Tabelas → Cards:** listas de pacientes e histórico de avaliações viram cards no mobile

---

## SEO e Metadados

Configurados em `src/app/layout.tsx`:

- `title` com template `%s | NutriOne`
- `description` e `keywords` otimizados para busca de software para nutricionistas
- Open Graph e Twitter Card completos
- Imagem OG dinâmica gerada em `src/app/opengraph-image.tsx` (1200×630, Edge Runtime)
- Favicon em `src/app/favicon.ico`
- Atenção: `layout.tsx` referencia `/og-image.png` em `openGraph.images`/`twitter.images`, arquivo que não existe em `public/`. A imagem gerada por `opengraph-image.tsx` é a válida; remover essas referências evita um link quebrado
- `robots.ts` — permite `/`; bloqueia `/home/`, `/nutritionist/`, `/api/`
- `sitemap.ts` — inclui `/` com `changeFrequency: "weekly"`

---

## Monitoramento de Erros (Sentry)

Configurado com `withSentryConfig` no `next.config.ts`. Arquivos de configuração:

| Arquivo | Contexto |
|---|---|
| `sentry.client.config.ts` | Browser — inclui Session Replay (`replaysOnErrorSampleRate: 1.0`) |
| `sentry.server.config.ts` | Node.js (Server Components, API Routes) |
| `sentry.edge.config.ts` | Edge Runtime (middleware, OG image) |

`tracesSampleRate: 0.2` — captura 20% das transações para performance.

---

## Testes

```bash
# Executar todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:cov
```

Stack: **Jest** + **Testing Library** (`@testing-library/react`) + **jest-fetch-mock**.

São **13 suítes / 177 testes**. Cobrem: `ProtectedRoute`, `ConfirmDialog`, `ConversationPanel`, calendários (`MonthCalendar`, `AppointmentFormModal` — incluindo regressão de fuso horário —, `AppointmentDetailModal`) e a camada `lib/` (`auth`, `patients`, `patient-self`, `diet`, `appointments`, `messages`, `formatters`).

> **Estado atual:** 3 testes de `ProtectedRoute.spec.tsx` estão falhando por estarem desatualizados (esperam redirecionar para `/` e o texto "Validating", mas o código redireciona para `/login` e mostra "Validando sessão..."). Além disso, `tsc` acusa 2 erros em `auth.spec.ts` e o `eslint` reporta erros de `set-state-in-effect` (regra do React Compiler) e `no-explicit-any` em specs.

---

## Deploy (Vercel)

O frontend é hospedado na **Vercel**. O deploy é automático a cada push na branch `main`. Fluxo de branches: `feature/fix` → PR para `develop` → PR de `develop` para `main`.

```bash
# Build de produção local (para validar antes do push)
npm run build
npm start
```

Configure no painel da Vercel:
- **Framework Preset:** Next.js
- **Root Directory:** `/` (raiz do repositório)
- **Environment Variables:** todas as variáveis de `.env.local` listadas acima

---

## Acesso à Plataforma

> Esta plataforma é **invite-only**. Não existe auto-cadastro público.

| Perfil | Como obter acesso |
|---|---|
| **Nutricionista** | O administrador cria a conta via script CLI no backend (`npm run create:nutritionist`) |
| **Paciente** | O nutricionista cadastra o paciente diretamente no dashboard após fazer login |

Para solicitar acesso como nutricionista, entre em contato via WhatsApp:
[wa.me/5531996383088](https://wa.me/5531996383088?text=Ol%C3%A1%2C+tenho+interesse+no+NutriOne!)

---

## Pendências e limitações conhecidas

- **Duplicação:** cinco helpers de `fetch` quase idênticos em `src/lib/*`; três páginas (`patients/[patientId]/...`) repetem o mesmo `PatientLoader`; `getMyPatients` é chamado várias vezes só para localizar um paciente.
- **Ficha do paciente:** ao salvar no `PatientProfileModal`, a avaliação física mais recente é **atualizada** (ou criada, se não houver) e peso/altura são obrigatórios; para registrar uma nova medição no histórico use "Nova Avaliação".
- **Chat:** a conversa aberta não atualiza sozinha (só o badge faz polling a cada 30 s); falha ao enviar mensagem não exibe erro.
- **Textos:** algumas mensagens de erro da API ainda estão em inglês (ex.: e-mail duplicado, token ausente/expirado).
- **Segurança:** token no `localStorage`; sem logout automático em `401`.
- `types/` (gerado pelo Next) está versionado.
