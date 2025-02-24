const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, 'auth_info');

// Função para garantir que a pasta auth_info existe
if (!fs.existsSync(authPath)) {
    console.log('A pasta auth_info não existe, criando...');
    fs.mkdirSync(authPath, { recursive: true });
}

// Verifique se a pasta tem permissão de leitura e escrita
fs.access(authPath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (err) {
        console.error('Erro: A pasta auth_info não tem permissão de leitura/escrita.');
        process.exit(1);
    } else {
        console.log('A pasta auth_info tem permissões de leitura e escrita.');
    }
});

// Inicializando o estado de autenticação
const startBot = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    if (!state || !state.creds) {
        console.error('Erro: O estado de autenticação não foi carregado corretamente.');
        return;
    }

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Como você quer código ao invés de QR
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log('Conectado ao WhatsApp!');
        } else if (connection === 'close') {
            console.log('Desconectado:', lastDisconnect.error);
        }
    });
};

startBot();
