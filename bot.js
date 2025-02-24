const { WAConnection, MessageType, Mimetype } = require('@adiwajshing/baileys');
const fs = require('fs');

async function start() {
  const conn = new WAConnection();

  // Função chamada quando o bot está pronto
  conn.on('open', () => {
    console.log('Bot está pronto!');
  });

  // Função chamada quando uma mensagem de chat é recebida
  conn.on('chat-update', async (chatUpdate) => {
    if (chatUpdate.messages) {
      const message = chatUpdate.messages.all()[0];
      const messageType = message.key.remoteJid.endsWith('@g.us') ? 'grupo' : 'individual';
      console.log(`Mensagem recebida em chat ${messageType}:`, message);

      // Responde à mensagem com um texto simples
      if (message.message.conversation) {
        const text = message.message.conversation;
        console.log(`Mensagem: ${text}`);
        
        // Respondendo ao usuário
        if (text === 'Olá') {
          await conn.sendMessage(message.key.remoteJid, 'Olá! Como posso ajudar?', MessageType.text);
        }
      }
    }
  });

  // Função chamada quando o QR Code é recebido
  conn.on('qr', (qr) => {
    // Exibindo o QR Code (caso precise)
    console.log('QR Code recebido:', qr);
  });

  // Função para autenticar via código de 6 dígitos
  conn.on('auth_failure', (err) => {
    console.error('Falha na autenticação:', err);
  });

  // Conectando e autenticando via código de 6 dígitos
  const phoneNumber = 'whatsapp:+55YOURNUMBER';  // Substitua com seu número de telefone
  console.log('Enviando código de autenticação para o número:', phoneNumber);
  
  try {
    await conn.connect({
      phoneNumber: phoneNumber,  // Número do WhatsApp
      code: '123456'  // Código de 6 dígitos enviado via SMS
    });

    console.log('Autenticado com sucesso!');
  } catch (err) {
    console.error('Erro ao tentar autenticar:', err);
  }
}

// Iniciando o bot
start();
