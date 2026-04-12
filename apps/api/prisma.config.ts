// ============================================================
// prisma.config.ts — Configuração do Prisma 7
//
// No Prisma 7 a URL do banco fica aqui, não mais no schema.
// ============================================================

/// <reference types="node" />
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
})