const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

// Criar a pasta auth_info se não existir
const authPath = path.join(__dirname, 'auth_info');
if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath);
}

// Usar o estado de autenticação com a pasta auth_info
const { state, saveCreds } = useMultiFileAuthState(authPath);

// Verificar se o estado foi corretamente carregado
if (!state) {
    console.log("Erro: O estado de autenticação não foi carregado.");
    process.exit(1); // Finaliza o script com erro, caso o estado não esteja disponível
}

// Criar a conexão com o WhatsApp
const conn = makeWASocket({
    auth: state,  // Usando o estado de autenticação
    printQRInTerminal: true,  // Exibe QR Code no terminal se necessário
});

// Salvar as credenciais quando a autenticação for bem-sucedida
conn.ev.on('auth-state.update', (update) => {
    if (update?.credentials) {
        saveCreds();  // Salva as credenciais
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
    try {
        await conn.connect();  // Conectar ao WhatsApp
    } catch (err) {
        console.error('Erro ao conectar:', err);
    }
}

startBot();
