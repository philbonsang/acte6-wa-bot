const express = require("express");
const venom = require("venom-bot");

const app = express();
const port = process.env.PORT || 3000;

let clientInstance = null;

venom
  .create(
    {
      session: "acte6bot2",
      puppeteerOptions: {
        headless: true,
        args: ["--no-sandbox"]
      },
      useChrome: false,
      logQR: true // ✅ affiche QR dans les logs
    },
    (base64Qrimg, asciiQR, attempts, urlCode) => {
      console.log("⚠️ QR prêt !");
      console.log("🧾 QR ASCII :\n" + asciiQR);
      console.log("🔗 URL : " + urlCode);
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
  res.send("🤖 Acte 6 bot is running");
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
