// Importa a biblioteca Baileys
const { WAConnection, MessageType, Mimetype } = require('@adiwajshing/baileys');

// Função para iniciar o bot
async function start() {
    const conn = new WAConnection();  // Cria a conexão com o WhatsApp

    // Quando o QR code for gerado, exibe no console para escanear
    conn.on('qr', (qr) => {
        console.log('Escaneie o código QR abaixo para conectar:');
        console.log(qr);
    });

    // Quando a conexão for aberta, envia uma mensagem indicando que está conectado
    conn.on('open', () => {
        console.log('Conectado ao WhatsApp!');
    });

    // Define os detalhes da conta do WhatsApp (se necessário)
    conn.loadAuthInfo('./auth_info.json');  // Carrega as credenciais de autenticação se existirem

    // Faz a conexão com o WhatsApp
    await conn.connect();

    // Salvando as credenciais de autenticação para evitar ter que escanear o QR novamente
    conn.on('close', () => {
        console.log('Conexão fechada. Salvando as informações de autenticação...');
        const authInfo = conn.base64EncodedAuthInfo();
        require('fs').writeFileSync('./auth_info.json', JSON.stringify(authInfo));
    });

    // Exemplo de envio de mensagem
    const to = '557591804307@c.us';  // Número do destinatário no formato internacional
    const message = 'Olá, esta é uma mensagem automática enviada pelo bot!';
    await conn.sendMessage(to, message, MessageType.text);  // Envia uma mensagem de texto
}

// Inicia o bot
start();
