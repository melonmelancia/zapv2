const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Usar um estado de autenticação para carregar e salvar a sessão
const { state, saveCreds } = useMultiFileAuthState(path.join(__dirname, 'auth_info'));

// Cria o socket de conexão
const conn = makeWASocket({
    auth: state,
    printQRInTerminal: true,  // Mostrar o QR Code no terminal se necessário
});

// Salva as credenciais quando a autenticação for bem-sucedida
conn.ev.on('auth-state.update', (stateUpdate) => {
    if (stateUpdate?.credentials) {
        saveCreds();
        console.log('Credenciais salvas');
    }
});

// Evento para quando o bot estiver conectado ao WhatsApp
conn.ev.on('connection.update', (update) => {
    const { connection } = update;
    if (connection === 'open') {
        console.log('Conectado ao WhatsApp!');
    }
});

async function startBot() {
    // Conecta o bot ao WhatsApp
    await conn.connect();
}

startBot();
