const { makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const nodemailer = require('nodemailer');

// Configuração do estado de autenticação
const authPath = join(__dirname, 'auth_info');
const { state, saveCreds } = useSingleFileAuthState(authPath);

async function startBot() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, isNewUser } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to', lastDisconnect.error, ', reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                startBot();  // Restart the bot if disconnected
            }
        } else if (connection === 'open') {
            console.log('Connection established!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        console.log('Received message:', m);
        if (m.messages[0].key.fromMe) return;  // Ignore messages sent by the bot itself

        // Aqui você pode processar as mensagens recebidas, por exemplo, enviar um e-mail com a mensagem
        await sendEmail(m.messages[0].message.conversation);
    });
}

async function sendEmail(message) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'u1024025@gmail.com',  // Substitua com seu e-mail
            pass: 'netinho123'  // Substitua com sua senha ou senha de app
        }
    });

    let info = await transporter.sendMail({
        from: 'u1024025@gmail.com',
        to: 'netopc53@gmail.com',  // Substitua com o e-mail de destino
        subject: 'Nova mensagem do WhatsApp',
        text: message
    });

    console.log('Email enviado:', info.messageId);
}

// Inicia o bot
startBot().catch(err => console.error(err));
