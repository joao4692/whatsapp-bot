# ============================================================
# Dockerfile — API (Fastify)
#
# Multi-stage build:
# Stage 1 (builder): instala tudo, gera Prisma Client,
#                    compila TypeScript → JavaScript
# Stage 2 (runner):  copia só o necessário para rodar
# ============================================================

# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copia configurações do monorepo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json tsconfig.json ./

# Copia package.json de cada pacote antes do install
# (Docker usa isso para cache — só reinstala se mudar)
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/

# Instala todas as dependências
RUN pnpm install --frozen-lockfile

# Copia o código-fonte
COPY apps/api ./apps/api
COPY packages/database ./packages/database

# Gera o Prisma Client
RUN cd packages/database && pnpm db:generate

# Compila o pacote database (TypeScript → JavaScript)
RUN cd packages/database && pnpm build

# Compila a API (TypeScript → JavaScript)
RUN cd apps/api && pnpm build


# ---- Stage 2: Runner ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia node_modules do builder (raiz + cada app)
# pnpm usa symlinks — precisa copiar a estrutura completa
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules

# Copia os package.json (necessário para o Node resolver módulos)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/database/package.json ./packages/database/

# Copia o JavaScript compilado
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist

# Copia os arquivos do Prisma (schema + migrations) para rodar migrate deploy
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/prisma.config.ts ./packages/database/

# Script de entrada: aplica migrações e inicia o servidor
COPY apps/api/start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 3001

CMD ["sh", "start.sh"]
