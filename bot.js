import { makeWASocket, useSingleFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import pino from 'pino';
import fs from 'fs';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Configurar o logger
const logger = pino({ level: 'info' });

// Caminho para o arquivo de autenticação
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
    logger.error('Erro ao enviar notificação de email:', error);
    if (error.response) {
      logger.error('Detalhes da resposta de erro:', error.response);
    } else if (error.message) {
      logger.error('Mensagem de erro:', error.message);
    }
  }
};

// Função para iniciar o bot
const startBot = async () => {
  logger.info('Iniciando o bot...');

  // Verificar se o arquivo de autenticação existe
  if (!fs.existsSync(authPath)) {
    logger.error('Arquivo de autenticação não encontrado.');
    await sendEmailNotification('Erro: Arquivo de autenticação não encontrado.');
    return;
  }

  try {
    // Usando a função de estado de autenticação do Baileys
    const { state, saveCreds } = useSingleFileAuthState(authPath);

    // Criar a instância do socket do Baileys
    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'debug' }),
      connectTimeoutMs: 10000,
    });

    socket.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        if (lastDisconnect?.error?.output?.statusCode !== 401) {
          logger.info('Reconectando...');
          startBot();
        }
      }

      if (connection === 'open') {
        logger.info('Conectado ao WhatsApp com sucesso!');
        sendEmailNotification('Bot WhatsApp conectado com sucesso!');
      }
    });

    socket.ev.on('messages.upsert', (msg) => {
      logger.info('Mensagem recebida:', msg);
      // A lógica de processamento de mensagens vai aqui
    });

  } catch (error) {
    logger.error('Erro ao iniciar o bot:', error);
    await sendEmailNotification('Erro ao iniciar o bot: ' + error.message);
  }
};

// Iniciar o bot
startBot();
