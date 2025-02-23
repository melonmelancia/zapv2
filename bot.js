const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

// Criar pasta auth_info se não existir
const authPath = path.join(__dirname, 'auth_info');
if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath);
}

// Usar estado de autenticação com a pasta auth_info
const { state, saveCreds } = useMultiFileAuthState(authPath);

// Criação da conexão com o WhatsApp
const conn = makeWASocket({
    auth: state,  // Usando o estado de autenticação
    printQRInTerminal: true,  // Exibir QR Code no terminal se necessário
});

// Salvar as credenciais quando a autenticação for bem-sucedida
conn.ev.on('auth-state.update', (update) => {
    if (update?.credentials) {
        saveCreds();  // Salvar as credenciais
        console.log('Credenciais salvas com sucesso!');
    }
});

// Monitorar o status da conexão
conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
        console.log('Conectado ao WhatsApp!');
    }
    if (lastDisconnect?.error?.output?.statusCode === 401) {
        console.log('Sessão expirada, por favor reautentique.');
    }
});

// Função para iniciar o bot
async function startBot() {
    await conn.connect();  // Conectar ao WhatsApp
}

startBot();
