import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'WhatsApp Bot',
  description: 'Sistema de atendimento inteligente via WhatsApp',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
