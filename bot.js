const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@adiwajshing/baileys');
const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const nodemailer = require('nodemailer');

// Diretório de autenticação
const authPath = join(__dirname, 'auth_info');
if (!existsSync(authPath)) {
    mkdirSync(authPath); // Cria o diretório se não existir
}

async function startBot() {
    // Tenta buscar a versão mais recente do Baileys
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Usando a versão ${version} do Baileys, mais recente: ${isLatest}`);

    // Usa o estado de autenticação com a função useMultiFileAuthState
    const { state, saveCreds } = useMultiFileAuthState(authPath);

    // Verifica se o estado de autenticação foi carregado corretamente
    if (!state) {
        console.log("Erro: Não foi possível carregar o estado de autenticação.");
        return;
    }

    console.log("Autenticação carregada com sucesso.");

    // Inicializa o socket com a autenticação
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state // Passa o estado de autenticação
    });

    // Acompanhar o estado de conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to', lastDisconnect.error, ', reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                startBot();  // Reconnect if the error was not loggedOut
            }
        } else if (connection === 'open') {
            console.log('Connection established!');
        }
    });

    // Salvar credenciais sempre que forem atualizadas
    sock.ev.on('creds.update', saveCreds);

    // Processar mensagens recebidas
    sock.ev.on('messages.upsert', async (m) => {
        console.log('Received message:', m);
        if (m.messages[0].key.fromMe) return;  // Ignore messages from the bot itself

        // Aqui você pode processar as mensagens recebidas, por exemplo, enviando um e-mail com a mensagem
        await sendEmail(m.messages[0].message.conversation);
    });
}

async function sendEmail(message) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'u1024025@gmail.com',  // Seu e-mail
            pass: 'netinho123'           // Sua senha
        }
    });

    let info = await transporter.sendMail({
        from: 'u1024025@gmail.com',             // Seu e-mail
        to: 'netopc53@gmail.com',              // E-mail de destino
        subject: 'Nova mensagem do WhatsApp',
        text: message
    });

    console.log('Email enviado:', info.messageId);
}

// Inicia o bot
startBot().catch(err => console.error('Erro ao iniciar o bot:', err));
