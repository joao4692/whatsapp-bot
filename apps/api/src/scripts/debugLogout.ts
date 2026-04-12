import { prisma } from '@whatsapp-bot/database'
import crypto from 'crypto'
import 'dotenv/config'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW50ZTg3NGwwMDAxMXNjMWU1Yjlldm91IiwiaWF0IjoxNzc2MDAzMjI5LCJleHAiOjE3NzY2MDgwMjksImlzcyI6IndoYXRzYXBwLWJvdCJ9.O1aXMN5isRrelwtxHTzXR76Y7iKQSTCIphk3FDtc20A'

async function main() {
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  console.log('Hash gerado:', hash)

  const all = await prisma.refreshToken.findMany({ select: { token: true, revoked: true } })
  console.log('\nTokens no banco:')
  all.forEach(t => console.log(t.revoked ? '❌ revogado' : '✅ ativo', t.token))

  const match = all.find(t => t.token === hash)
  console.log('\nBateu com algum?', match ? 'SIM' : 'NÃO')

  await prisma.$disconnect()
}

main()
