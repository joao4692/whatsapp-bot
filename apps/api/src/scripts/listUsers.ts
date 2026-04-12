import { prisma } from '@whatsapp-bot/database'
import 'dotenv/config'

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, active: true, tenantId: true },
  })
  console.log(JSON.stringify(users, null, 2))
  await prisma.$disconnect()
}

main()
