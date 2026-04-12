import { redirect } from 'next/navigation'

// Redireciona a raiz "/" direto para a tela de login
export default function Home() {
  redirect('/login')
}
