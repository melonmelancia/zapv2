const { makeWASocket, useMultiFileAuthState } = require('@adiwajshing/baileys');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const authPath = path.resolve('./auth_info');
const email = process.env.EMAIL; // Seu e-mail para autenticação
const password = process.env.PASSWORD; // Senha ou senha de app
const destinatario = process.env.EMAIL_DESTINATARIO; // E-mail do destinatário

async function startBot() {
  try {
    console.log('Iniciando o bot...');
    
    const { state, saveCreds } = useMultiFileAuthState(authPath);
    
    const sock = makeWASocket({
      auth: state,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (message) => {
      const msg = message.messages[0];
      console.log('Mensagem recebida: ', msg);

      if (msg.key.fromMe) {
        return; // Ignora mensagens enviadas pelo bot
      }

      // Exemplo de resposta automática
      if (msg.message.conversation === 'oi') {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Olá! Como posso te ajudar?' });
      }

      // Enviar e-mail ao destinatário
      if (msg.message.conversation === 'email') {
        await sendEmail('Assunto do E-mail', 'Mensagem do corpo do e-mail');
        await sock.sendMessage(msg.key.remoteJid, { text: 'E-mail enviado com sucesso!' });
      }
    });

    await sock.connect();
    console.log('Bot conectado!');
    
  } catch (error) {
    console.error('Erro ao iniciar o bot:', error);
  }
}

// Função para enviar e-mail
async function sendEmail(subject, text) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
      },
    });

    const mailOptions = {
      from: email,
      to: destinatario,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado!');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

startBot();
