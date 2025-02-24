require("dotenv").config();
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

async function startBot() {
    console.log("🔄 Iniciando bot...");

    const authPath = path.join(__dirname, "auth_info");
    if (!fs.existsSync(authPath)) {
        console.log("📁 Criando pasta auth_info...");
        fs.mkdirSync(authPath);
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr, pairingCode } = update;

        if (process.env.PAIRING_CODE === "true") {
            if (!pairingCode && process.env.NUMBER) {
                const code = await sock.requestPairingCode(process.env.NUMBER.replace(/\D/g, ""));
                console.log(`📲 Código de emparelhamento: ${code}`);
            }
        }

        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            console.log("⚠️ Conexão fechada. Tentando reconectar:", shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === "open") {
            console.log("✅ Conectado ao WhatsApp!");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const message = m.messages[0];
        if (!message.key.fromMe && message.message?.conversation) {
            const text = message.message.conversation.toLowerCase();
            console.log(`📩 Mensagem recebida: ${text}`);

            if (text === "oi") {
                await sock.sendMessage(message.key.remoteJid, { text: "Oi! Como posso ajudar?" });
            }
        }
    });
}

startBot();
