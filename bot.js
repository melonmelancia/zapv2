const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

// Caminho para a pasta auth_info
const authPath = path.join(__dirname, 'auth_info');

// Verificar se a pasta auth_info existe, se não, criar
if (!fs.existsSync(authPath)) {
    console.log('A pasta auth_info não existe, criando...');
    fs.mkdirSync(authPath);  // Cria a pasta
    fs.chmodSync(authPath, '0777');  // Permite acesso total à pasta (leitura e escrita)
} else {
    console.log('A pasta auth_info já existe.');
}

// Usar o estado de autenticação com a pasta auth_info
const { state, saveCreds } = useMultiFileAuthState(authPath);

// Adicionando um log para verificar se o state foi carregado corretamente
if (!state) {
    console.log('Erro: O estado de autenticação não foi carregado.');
    console.log('Certifique-se de que a pasta auth_info tem permissão de leitura e escrita.');
    process.exit(1);  // Finaliza o script com erro
} else {
    console.log('Estado de autenticação carregado com sucesso.');
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
