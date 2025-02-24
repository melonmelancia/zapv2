// Importa a biblioteca Baileys
const { makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, MessageType } = require('@adiwajshing/baileys');
const fs = require('fs');

// Função para iniciar o bot
async function start() {
    // Carrega ou cria as credenciais de autenticação
    const { state, saveState } = useSingleFileAuthState('./auth_info.json');

    // Cria a conexão com o WhatsApp
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    // Quando a conexão for aberta, exibe a mensagem
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

    // Salvando as credenciais de autenticação quando a conexão for fechada
    sock.ev.on('auth-state.update', saveState);

    // Enviar uma mensagem
    const to = 'numero_de_telefone_do_destinatario@c.us';  // Número do destinatário no formato internacional
    const message = 'Olá, esta é uma mensagem automática enviada pelo bot!';
    await sock.sendMessage(to, { text: message });

    console.log('Mensagem enviada com sucesso!');
}

// Inicia o bot
start();
