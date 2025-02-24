const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

async function startBot() {
    console.log('🔄 Iniciando bot...');

    // Criar diretório de autenticação, se não existir
    const authFolder = path.join(__dirname, 'auth_info');
    if (!fs.existsSync(authFolder)) {
        console.log('📁 A pasta auth_info não existe, criando...');
        fs.mkdirSync(authFolder, { recursive: true });
    } else {
        console.log('📁 A pasta auth_info já existe.');
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`📲 Usando versão do Baileys: ${version.join('.')}`);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false // Desativa QR Code
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log('✅ Conectado com sucesso!');
        } else if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            console.log(`⚠️ Conexão fechada. Tentando reconectar: ${shouldReconnect}`);
            if (shouldReconnect) startBot();
        } else if (connection === 'connecting') {
            console.log('🔄 Conectando...');
        }
    });

    // Se não estiver autenticado, gera o código de emparelhamento
    if (!state.creds.registered) {
        console.log('🔄 Gerando código de emparelhamento...');
        try {
            const code = await sock.requestPairingCode("5511999999999"); // Insira seu número no formato internacional
            console.log(`🔑 Código de emparelhamento: ${code}`);
        } catch (error) {
            console.error('❌ Erro ao gerar código:', error);
        }
    }
}

startBot();
