'use client'

// ============================================================
// dashboard/page.tsx — Painel principal (placeholder)
//
// 'use client' é necessário aqui porque precisamos verificar
// o sessionStorage — que só existe no browser, não no servidor.
// ============================================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Verifica se o access token existe no sessionStorage
    // Se não existir, o usuário não está logado — redireciona
    const token = sessionStorage.getItem('accessToken')

    if (!token) {
      router.replace('/login')
      return
    }

    setAuthorized(true)
  }, [router])

  // Enquanto verifica o token, não renderiza nada
  // Evita "flash" do conteúdo antes do redirecionamento
  if (!authorized) return null

  function handleLogout() {
    sessionStorage.removeItem('accessToken')
    router.replace('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-3xl">💬</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
        <p className="text-gray-500 mt-2">Login realizado com sucesso!</p>
        <p className="text-gray-400 text-sm mt-1">
          O painel completo será construído na Fase 3.
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 text-sm text-red-500 hover:text-red-700 underline cursor-pointer"
        >
          Sair
        </button>
      </div>
    </main>
  )
}
