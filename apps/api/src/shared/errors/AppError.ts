// ============================================================
// AppError.ts — Erros customizados da aplicação
//
// Por que criar erros customizados?
// O Fastify precisa saber se um erro foi causado por algo
// esperado (ex: senha errada) ou inesperado (ex: banco caiu).
// Com classes próprias conseguimos diferenciar os dois casos
// e retornar a resposta HTTP correta para cada situação.
// ============================================================

// Classe base — todos os outros erros herdam dela
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode = 400, code = 'APP_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'AppError'
  }
}

// 401 — usuário não autenticado (sem token ou token inválido)
export class UnauthorizedError extends AppError {
  constructor(message = 'Nao autorizado') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

// 404 — recurso não encontrado
export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} nao encontrado`, 404, 'NOT_FOUND')
  }
}

// 422 — dados inválidos (ex: email sem @)
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422, 'VALIDATION_ERROR')
  }
}

// 409 — conflito (ex: email já cadastrado)
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}