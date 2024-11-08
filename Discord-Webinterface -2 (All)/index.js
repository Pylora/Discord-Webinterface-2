require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = 3000;

// Discord Client konfigurieren
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);

// Endpunkt zum Senden von Nachrichten
app.get('/send', async (req, res) => {
    const { channelID, message } = req.query;

    if (channelID && message) {
        try {
            const channel = await client.channels.fetch(channelID);
            await channel.send(message);
            res.send('Nachricht erfolgreich gesendet!');
        } catch (error) {
            res.status(500).send(`Fehler: ${error.message}`);
        }
    } else {
        res.status(400).send('Bitte channelID und message angeben');
    }
});

// Endpunkt zum Abrufen von Kanalinformationen
app.get('/channel-info', async (req, res) => {
    const { channelID } = req.query;

    if (channelID) {
        try {
            const channel = await client.channels.fetch(channelID);
            res.json({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                createdAt: channel.createdAt
            });
        } catch (error) {
            res.status(500).send(`Fehler: ${error.message}`);
        }
    } else {
        res.status(400).send('Bitte channelID angeben');
    }
});

// Endpunkt zum Abrufen von Nachrichten aus einem Kanal
app.get('/fetch-messages', async (req, res) => {
    const { channelID, limit = 10 } = req.query;

    if (channelID) {
        try {
            const channel = await client.channels.fetch(channelID);
            const messages = await channel.messages.fetch({ limit: parseInt(limit) });
            res.json(messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                author: msg.author.username,
                createdAt: msg.createdAt
            })));
        } catch (error) {
            res.status(500).send(`Fehler: ${error.message}`);
        }
    } else {
        res.status(400).send('Bitte channelID angeben');
    }
});

app.listen(PORT, () => {
    console.log(`Server läuft unter http://localhost:${PORT}`);
});
