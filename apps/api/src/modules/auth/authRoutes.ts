// ============================================================
// authRoutes.ts — Define os endpoints de autenticação
//
// Aqui conectamos as URLs aos métodos do Controller.
// Quando chegar um POST /auth/login, o Fastify
// chama o controller.login automaticamente.
// ============================================================

import type { FastifyInstance } from 'fastify'
import { AuthController } from './AuthController'

const controller = new AuthController()

export async function authRoutes(fastify: FastifyInstance) {

  // POST /auth/login
  // Recebe email e senha, retorna access token
  fastify.post('/login', controller.login.bind(controller))

  // POST /auth/refresh
  // Usa o cookie para gerar novo access token
  fastify.post('/refresh', controller.refresh.bind(controller))

  // POST /auth/logout
  // Invalida a sessão
  fastify.post('/logout', controller.logout.bind(controller))
}