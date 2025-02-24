const qrcode = require('qrcode-terminal');
const { useMultiFileAuthState, makeWASocket, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Caminho para o diretório de autenticação
const authPath = './auth_info';

// Função para iniciar o bot
async function startBot() {
  const { state, saveState } = await useMultiFileAuthState(authPath);

  // Cria a conexão com o WhatsApp
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // Não imprimir QR Code no terminal diretamente
  });

  // Geração do QR Code
  sock.ev.on('qr', (qr) => {
    qrcode.generate(qr, { small: true }); // Gera QR Code no terminal
    fs.writeFileSync(path.join(__dirname, 'qr_code.png'), qr); // Salva o QR Code como imagem
  });

  // Atualização da conexão
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    console.log(update);
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        startBot(); // Reinicia a conexão se não estiver desconectado por logout
      }
    } else if (connection === 'open') {
      console.log('Conectado ao WhatsApp!');
    }
  });

  // Manipulador de mensagens (exemplo)
  sock.ev.on('messages.upsert', (message) => {
    const { messages, type } = message;
    console.log('Mensagem recebida:', messages);
  });
}

// Inicia o bot
startBot().catch((error) => console.error('Erro ao iniciar o bot:', error));
