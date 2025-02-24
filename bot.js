const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const { generate } = require('qrcode-terminal');

(async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { qr } = update;
        if (qr) {
            console.log('Escaneie o QR Code abaixo ou abra o arquivo qr_code.png:');
            generate(qr, { small: true });
            fs.writeFileSync('qr_code.png', qr);
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const sender = msg.key.remoteJid;
        console.log('Mensagem recebida de:', sender);

        await sock.sendMessage(sender, { text: 'Olá!' });
    });
})();
