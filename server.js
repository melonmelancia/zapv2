const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const sock = makeWASocket({ auth: state });

    sock.ev.on("creds.update", saveCreds);

    const mensagem = fs.readFileSync("mensagem.json", "utf-8");
    const numeroDestino = process.env.PHONE_NUMBER + "@s.whatsapp.net";

    await sock.sendMessage(numeroDestino, { text: mensagem });

    console.log("Mensagem enviada para:", numeroDestino);
}

startBot();
