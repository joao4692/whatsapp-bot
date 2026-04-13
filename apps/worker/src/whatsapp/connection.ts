// ============================================================
// connection.ts — Conecta ao WhatsApp via Baileys
//
// O Baileys simula ser um celular.
// Para conectar pela primeira vez, gera um QR Code.
// Você escaneia com o celular e o servidor fica conectado.
// ============================================================

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import path from 'path'
import { handleIncomingMessage } from './messageHandler'


export async function startWhatsAppConnection() {
  // Pasta onde salva a sessão (evita escanear QR toda vez)
  const sessionPath = path.resolve(process.cwd(), 'sessions', 'main')

  // Carrega ou cria credenciais de autenticação
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  // Busca a versão mais recente do protocolo WhatsApp
  const { version } = await fetchLatestBaileysVersion()
  console.log(`Usando WhatsApp v${version.join('.')}`)

  // Cria a conexão
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
  })

  // Salva as credenciais sempre que atualizar
  sock.ev.on('creds.update', saveCreds)

  // Monitora o estado da conexão
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('QR Code gerado — escaneie com o WhatsApp do celular')
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      console.log(`Conexão fechada. Motivo: ${statusCode}`)

      if (shouldReconnect) {
        console.log('Reconectando...')
        startWhatsAppConnection()
      } else {
        console.log('Sessão encerrada. Escaneie o QR Code novamente.')
      }
    }

    if (connection === 'open') {
      console.log('WhatsApp conectado com sucesso!')
    }
  })

  // Recebe mensagens
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue
      if (msg.key.fromMe) continue

      const from = msg.key.remoteJid
      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        
        ''
      await handleIncomingMessage(from!, body)

      
    }
  })
}
