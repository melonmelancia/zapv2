// Importa a biblioteca Baileys de forma adequada
const { default: makeWASocket, fetchLatestBaileysVersion, DisconnectReason, MessageType } = require('@adiwajshing/baileys');
const fs = require('fs');

const authFile = './auth_info.json';

async function start() {
    let authState = {};
    if (fs.existsSync(authFile)) {
        authState = JSON.parse(fs.readFileSync(authFile));
    }

    // Cria a conexão com o WhatsApp
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: authState
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Tentando reconectar...', shouldReconnect);
            if (shouldReconnect) {
                start(); // Tenta reconectar
            }
        } else if (connection === 'open') {
            console.log('Conectado ao WhatsApp!');
        }
    });

    // Salva o estado de autenticação no arquivo
    sock.ev.on('auth-state.update', (auth) => {
        fs.writeFileSync(authFile, JSON.stringify(auth));
    });

    const to = 'numero_de_telefone_do_destinatario@c.us';
    const message = 'Olá, esta é uma mensagem automática enviada pelo bot!';
    await sock.sendMessage(to, { text: message });

    console.log('Mensagem enviada com sucesso!');
}

start();
