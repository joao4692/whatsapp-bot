// ============================================================
// server.ts — Ponto de entrada da aplicação
//
// Aqui configuramos o Fastify com todos os plugins
// e registramos as rotas da aplicação.
// ============================================================

import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { authRoutes } from './modules/auth/authRoutes'
import { AppError } from './shared/errors/AppError'
import 'dotenv/config'

const app = Fastify({
  logger: true
})

// ----------------------------------------------------------
// CORS — permite que o frontend (localhost:3000) chame a API
//
// Sem isso o browser bloqueia as requisições com erro:
// "Cross-Origin Request Blocked"
// ----------------------------------------------------------
app.register(cors, {
  // Em produção, trocar pelo domínio real do frontend
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  // Permite enviar cookies (necessário para o refresh token)
  credentials: true,
})

// ----------------------------------------------------------
// Plugin de cookie — necessário para ler e escrever cookies
// Usado pelo refresh token
// ----------------------------------------------------------
app.register(cookie)

// ----------------------------------------------------------
// Tratamento global de erros
// Qualquer erro não tratado cai aqui
// ----------------------------------------------------------
app.setErrorHandler((error, request, reply) => {

  // Erro esperado — ex: senha errada, usuário não encontrado
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code,
    })
  }

  // Erro inesperado — loga e retorna mensagem genérica
  app.log.error(error)
  return reply.status(500).send({
    error: 'Erro interno do servidor',
  })
})

// ----------------------------------------------------------
// Rotas
// ----------------------------------------------------------

// Health check — verifica se o servidor está no ar
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}))

// Rotas de autenticação com prefixo /auth
app.register(authRoutes, { prefix: '/auth' })

// ----------------------------------------------------------
// Inicia o servidor
// ----------------------------------------------------------
app.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log('Servidor rodando em http://localhost:3001')
})