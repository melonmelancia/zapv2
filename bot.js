const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Configurações
const authPath = path.join(__dirname, 'auth_info'); // Caminho onde os dados de autenticação serão armazenados

// Função para inicializar o bot
async function startBot() {
  console.log('Iniciando o bot...');
  
  // Configuração para autenticação
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  // Criação da conexão do WhatsApp
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // Exibe o QR code no terminal
    logger: pino({ level: 'trace' }) // Para depuração
  });

  // Salvando as credenciais
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    console.log('Mensagem recebida:', m);
    // Adicione aqui a lógica para responder a mensagens ou interagir
  });

  // Conectando ao WhatsApp
  await sock.connect();
}

// Iniciar o bot
startBot().catch((err) => {
  console.error('Erro ao iniciar o bot:', err);
});
