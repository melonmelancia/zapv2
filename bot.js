const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');  // Adiciona a biblioteca para gerar o QR Code
const path = require('path');
const fs = require('fs');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_info'));
  const sock = makeWASocket({ auth: state });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexão perdida, reconectando:', shouldReconnect);
    }
    if (connection === 'open') {
      console.log('Bot está online!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('qr', (qr) => {
    console.log('QR Code gerado para escanear:', qr);
    QRCode.toFile(path.join(__dirname, 'qr.png'), qr, (err) => {
      if (err) throw err;
      console.log('QR Code gerado e salvo como qr.png');
    });
  });

  console.log("Iniciando a conexão...");
}

startBot();
