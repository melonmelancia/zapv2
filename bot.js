const fs = require('fs');
const { makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
require('dotenv').config();  // Carregar variáveis do .env
const nodemailer = require('nodemailer');

// Caminho do arquivo de autenticação
const authPath = './auth_info.json';

// Função para enviar e-mail
async function sendEmail(subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // Usando variáveis de ambiente
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_DEST,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
  }
}

// Função principal para inicializar o bot
async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  console.log(`Usando a versão ${version} do Baileys, mais recente: ${version === 'latest'}`);

  // Carregar o estado de autenticação
  const { state, saveCreds } = useSingleFileAuthState(authPath);

  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    version: [2, 2243, 7],  // Usando versão específica
  });

  socket.ev.on('creds.update', saveCreds);  // Salva as credenciais quando necessário

  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error.output?.statusCode === DisconnectReason.loggedOut);
      console.log('Conexão fechada, reconectando...', shouldReconnect);

      if (shouldReconnect) {
        startBot();  // Reconnecta automaticamente se a sessão for encerrada
      }
    } else if (connection === 'open') {
      console.log('Conexão com o WhatsApp aberta!');
    }
  });

  socket.ev.on('messages.upsert', async (message) => {
    const msg = message.messages[0];
    if (!msg.key.fromMe && msg.message.conversation) {
      const userMessage = msg.message.conversation.trim();
      console.log(`Mensagem recebida: ${userMessage}`);

      if (userMessage.toLowerCase() === 'envie o relatório') {
        console.log('Enviando relatório por e-mail...');
        await sendEmail('Relatório de Atividades', 'Aqui está o relatório solicitado.');
      }
    }
  });

  socket.connect();
}

// Iniciar o bot
startBot().catch((error) => {
  console.error('Erro ao iniciar o bot:', error);
});
