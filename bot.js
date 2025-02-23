const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_info'));
  const sock = makeWASocket({ auth: state });

  sock.ev.on('connection.update', (update) => {
    const { connection } = update;
    if (connection === 'open') {
      console.log('Bot está online!');
    }
  });

  sock.ev.on('messages.upsert', async (message) => {
    const msg = message.messages[0];
    const sender = msg.key.remoteJid;
    
    // Responder à mensagem recebida com base no conteúdo
    if (msg.message.conversation) {
      const command = msg.message.conversation.toLowerCase();
      if (command === 'olá') {
        await sock.sendMessage(sender, { text: 'Olá! Como posso ajudar?' });
      }
    }
  });

  // Salva credenciais após uso
  sock.ev.on('creds.update', saveCreds);
}

startBot();
