# ============================================================
# Dockerfile — Web (Next.js)
#
# Também usa multi-stage build.
# O Next.js tem um modo "standalone" que gera uma pasta
# com tudo que precisa para rodar — sem node_modules pesados.
# ============================================================

# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json tsconfig.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
COPY packages/database ./packages/database

# Variável necessária para o Next.js no build
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN cd apps/web && pnpm build


# ---- Stage 2: Runner ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia o output standalone do Next.js
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
