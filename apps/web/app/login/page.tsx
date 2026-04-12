'use client'

// ============================================================
// login/page.tsx — Tela de login
//
// 'use client' significa que esse componente roda no browser.
// Precisamos disso porque usamos useState e eventos de formulário.
//
// Server Components (padrão no Next.js 14) rodam no servidor
// e não têm acesso a eventos do browser.
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  // Estado do formulário
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Estado de feedback para o usuário
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    // Evita o comportamento padrão do browser (recarregar a página)
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Chama a API que construímos no backend
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include' faz o browser salvar o cookie HttpOnly
        // que vem na resposta (o refresh token)
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // A API retorna { error: "mensagem" } quando algo dá errado
        setError(data.error ?? 'Erro ao fazer login')
        return
      }

      // Salva o access token na memória do browser (sessionStorage)
      // NÃO usamos localStorage para tokens — é menos seguro
      sessionStorage.setItem('accessToken', data.accessToken)

      // Redireciona para o painel
      router.push('/dashboard')

    } catch {
      setError('Não foi possível conectar ao servidor. Verifique se a API está rodando.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / Cabeçalho */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">💬</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Bot</h1>
          <p className="text-gray-500 text-sm mt-1">Entre na sua conta</p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                           placeholder:text-gray-400"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                           placeholder:text-gray-400"
              />
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300
                         text-white font-medium py-2 px-4 rounded-lg text-sm
                         transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

          </form>
        </div>

      </div>
    </main>
  )
}
