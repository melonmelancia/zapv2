const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const pino = require('pino');
const nodemailer = require('nodemailer');

// Configuração de logging
const logger = pino({ level: 'info' });

// Caminho do arquivo de autenticação
const authPath = './auth_info.json';

// Função para enviar notificação por email
const sendEmailNotification = async (message) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_DEST,
    subject: 'Notificação do Bot WhatsApp',
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Notificação de email enviada com sucesso');
  } catch (error) {
    // Capturando mais detalhes do erro
    logger.error('Erro ao enviar notificação de email:', error);
    logger.error('Detalhes do erro:', error.message);
  }
};

// Função para iniciar o bot
const startBot = async () => {
  logger.info('Iniciando o bot...');
  
  // Verificando o estado de autenticação
  const { state, saveCreds } = useSingleFileAuthState(authPath);

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

  // Conectar ao WhatsApp
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        logger.info('Bot foi desconectado e deslogado!');
        sendEmailNotification('Bot foi desconectado e deslogado!');
      } else {
        logger.info('Bot desconectado!');
        sendEmailNotification('Bot foi desconectado!');
      }
    }
  });

  // Exemplo de evento de mensagem
  sock.ev.on('messages.upsert', (m) => {
    logger.info(m);
  });

  // Salvar credenciais de autenticação
  sock.ev.on('creds.update', saveCreds);

  // Aguardar conexão
  await sock.connect();
};

// Chamada da função para iniciar o bot
startBot().catch((err) => {
  logger.error('Erro ao iniciar o bot:', err);
  sendEmailNotification(`Erro ao iniciar o bot: ${err.message}`);
});
