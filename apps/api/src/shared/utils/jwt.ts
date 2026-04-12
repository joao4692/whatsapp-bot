// ============================================================
// jwt.ts — Criação e verificação de tokens JWT
//
// O que é JWT?
// É um token que guarda informações do usuário de forma
// segura. Quando o usuário faz login, geramos um token.
// Nas próximas requisições, ele envia esse token e
// sabemos quem é sem precisar consultar o banco.
//
// Usamos DOIS tokens:
// - Access Token: vida curta (15min), usado em toda requisição
// - Refresh Token: vida longa (7 dias), usado só para
//   gerar um novo access token quando ele expira
// ============================================================

import jwt from 'jsonwebtoken'

// Formato dos dados que ficam dentro do token
export interface TokenPayload {
  userId: string
  tenantId: string
  role: string
}

// Cria um access token com os dados do usuário
export function createAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '15m',
    issuer: 'whatsapp-bot',
    subject: payload.userId,
  })
}

// Cria um refresh token — só guarda o userId
// Menos dados = menor risco se o token vazar
export function createRefreshToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '7d',
      issuer: 'whatsapp-bot',
    }
  )
}

// Verifica se o token é válido e retorna os dados
// Lança erro automaticamente se o token for inválido ou expirado
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    { issuer: 'whatsapp-bot' }
  ) as TokenPayload

  return decoded
}