const { makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, 'auth_info');

// Criando a pasta auth_info caso não exista
if (!fs.existsSync(authPath)) {
    console.log('A pasta auth_info não existe, criando...');
    fs.mkdirSync(authPath, { recursive: true });
}

// Função para inicializar o bot
const startBot = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    if (!state || !state.creds) {
        console.error('Erro: O estado de autenticação não foi carregado corretamente.');
        return;
    }

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, fs.promises),
        },
        printQRInTerminal: false, // Desativa o QR Code
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, isNewLogin } = update;

        if (connection === 'open') {
            console.log('✅ Conectado ao WhatsApp!');
        } else if (connection === 'close') {
            console.log('⚠️ Conexão fechada:', lastDisconnect?.error);
        } else if (isNewLogin) {
            console.log('🔄 Gerando código de emparelhamento...');
            try {
                const code = await sock.requestPairingCode("seu-numero-aqui"); // Exemplo: "5511999999999"
                console.log(`🔑 Código de emparelhamento: ${code}`);
            } catch (error) {
                console.error('❌ Erro ao gerar código:', error);
            }
        }
    });
};

startBot();
