// ============================================================
// seed.ts — Script para popular o banco com dados de teste
// ============================================================

import { prisma } from '@whatsapp-bot/database'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Iniciando seed...')

  const tenant = await prisma.tenant.create({
    data: { name: 'Empresa Teste', slug: 'empresa-teste' }
  })
  console.log('Tenant criado! ID:', tenant.id)

  const hash = await bcrypt.hash('123456', 12)

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@teste.com',
      password: hash,
      name: 'Admin',
      role: 'ADMIN'
    }
  })
  console.log('Usuario criado:', user.email)

  await prisma.$disconnect()
  console.log('Pronto!')
}

main()
