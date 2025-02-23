const { useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys');
const { writeFileSync } = require('fs');
const path = require('path');

async function authenticate() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_info'));
  const sock = makeWASocket({ auth: state });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (lastDisconnect.error?.output?.statusCode !== 401) {
        console.log('Reconectando...');
        authenticate();  // Reconectar se necessário
      }
    }
    if (connection === 'open') {
      console.log('Conectado ao WhatsApp!');
      // Salve as credenciais após a primeira conexão
      sock.ev.on('creds.update', saveCreds);
    }
  });

  sock.ev.on('qr', (qr) => {
    console.log('QR Code gerado, escaneie com o WhatsApp!');
    // Você pode usar uma biblioteca para exibir o QR Code ou apenas mostrá-lo no console
    console.log(qr);
  });
}

authenticate();
