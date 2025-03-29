const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/stripe-webhook", async (req, res) => {
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details.email;
    const name = session.customer_details.name || "Utilisateur";

    try {
      await axios.post("https://api.marketing.deal.ai/api/2024-01/whitelabel/users", {
        firstName: name,
        email: email,
        sendInviteEmail: "yes",
      }, {
        headers: {
          "Deal-AI-API-Key": process.env.DEAL_AI_API_KEY,
          "Content-Type": "application/json",
        },
      });

      console.log("Utilisateur ajouté avec succès à Flairy.io");
      res.status(200).send("Utilisateur créé");
    } catch (err) {
      console.error("Erreur API Deal.ai :", err.response?.data || err.message);
      res.status(500).send("Erreur API Deal.ai");
    }
  } else {
    res.status(200).send("Event ignoré");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});