const { WAConnection, MessageType } = require('@adiwajshing/baileys');
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
    
    const conn = new WAConnection();

    // Lê os dados de autenticação ou cria se não existirem
    conn.loadAuthInfo(authPath);

    conn.on('open', () => {
      console.log('Conectado com sucesso!');
    });

    conn.on('qr', qr => {
      console.log('Escaneie o código QR:', qr);
    });

    conn.on('message-new', async (message) => {
      const msg = message.message;
      console.log('Mensagem recebida: ', msg);

      if (msg.conversation === 'oi') {
        await conn.sendMessage(message.key.remoteJid, 'Olá! Como posso te ajudar?');
      }

      // Enviar e-mail ao destinatário
      if (msg.conversation === 'email') {
        await sendEmail('Assunto do E-mail', 'Mensagem do corpo do e-mail');
        await conn.sendMessage(message.key.remoteJid, 'E-mail enviado com sucesso!');
      }
    });

    await conn.connect();
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
