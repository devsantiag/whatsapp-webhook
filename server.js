const express = require("express");
require("dotenv").config();
const axios = require("axios");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const RECIPIENT_PHONE = process.env.RECIPIENT_PHONE;

app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verificado!");
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
});

app.post("/webhook", (req, res) => {
    console.log("Evento recebido:");
    console.log(JSON.stringify(req.body, null, 2));

    res.sendStatus(200);
});

app.get("/send-message", async (req, res) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: RECIPIENT_PHONE,
                type: "text",
                text: {
                    body: "sem crise man. Come ai em pazzz"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Mensagem enviada!");
        console.log(response.data);

        res.json({
            success: true,
            response: response.data
        });

    } catch (error) {
        console.error(
            "Erro ao enviar mensagem:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});