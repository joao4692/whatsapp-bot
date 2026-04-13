// ============================================================
// index.ts — Ponto de entrada do Worker
//
// Este processo roda separado da API.
// Responsabilidade: conectar ao WhatsApp via Baileys
// e processar mensagens recebidas.
// ============================================================

import 'dotenv/config'
import { startWhatsAppConnection } from './whatsapp/connection'

console.log('Worker iniciando...')

startWhatsAppConnection()
    