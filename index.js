const express = require("express");
const venom = require("venom-bot");
const QRCode = require("qrcode");

const app = express();
const port = process.env.PORT || 3000;

let clientInstance = null;
let currentBase64QR = null;

venom
  .create(
    {
      session: "acte6bot",
      puppeteerOptions: {
        headless: true,
        args: ["--no-sandbox"],
      },
      useChrome: false,
    },
    (base64Qrimg, asciiQR, attempts, urlCode) => {
      currentBase64QR = base64Qrimg; // ← stock le QR pour qu’on puisse le voir
      console.log("🔗 Scan ce lien pour WhatsApp : " + urlCode);
    }
  )
  .then((client) => {
    clientInstance = client;
    console.log("✅ Bot connecté à WhatsApp");
  })
  .catch((err) => {
    console.error("Erreur lors de la création du bot", err);
  });

app.use(express.json());

app.get("/", (req, res) => {
  if (currentBase64QR) {
    res.send(`
      <h2>Scan pour connecter le bot WhatsApp :</h2>
      <img src="${currentBase64QR}" style="max-width:400px;">
    `);
  } else {
    res.send("QR code pas encore prêt...");
  }
});

app.post("/send", async (req, res) => {
  const { number, message } = req.body;

  if (!clientInstance) {
    return res.status(503).send("⛔ Bot pas encore prêt");
  }

  try {
    await clientInstance.sendText(number + "@c.us", message);
    res.send("✅ Message envoyé à " + number);
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi:", err);
    res.status(500).send("Erreur envoi message");
  }
});

app.listen(port, () => {
  console.log("🚀 Serveur en ligne sur le port " + port);
});
