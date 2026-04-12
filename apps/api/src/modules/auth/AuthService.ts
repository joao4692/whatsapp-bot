// ============================================================
// AuthService.ts — Regras de negócio da autenticação
//
// REGRA: Não sabe nada sobre HTTP (sem req, sem res).
// Recebe dados puros, processa e retorna o resultado.
//
// É aqui que ficam as decisões importantes:
// - A senha está correta?
// - O token é válido?
// - O usuário está ativo?
// ============================================================

import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { AuthRepository } from './AuthRepository'
import { createAccessToken, createRefreshToken, verifyToken } from '../../shared/utils/jwt'
import { UnauthorizedError } from '../../shared/errors/AppError'

export class AuthService {
  private repository: AuthRepository

  constructor() {
    this.repository = new AuthRepository()
  }

  // ----------------------------------------------------------
  // LOGIN
  // Valida email e senha, retorna os tokens
  // ----------------------------------------------------------
  async login(email: string, password: string) {

    // 1. Busca o usuário no banco pelo email
    const user = await this.repository.findUserByEmail(email)

    // 2. Verifica a senha com bcrypt
    // IMPORTANTE: mesmo se o usuário não existir, ainda
    // rodamos o bcrypt.compare com um hash falso.
    // Isso evita "timing attack" — um ataque onde o hacker
    // descobre emails válidos medindo o tempo de resposta.
    const hash = user?.password ?? '$2b$12$invalidhashtopreventtiming'
    const passwordMatch = await bcrypt.compare(password, hash)

    // 3. Se email não existe OU senha errada, mesmo erro
    // Nunca dizemos qual dos dois está errado — isso é segurança
    if (!user || !passwordMatch) {
      throw new UnauthorizedError('Email ou senha incorretos')
    }

    // 4. Verifica se a conta está ativa
    if (!user.active) {
      throw new UnauthorizedError('Conta desativada. Entre em contato com o suporte.')
    }

    // 5. Gera o access token (expira em 15 minutos)
    const accessToken = createAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    })

    // 6. Gera o refresh token (expira em 7 dias)
    const refreshTokenValue = createRefreshToken(user.id)

    // 7. Salva o HASH do refresh token no banco
    // Nunca salvamos o token em si — se o banco vazar,
    // os tokens não podem ser usados
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenValue)
      .digest('hex')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.repository.saveRefreshToken({
      userId: user.id,
      token: tokenHash,
      expiresAt,
    })

    // 8. Retorna os dados — NUNCA retorna a senha
    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    }
  }

  // ----------------------------------------------------------
  // REFRESH
  // Usa o refresh token para gerar novo access token
  // O frontend chama isso automaticamente quando o
  // access token expira
  // ----------------------------------------------------------
  async refresh(refreshToken: string) {

    // 1. Verifica se o JWT é válido
    let payload: { userId: string }
    try {
      payload = verifyToken(refreshToken) as any
    } catch {
      throw new UnauthorizedError('Refresh token inválido ou expirado')
    }

    // 2. Busca o hash no banco para confirmar que não foi revogado
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    const savedToken = await this.repository.findRefreshToken(tokenHash)

    if (!savedToken || savedToken.revoked || savedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Sessão expirada. Faça login novamente.')
    }

    // 3. Busca os dados atuais do usuário
    const user = await this.repository.findUserById(payload.userId)
    if (!user || !user.active) {
      throw new UnauthorizedError('Usuário não encontrado ou desativado')
    }

    // 4. Gera e retorna novo access token
    const accessToken = createAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    })

    return { accessToken }
  }

  // ----------------------------------------------------------
  // LOGOUT
  // Invalida o refresh token para encerrar a sessão
  // ----------------------------------------------------------
  async logout(refreshToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    try {
      await this.repository.revokeRefreshToken(tokenHash)
    } catch {
      // Token não encontrado — usuário já estava deslogado
    }
  }
}