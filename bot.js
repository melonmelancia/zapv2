const { useSingleFileAuthState, makeWASocket } = require('@whiskeysockets/baileys');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const pino = require('pino');  // Importando o pino para logs

// Configurar dotenv
dotenv.config();

// Inicializando o logger
const logger = pino();

// Caminho do arquivo de autenticação
const authPath = './auth_info.json'; 

// Função principal para iniciar o bot
const startBot = async () => {
  logger.info('Iniciando o bot...');

  try {
    // Carregar estado de autenticação
    const { state, saveCreds } = useSingleFileAuthState(authPath);

    // Criar a conexão com o WhatsApp
    const sock = makeWASocket({
      auth: state,
    });

    // Salvar as credenciais ao atualizar
    sock.ev.on('creds.update', saveCreds);
    
    // Monitorar a conexão
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;

      // Se a conexão for fechada, tentar reconectar
      if (connection === 'close') {
        if (lastDisconnect?.error?.output?.statusCode !== 401) {
          logger.info('Conexão perdida, tentando reconectar...');
          startBot();  // Tentar reconectar
        } else {
          logger.info('Conexão encerrada.');
        }
      }
    });

    logger.info('Bot iniciado com sucesso');

  } catch (error) {
    logger.error('Erro ao iniciar o bot:', error);
  }
};

// Enviar email quando o bot estiver ativo
const sendEmailNotification = async () => {
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
    text: 'O bot WhatsApp foi iniciado com sucesso.',
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Notificação de email enviada com sucesso');
  } catch (error) {
    logger.error('Erro ao enviar notificação de email:', error);
  }
};

// Iniciar o bot e enviar email de notificação
startBot().then(() => {
  sendEmailNotification();
});
