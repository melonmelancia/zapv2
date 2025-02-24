import pkg from '@whiskeysockets/baileys';
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = pkg;
import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import pino from 'pino';

// Carregar as variáveis de ambiente do arquivo .env
config();

// Criando o transportador de e-mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Função para enviar e-mail
async function sendErrorEmail(errorDetails) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_DESTINATARIO,
            subject: 'Erro no Bot',
            text: `Ocorreu um erro no bot: ${errorDetails}`,
        };

        await transporter.sendMail(mailOptions);
        console.log("Erro enviado por e-mail.");
    } catch (err) {
        console.log("Erro ao enviar e-mail:", err);
    }
}

// Função principal para iniciar o bot
async function startBot() {
    const logger = pino();

    try {
        logger.info('Iniciando o bot...');
        
        const authPath = './auth_info'; // Alterado para usar múltiplos arquivos de autenticação
        const { state, saveCreds } = useMultiFileAuthState(authPath);

        const socket = makeWASocket({
            auth: state,
            logger,
            printQRInTerminal: true,
            // Outros parâmetros podem ser configurados aqui
        });

        socket.ev.on('creds.update', saveCreds);

        socket.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect.error.output.statusCode !== 401) {
                    startBot(); // Reconnect if not due to authentication error
                } else {
                    console.log('Erro de autenticação');
                }
            } else if (connection === 'open') {
                console.log('Conexão estabelecida!');
            }
        });

    } catch (error) {
        console.error("Erro ao iniciar o bot:", error);
        sendErrorEmail(error.message || error.toString());
    }
}

startBot();
