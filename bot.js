const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Caminho para o arquivo de autenticação
const authPath = path.resolve('./auth_info.json');

// Carrega o estado de autenticação (se existir) ou cria um novo
const { state, saveCreds } = useSingleFileAuthState(authPath);

const email = process.env.EMAIL; // Seu e-mail para autenticação
const password = process.env.PASSWORD; // Senha ou senha de app
const destinatario = process.env.EMAIL_DESTINATARIO; // E-mail do destinatário

async function startBot() {
  try {
    console.log('Iniciando o bot...');

    // Criação da conexão usando makeWASocket
    const conn = makeWASocket({
      auth: state, // Usando o estado de autenticação
    });

    conn.ev.on('creds.update', saveCreds); // Atualiza as credenciais sempre que houver mudanças

    conn.on('open', () => {
      console.log('Conectado com sucesso!');
    });

    conn.on('qr', qr => {
      console.log('Escaneie o código QR:', qr);
    });

    conn.on('message-new', async (message) => {
      const msg = message.message;
      console.log('Mensagem recebida: ', msg);

      // Exemplo de resposta automatizada
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
