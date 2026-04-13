# ============================================================
# Dockerfile — Worker (Baileys + BullMQ)
# ============================================================

# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json tsconfig.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/database/package.json ./packages/database/

RUN pnpm install --frozen-lockfile

COPY apps/worker ./apps/worker
COPY packages/database ./packages/database

RUN cd packages/database && pnpm db:generate
RUN cd packages/database && pnpm build
RUN cd apps/worker && pnpm build


# ---- Stage 2: Runner ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules

COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/worker/package.json ./apps/worker/
COPY --from=builder /app/packages/database/package.json ./packages/database/

COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist

CMD ["node", "apps/worker/dist/index.js"]
