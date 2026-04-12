// ============================================================
// AuthController.ts — Camada HTTP da autenticação
//
// REGRA: Não tem regra de negócio aqui.
// Só faz duas coisas:
// 1. Valida o formato dos dados que chegaram (Zod)
// 2. Chama o Service e devolve a resposta HTTP
// ============================================================

import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { AuthService } from './AuthService'
import { AppError } from '../../shared/errors/AppError'

const authService = new AuthService()

// Schema de validação do corpo do login
// O Zod verifica se os dados estão no formato correto
// antes de passar para o Service
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export class AuthController {

  // POST /auth/login
  async login(request: FastifyRequest, reply: FastifyReply) {

    // 1. Valida os dados que chegaram no body
    const result = loginSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(422).send({
        error: 'Dados inválidos',
        details: result.error.flatten().fieldErrors,
      })
    }

    const { email, password } = result.data

    // 2. Chama o service com os dados validados
    const { accessToken, refreshToken, user } = await authService.login(email, password)

    // 3. Envia o refresh token como cookie HttpOnly
    // HttpOnly = JavaScript do browser NÃO consegue ler
    // Isso protege contra ataques XSS
    reply.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
      maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
    })

    // 4. Retorna o access token e dados do usuário
    return reply.status(200).send({
      accessToken,
      user,
    })
  }

  // POST /auth/refresh
  async refresh(request: FastifyRequest, reply: FastifyReply) {

    // Lê o refresh token do cookie
    const refreshToken = request.cookies.refresh_token

    if (!refreshToken) {
      return reply.status(401).send({ error: 'Refresh token não encontrado' })
    }

    const { accessToken } = await authService.refresh(refreshToken)

    return reply.status(200).send({ accessToken })
  }

  // POST /auth/logout
  async logout(request: FastifyRequest, reply: FastifyReply) {

    const refreshToken = request.cookies.refresh_token

    if (refreshToken) {
      await authService.logout(refreshToken)
    }

    // Remove o cookie
    reply.clearCookie('refresh_token', { path: '/auth' })

    return reply.status(200).send({ message: 'Logout realizado com sucesso' })
  }
}