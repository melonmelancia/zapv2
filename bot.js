const { WAConnection, MessageType } = require('@adiwajshing/baileys');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Função para enviar o QR Code por e-mail (opcional)
async function sendQRCodeEmail(qrImagePath) {
  let transporter = nodemailer.createTransport({
    service: 'gmail', // ou qualquer outro serviço de e-mail
    auth: {
      user: 'u1024025@gmail.com',
      pass: 'netinho123',
    },
  });

  let mailOptions = {
    from: 'u1024025@gmail.com',
    to: 'netopc53@gmail.com',
    subject: 'QR Code do WhatsApp',
    text: 'Aqui está o QR Code gerado pelo bot do WhatsApp.',
    attachments: [
      {
        filename: 'qr-code.png',
        path: qrImagePath, // Caminho para o arquivo do QR code
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('QR code enviado por e-mail com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

async function startBot() {
  const conn = new WAConnection();

  conn.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    // Salvando o QR Code em um arquivo de imagem
    const qrImagePath = 'qr-code.png';
    fs.writeFileSync(qrImagePath, qr, { encoding: 'base64' });

    // Enviando o QR Code por e-mail
    sendQRCodeEmail(qrImagePath);
  });

  conn.on('open', () => {
    console.log('Bot is connected and logged in');
  });

  // Conectando ao WhatsApp
  await conn.connect();
}

startBot().catch((err) => console.log(err));
