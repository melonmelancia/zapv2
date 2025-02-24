const { makeWASocket, useSingleFileAuthState, DisconnectReason, MessageType } = require('@adiwajshing/baileys');
const fs = require('fs');

// Caminho para o arquivo de autenticação
const authFile = './auth_info.json';

async function start() {
    // Verifica se o arquivo de autenticação existe
    const state = fs.existsSync(authFile) ? require(authFile) : undefined;

    // Cria a conexão com o WhatsApp
    const sock = makeWASocket({
        auth: state,  // Usa o estado de autenticação (caso exista)
        printQRInTerminal: true,
    });

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

    // Atualiza o estado de autenticação ao longo do tempo
    sock.ev.on('auth-state.update', (authState) => {
        fs.writeFileSync(authFile, JSON.stringify(authState, null, 2));
    });

    // Aguarda a leitura do QR Code ou autenticação
    await sock.connect();

    // Exemplo de envio de mensagem
    const to = 'numero_de_telefone_do_destinatario@c.us';  // Altere o número de telefone
    const message = 'Olá, esta é uma mensagem automática enviada pelo bot!';
    await sock.sendMessage(to, { text: message });

    console.log('Mensagem enviada com sucesso!');
}

start();
