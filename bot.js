const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

// Caminho para a pasta auth_info
const authPath = path.join(__dirname, 'auth_info');

// Função para garantir que a pasta tenha permissões corretas
const ensureAuthDir = () => {
    if (!fs.existsSync(authPath)) {
        console.log('A pasta auth_info não existe, criando...');
        fs.mkdirSync(authPath, { recursive: true });
        fs.chmodSync(authPath, '0777'); // Permissões de leitura e escrita
    } else {
        console.log('A pasta auth_info já existe.');
    }
};

// Verificar as permissões da pasta
const checkPermissions = () => {
    try {
        fs.accessSync(authPath, fs.constants.R_OK | fs.constants.W_OK); // Verifica se é legível e gravável
        console.log('A pasta auth_info tem permissões de leitura e escrita.');
    } catch (err) {
        console.error('Erro: Não foi possível acessar a pasta auth_info. Verifique as permissões.');
        process.exit(1);
    }
};

// Assegurando que a pasta auth_info tenha permissões corretas
ensureAuthDir();
checkPermissions();

// Usar o estado de autenticação com a pasta auth_info
const { state, saveCreds } = useMultiFileAuthState(authPath);

// Criar a conexão com o WhatsApp usando a autenticação armazenada
const conn = makeWASocket({
    auth: state,  // Usando o estado de autenticação
    printQRInTerminal: false,  // Desabilitar QR Code, já que estamos usando autenticação com código
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
