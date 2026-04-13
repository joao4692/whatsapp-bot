# Progresso do Projeto — WhatsApp Bot SaaS

---

## Fase 1 — Autenticação e Infraestrutura ✅

### O que foi construído
Sistema de autenticação completo com backend, frontend e infraestrutura Docker.

### Backend (apps/api)
- **Fastify** como framework HTTP
- **Clean Architecture**: routes → controller → service → repository
- **JWT** com duplo token:
  - Access Token: expira em 15 minutos, armazenado no sessionStorage
  - Refresh Token: expira em 7 dias, armazenado em cookie HttpOnly
- **bcrypt** para hash de senhas (salt rounds: 12)
- **CORS** configurado para aceitar requisições do frontend
- Endpoints criados:
  - `POST /auth/login` — faz login, retorna accessToken + seta cookie
  - `POST /auth/refresh` — renova o accessToken usando o refresh token
  - `POST /auth/logout` — revoga o refresh token e limpa o cookie
  - `GET /health` — verifica se a API está no ar

### Banco de Dados (packages/database)
- **Prisma 7** com adapter nativo para PostgreSQL (`@prisma/adapter-pg`)
- Pacote compartilhado `@whatsapp-bot/database` usado por todos os apps
- Tabelas criadas na migration `20260410060729_init`:
  - `tenants` — empresas clientes (multi-tenant)
  - `users` — usuários do painel (ADMIN ou AGENT)
  - `refresh_tokens` — sessões ativas dos usuários

### Frontend (apps/web)
- **Next.js 14** com App Router
- **Tailwind CSS** para estilização
- Telas criadas:
  - `/login` — formulário de login com validação
  - `/dashboard` — painel com botão de logout (protegido por token)
- Fluxo: login → salva accessToken no sessionStorage → redireciona para dashboard

### Infraestrutura
- **Monorepo Turborepo** com pnpm workspaces
  - `apps/api` — backend
  - `apps/web` — frontend
  - `packages/database` — Prisma Client compartilhado
- **Docker** com multi-stage builds (builder + runner)
- **docker-compose.yml** com 4 serviços: postgres, redis, api, web
- Migrações aplicadas automaticamente no boot da API via `start.sh`
- Seed de dados de teste: `admin@teste.com` / `123456`

---

## Fase 2 — Integração WhatsApp ✅ (parcial)

### O que foi construído
Worker que conecta ao WhatsApp, recebe mensagens e salva no banco.

### Novos modelos no banco
Migration `20260413200352_fase2_whatsapp` — 4 novas tabelas:

- **whatsapp_connections** — número de WhatsApp vinculado à empresa
  - Campos: tenantId, name, phone, status (CONNECTED/DISCONNECTED/CONNECTING), sessionData
- **contacts** — clientes que mandam mensagem
  - Campos: tenantId, phone, name
  - Constraint única: (tenantId, phone) — mesmo número não duplica por tenant
- **conversations** — conversa entre um contato e a empresa
  - Campos: tenantId, connectionId, contactId, status (OPEN/CLOSED)
- **messages** — mensagens dentro de uma conversa
  - Campos: conversationId, body, fromMe, status (SENT/DELIVERED/READ), wamId

### Worker (apps/worker)
- **Baileys** (`@whiskeysockets/baileys`) para conectar ao WhatsApp
- Fluxo de conexão:
  1. Na primeira vez: gera QR Code no terminal
  2. Usuário escaneia com o celular
  3. Sessão salva na pasta `sessions/main` (não precisa escanear de novo)
  4. Reconexão automática se cair
- Fluxo ao receber mensagem:
  1. Chega mensagem via `messages.upsert`
  2. `handleIncomingMessage` é chamado
  3. Busca ou cria o contato no banco (`upsert`)
  4. Busca conversa aberta ou cria uma nova
  5. Salva a mensagem na tabela `messages`

### Estrutura do Worker
```
apps/worker/
├── src/
│   ├── index.ts                    # Ponto de entrada
│   └── whatsapp/
│       ├── connection.ts           # Lógica de conexão com Baileys
│       └── messageHandler.ts       # Salva mensagens no banco
├── .env                            # Variáveis de ambiente locais
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Docker atualizado
- Worker adicionado ao `docker-compose.yml` como 5º serviço
- Sessão do WhatsApp persiste em volume Docker (`worker_sessions`)
- Volume externo `whatsapp-bot_worker_sessions` criado manualmente
- Sessão copiada do local para o volume antes de subir

### Dados de configuração
- Tenant ID: `cmnvz1cdc0000utc195nbgs3e` (empresa-teste)
- Connection ID: `4bb61bba-9f47-4e30-abf1-e8b3cd60fab3` (Principal)

---

## Estado atual dos containers

| Container | Porta | Status |
|-----------|-------|--------|
| whatsapp-bot-postgres | 5432 | ✅ Rodando |
| whatsapp-bot-redis | 6379 | ✅ Rodando |
| whatsapp-bot-api | 3001 | ✅ Rodando |
| whatsapp-bot-web | 3000 | ✅ Rodando |
| whatsapp-bot-worker | — | ✅ Rodando |

---

## Próximos passos — Fase 2 (continuação)

- [ ] Rotas na API para o frontend buscar conversas e mensagens
  - `GET /conversations` — lista conversas do tenant
  - `GET /conversations/:id/messages` — mensagens de uma conversa
  - `POST /conversations/:id/messages` — enviar mensagem
- [ ] Interface no painel web
  - Lista de conversas na sidebar
  - Tela de chat com histórico de mensagens
  - Campo para responder mensagens
- [ ] Envio de mensagens pelo painel (API → Worker → WhatsApp)

## Fase 3 — Planejada

- Respostas automáticas configuráveis
- Integração com LLM para atendimento inteligente
- Métricas e relatórios de atendimento
- Múltiplos agentes por tenant
