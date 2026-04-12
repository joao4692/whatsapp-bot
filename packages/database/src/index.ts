// ============================================================
// packages/database/src/index.ts — Ponto central do banco
//
// Este pacote é importado por todos os apps do monorepo.
// Centralizar aqui significa que só existe UM PrismaClient
// configurado no sistema inteiro.
//
// Uso nos outros pacotes:
//   import { prisma } from '@whatsapp-bot/database'
// ============================================================

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

// O adapter PrismaPg conecta o Prisma ao PostgreSQL
// Prisma 7 exige um adapter explícito (não usa drivers internos)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
})

// Singleton — evita múltiplas conexões durante hot reload
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Re-exporta os tipos do Prisma para uso nos outros pacotes
export * from '@prisma/client'
