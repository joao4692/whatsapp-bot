# WhatsApp Bot — SaaS de Atendimento Inteligente

Plataforma SaaS multi-tenant para gerenciamento de atendimento via WhatsApp, desenvolvida para empresas de segurança eletrônica. Permite conectar múltiplos números de WhatsApp, automatizar respostas e gerenciar conversas em equipe através de um painel web.

> Projeto de portfólio desenvolvido com foco em arquitetura limpa, containerização e boas práticas de desenvolvimento.

---

## Tecnologias

**Backend**
- [Fastify](https://fastify.dev/) — framework HTTP de alta performance
- [Prisma 7](https://www.prisma.io/) — ORM com adapter nativo para PostgreSQL
- [JWT](https://jwt.io/) — autenticação stateless com access token + refresh token
- [bcrypt](https://github.com/dcodeIO/bcrypt.js) — hash seguro de senhas

**Frontend**
- [Next.js 14](https://nextjs.org/) — App Router com SSR e output standalone
- [Tailwind CSS](https://tailwindcss.com/) — estilização utilitária

**Infraestrutura**
- [PostgreSQL 16](https://www.postgresql.org/) — banco de dados relacional
- [Redis 7](https://redis.io/) — cache e fila de mensagens (BullMQ na Fase 2)
- [Docker](https://www.docker.com/) — containers com multi-stage build
- [Turborepo](https://turbo.build/) — monorepo com pipeline de build otimizado
- [pnpm](https://pnpm.io/) — gerenciador de pacotes com workspaces

---

## Estrutura do Projeto

```
whatsapp-bot/
├── apps/
│   ├── api/                  # Backend Fastify (porta 3001)
│   │   ├── src/
│   │   │   ├── modules/auth/ # Autenticação (login, logout, refresh)
│   │   │   ├── shared/       # Erros e utilitários compartilhados
│   │   │   └── server.ts     # Ponto de entrada
│   │   └── Dockerfile
│   └── web/                  # Frontend Next.js (porta 3000)
│       ├── app/
│       │   ├── login/        # Tela de login
│       │   └── dashboard/    # Painel principal
│       └── Dockerfile
├── packages/
│   └── database/             # Pacote compartilhado — Prisma Client
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── src/index.ts      # Exporta o PrismaClient configurado
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Como Rodar

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- [pnpm](https://pnpm.io/installation) (para desenvolvimento local)

### Com Docker (recomendado)

**1. Clone o repositório:**
```bash
git clone https://github.com/joao4692/whatsapp-bot.git
cd whatsapp-bot
```

**2. Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o .env com seus valores
```

**3. Suba todos os serviços:**
```bash
docker compose up -d
```

As migrações do banco de dados são aplicadas automaticamente na inicialização da API.

**4. Popule o banco com dados de teste:**
```bash
docker compose exec api sh -c "cd /app && node -e \"
const { execSync } = require('child_process');
execSync('npx tsx apps/api/src/scripts/seed.ts', { stdio: 'inherit' });
\""
```

Acesse em:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Health check: http://localhost:3001/health

### Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Gerar o Prisma Client
cd packages/database && pnpm db:generate && cd ../..

# Rodar todos os serviços em modo dev
pnpm dev
```

---

## Autenticação

O sistema usa **JWT com duplo token**:

| Token | Armazenamento | Expiração |
|-------|--------------|-----------|
| Access Token | `sessionStorage` (browser) | 15 minutos |
| Refresh Token | Cookie `HttpOnly` | 7 dias |

**Endpoints disponíveis:**

```
POST /auth/login       → Realiza login, retorna accessToken + cookie
POST /auth/refresh     → Renova o accessToken usando o refresh token
POST /auth/logout      → Revoga o refresh token e limpa o cookie
GET  /health           → Verifica se a API está no ar
```

---

## Banco de Dados

```
Tenant (empresa cliente)
  └── User (admin ou agente)
        └── RefreshToken (sessões ativas)
```

O sistema é **multi-tenant**: cada empresa tem seus próprios usuários e dados completamente isolados.

---

## Roadmap

### Fase 1 — Autenticação e Infraestrutura ✅
- [x] Monorepo Turborepo com pnpm workspaces
- [x] Backend Fastify com Clean Architecture
- [x] Autenticação JWT (access token + refresh token)
- [x] Frontend Next.js com tela de login e dashboard
- [x] Multi-stage Docker builds
- [x] Migrações automáticas no boot da API

### Fase 2 — Integração WhatsApp 🚧
- [ ] Conexão com WhatsApp via [Baileys](https://github.com/WhiskeySockets/Baileys)
- [ ] QR Code para vincular número
- [ ] Fila de mensagens com BullMQ + Redis
- [ ] Modelos: Contact, Conversation, Message, WhatsAppConnection
- [ ] Interface para visualizar e responder conversas

### Fase 3 — Automação e IA (planejado)
- [ ] Respostas automáticas configuráveis
- [ ] Integração com LLM para atendimento inteligente
- [ ] Métricas e relatórios de atendimento
- [ ] Múltiplos agentes por tenant

---

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/whatsappbot"
JWT_SECRET="chave-aleatoria-longa-e-segura"
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=development
API_PORT=3001
```

---

## Licença

MIT
