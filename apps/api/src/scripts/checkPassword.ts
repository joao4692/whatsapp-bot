import { prisma } from '@whatsapp-bot/database'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@teste.com' } })
  if (!user) { console.log('Usuário não encontrado'); return }

  const senhas = ['senha123', '123456', 'admin123', 'password', '12345678']
  for (const s of senhas) {
    const match = await bcrypt.compare(s, user.password)
    console.log(`senha "${s}": ${match ? '✅ CORRETA' : '❌'}`)
  }

  await prisma.$disconnect()
}

main()
