// Importando o Baileys e outras dependências
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const dotenv = require('dotenv');

// Carregando as variáveis do arquivo .env
dotenv.config();

// Configurações do número do WhatsApp e do caminho de sessão
const phoneNumber = process.env.PHONE_NUMBER;
const sessionPath = process.env.SESSION_PATH;

// Função principal do bot
async function startBot() {
    // Verificando a versão do Baileys
    const { version } = await fetchLatestBaileysVersion();
    console.log('Baileys versão:', version);

    // Carregando o estado de autenticação (usando a pasta auth_info)
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    // Criando o socket de conexão com o WhatsApp
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
    });

    // Eventos para quando o bot estiver conectado
    sock.ev.on('open', () => {
        console.log('Conectado ao WhatsApp!');
    });

    // Reconectando automaticamente em caso de desconexão
    sock.ev.on('close', ({ reason }) => {
        console.log('Conexão fechada:', reason);
        startBot(); // Re-tenta a conexão
    });

    // Quando o bot receber uma mensagem, ele responderá com uma confirmação
    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.key.fromMe) {
            await sock.sendMessage(message.key.remoteJid, { text: 'Olá, mensagem recebida!' });
        }
    });

    // Iniciando o bot
    console.log('Iniciando o bot...');
}

startBot().catch(err => console.error('Erro ao iniciar o bot:', err));
