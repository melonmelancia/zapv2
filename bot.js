const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const dotenv = require('dotenv');
dotenv.config();

// Função para iniciar o bot
async function startBot() {
  // Usar multi-auth para carregar a sessão salva
  const { state, saveCreds } = await useMultiFileAuthState('session'); // 'session' é o diretório onde a sessão será salva

  const sock = makeWASocket({
    auth: state,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log('Você foi desconectado. Realizando nova autenticação...');
        startBot();  // Recria a conexão caso haja desconexão
      }
    }
  });

  // Evento quando a conexão for estabelecida
  sock.ev.on('open', () => {
    console.log('Bot conectado com sucesso!');
  });

  // Lidar com mensagens recebidas
  sock.ev.on('messages.upsert', async (message) => {
    const { messages } = message;
    if (messages && messages.length > 0) {
      const messageContent = messages[0];
      console.log(`Mensagem recebida: ${messageContent.message.conversation}`);

      // Responder a mensagem recebida
      await sock.sendMessage(messageContent.key.remoteJid, {
        text: `Você disse: ${messageContent.message.conversation}`,
      });
    }
  });
}

// Iniciar o bot
startBot().catch((err) => {
  console.error('Erro ao iniciar o bot:', err);
});
