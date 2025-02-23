const { WAConnection } = require('@whiskeysockets/baileys');
const fs = require('fs');

// Cria uma nova instância do WAConnection
const conn = new WAConnection();

conn.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    // Aqui você pode gerar o QR Code para escanear no WhatsApp
    require('qrcode').toString(qr, { type: 'terminal' }, (err, qrCode) => {
        if (err) throw err;
        console.log(qrCode);
    });
});

conn.on('open', () => {
    console.log('Conectado ao WhatsApp!');
    // Salva a sessão para uso futuro
    fs.writeFileSync('./auth_info/session.json', JSON.stringify(conn.base64EncodedAuthInfo()));
    console.log('Sessão salva com sucesso!');
});

async function startAuth() {
    await conn.connect();
}

startAuth();
