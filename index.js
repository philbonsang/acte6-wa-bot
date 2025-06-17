process.env.CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const express = require("express");
const venom = require("venom-bot");

const app = express();
const port = process.env.PORT || 3000;

let clientInstance = null;

venom
  .create({ session: "acte6bot" })
  .then((client) => {
    clientInstance = client;
    console.log("✅ Bot connecté à WhatsApp");
  })
  .catch((err) => {
    console.error("Erreur lors de la création du bot", err);
  });

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🤖 Bot Venom prêt !");
});

app.post("/send", async (req, res) => {
  const { number, message } = req.body;
  if (!clientInstance) {
    return res.status(503).send("Bot pas encore prêt");
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
  console.log("Serveur démarré sur le port " + port);
});
