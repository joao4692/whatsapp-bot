// ============================================================
// AuthRepository.ts — Comunicação com o banco de dados
//
// REGRA: É o ÚNICO arquivo que faz queries no banco
// relacionadas a autenticação.
//
// Por que separar assim?
// Se amanhã trocarmos o PostgreSQL por outro banco,
// só mexemos aqui. O resto do sistema não sabe
// nem percebe a mudança.
// ============================================================

import { prisma } from '@whatsapp-bot/database'

export class AuthRepository {

  // Busca usuário pelo email
  // Usado no login para verificar se o email existe
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  // Busca usuário pelo ID
  // Usado para verificar se o usuário ainda existe
  // quando ele envia o token
  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  // Salva um refresh token no banco após o login
  async saveRefreshToken(data: {
    userId: string
    token: string      // salvamos o HASH, nunca o token em si
    expiresAt: Date
  }) {
    return prisma.refreshToken.create({ data })
  }

  // Busca refresh token pelo hash
  // Usado quando o usuário tenta renovar o access token
  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
    })
  }

  // Invalida um token específico — chamado no logout
  async revokeRefreshToken(token: string) {
    await prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    })
  }
}