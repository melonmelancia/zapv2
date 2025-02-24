const { makeWASocket } = require('@adiwajshing/baileys');
const fs = require('fs');

const authFile = './auth_info.json';

async function start() {
    const state = fs.existsSync(authFile) ? require(authFile) : undefined;
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Tentando reconectar...', shouldReconnect);
            if (shouldReconnect) {
                start();
            }
        } else if (connection === 'open') {
            console.log('Conectado ao WhatsApp!');
        }
    });

    sock.ev.on('auth-state.update', (authState) => {
        fs.writeFileSync(authFile, JSON.stringify(authState, null, 2));
    });

    await sock.connect();
    console.log('Bot iniciado!');
}

start();
