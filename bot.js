const { makeWASocket, fetchLatestBaileysVersion, useSingleFileAuthState, DisconnectReason, MessageType } = require('@adiwajshing/baileys');
const fs = require('fs');

// Caminho para o arquivo de autenticação
const authFile = './auth_info.json';

async function start() {
    // Usa o estado de autenticação a partir do arquivo
    const { state, saveState } = useSingleFileAuthState(authFile);

    // Cria a conexão com o WhatsApp
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
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

    // Atualiza o estado de autenticação
    sock.ev.on('auth-state.update', saveState);

    // Aguarda a leitura do QR Code ou autenticação
    await sock.connect();

    // Exemplo de envio de mensagem
    const to = 'numero_de_telefone_do_destinatario@c.us';  // Altere o número de telefone
    const message = 'Olá, esta é uma mensagem automática enviada pelo bot!';
    await sock.sendMessage(to, { text: message });

    console.log('Mensagem enviada com sucesso!');
}

start();
