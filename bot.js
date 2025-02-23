const { WAConnection } = require('@whiskeysockets/baileys');
const fs = require('fs');

// Cria uma nova instância do WAConnection
const conn = new WAConnection();

// Tenta carregar a sessão salva
fs.existsSync('./auth_info/session.json') && conn.loadAuthInfo('./auth_info/session.json');

conn.on('open', () => {
    console.log('Conectado ao WhatsApp!');
});

conn.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    // Você pode gerar o QR Code aqui caso precise para autenticar na primeira vez
    require('qrcode').toString(qr, { type: 'terminal' }, (err, qrCode) => {
        if (err) throw err;
        console.log(qrCode);
    });
});

async function startBot() {
    await conn.connect();
}

startBot();
