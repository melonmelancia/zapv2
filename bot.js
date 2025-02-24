import pkg from '@whiskeysockets/baileys';
import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

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

// Função para enviar o QR Code por e-mail
async function sendQRCodeByEmail(qrCode) {
    try {
        // Salvar o QR Code como imagem temporária
        const qrCodePath = path.join(__dirname, 'qrcode.png');
        fs.writeFileSync(qrCodePath, qrCode);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_DESTINATARIO,
            subject: 'QR Code do Bot WhatsApp',
            text: 'Aqui está o QR Code gerado para autenticar o bot no WhatsApp.',
            attachments: [
                {
                    filename: 'qrcode.png',
                    path: qrCodePath,  // Anexar o arquivo QR Code
                }
            ],
        };

        // Enviar o e-mail com o QR Code anexado
        await transporter.sendMail(mailOptions);
        console.log('QR Code enviado por e-mail!');
        
        // Remover o arquivo temporário do QR Code
        fs.unlinkSync(qrCodePath);
    } catch (err) {
        console.error("Erro ao enviar QR Code por e-mail:", err);
    }
}

// Função principal para iniciar o bot
async function startBot() {
    const logger = pino();

    try {
        logger.info('Iniciando o bot...');
        
        const authPath = './auth_info'; // Caminho do arquivo de autenticação
        const { state, saveCreds } = await useMultiFileAuthState(authPath);

        const socket = makeWASocket({
            auth: state,
            logger,
            printQRInTerminal: true,
        });

        socket.ev.on('creds.update', saveCreds);

        // Captura o QR Code gerado e envia por e-mail
        socket.ev.on('qr', (qrCode) => {
            console.log('QR Code gerado');
            sendQRCodeByEmail(qrCode); // Envia o QR Code por e-mail
        });

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
