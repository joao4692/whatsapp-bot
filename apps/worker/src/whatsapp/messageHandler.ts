// ============================================================
// messageHandler.ts — Salva mensagens recebidas no banco
//
// Fluxo:
// 1. Chega uma mensagem nova
// 2. Verifica se o contato já existe — se não, cria
// 3. Verifica se tem conversa aberta — se não, cria
// 4. Salva a mensagem
// ============================================================

import { prisma } from '@whatsapp-bot/database'

const TENANT_ID = process.env.TENANT_ID!
const CONNECTION_ID = process.env.CONNECTION_ID!

export async function handleIncomingMessage(from: string, body: string) {
  if (!body) return

  // Remove o sufixo @s.whatsapp.net ou @lid para pegar só o número
  const phone = from.split('@')[0]

  // 1. Busca ou cria o contato
  const contact = await prisma.contact.upsert({
    where: {
      tenantId_phone: {
        tenantId: TENANT_ID,
        phone,
      },
    },
    update: {},
    create: {
      tenantId: TENANT_ID,
      phone,
    },
  })

  // 2. Busca conversa aberta ou cria uma nova
  let conversation = await prisma.conversation.findFirst({
    where: {
      contactId: contact.id,
      connectionId: CONNECTION_ID,
      status: 'OPEN',
    },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        tenantId: TENANT_ID,
        connectionId: CONNECTION_ID,
        contactId: contact.id,
      },
    })
    console.log(`Nova conversa criada para ${phone}`)
  }

  // 3. Salva a mensagem
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      body,
      fromMe: false,
    },
  })

  console.log(`Mensagem de ${phone} salva no banco: "${body}"`)
}
