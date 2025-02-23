const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_info'));
  const sock = makeWASocket({ auth: state });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexão perdida', shouldReconnect);
    }
    if (connection === 'open') {
      console.log('Bot está online!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Aqui imprimimos o QR Code para escaneamento
  sock.ev.on('qr', (qr) => {
    console.log('QR Code para escanear:', qr);
  });
}

startBot();
