// Importa os pacotes necessários
const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Carrega as variáveis de ambiente

// Caminho do arquivo de autenticação
const authPath = './auth_info.json';

// Cria ou carrega o estado de autenticação
const { state, saveCreds } = useSingleFileAuthState(authPath);

// Função para iniciar o bot
async function startBot() {
    try {
        const socket = makeWASocket({
            auth: state, // Passa o estado de autenticação
        });

        // Salvando credenciais após a autenticação
        socket.ev.on('creds.update', saveCreds);

        socket.ev.on('open', () => {
            console.log('Bot autenticado e pronto!');
        });

        // Outras configurações do bot, por exemplo, escutando mensagens
        socket.ev.on('messages.upsert', async (m) => {
            console.log('Nova mensagem: ', m);
        });

        // Função para enviar e-mail, usando variáveis de ambiente
        async function sendEmail() {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,  // Usa a variável de ambiente
                    pass: process.env.EMAIL_PASS,  // Usa a variável de ambiente
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER, // Usa a variável de ambiente
                to: 'netopc53@gmail.com',
                subject: 'Testando o envio de e-mail',
                text: 'Este é um teste do envio de e-mail via Nodemailer.',
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log('E-mail enviado com sucesso!');
            } catch (error) {
                console.error('Erro ao enviar e-mail:', error);
            }
        }

        // Chame a função de enviar e-mail, se necessário
        sendEmail();

    } catch (err) {
        console.error('Erro ao iniciar o bot:', err);
    }
}

startBot();
