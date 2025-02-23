const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');

async function startBot() {
  try {
    // Configura a pasta onde as credenciais serão salvas
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_info'));
    const sock = makeWASocket({ auth: state });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      console.log('Conexão Atualizada:', update);
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
        console.log('Conexão perdida, reconectando:', shouldReconnect);
      }
      if (connection === 'open') {
        console.log('Bot está online!');
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // Adicionando mais logs para diagnosticar
    sock.ev.on('qr', (qr) => {
      console.log('QR Code para escanear:', qr);
    });

    console.log("Iniciando a conexão...");
  } catch (error) {
    console.error("Erro ao iniciar o bot:", error);
  }
}

startBot();
