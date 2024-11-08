Hier ist eine erweiterte Version des Discord-Webinterface-Projekts, die mehr Funktionalität bietet. In dieser Version kannst du:

1. Nachrichten an verschiedene Kanäle senden.
2. Kanal- und Benutzerinformationen abrufen.
3. Nachrichten in einem Kanal anzeigen.

---

### 1. Projekt-Setup und Abhängigkeiten installieren

Erstelle ein Projekt und installiere die erforderlichen Abhängigkeiten:

```bash
mkdir discord-webinterface
cd discord-webinterface
npm init -y
npm install discord.js express dotenv
```

### 2. `.env`-Datei einrichten

Erstelle eine `.env`-Datei, um den Discord-Bot-Token sicher zu speichern:

```plaintext
DISCORD_TOKEN=your_discord_bot_token
```

### 3. `index.js` – Backend für das Webinterface

Erweitere `index.js`, um mehr Funktionen bereitzustellen.

```javascript
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
```

### 4. Frontend (HTML und CSS)

Hier ist ein einfaches Frontend, das es dir ermöglicht, die neuen Funktionen über ein Webinterface zu nutzen.

#### `style.css`

Erstelle `style.css`, um das Design zu verbessern.

```css
body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background-color: #2c2f33;
    color: #ffffff;
}

h1 {
    color: #7289da;
    text-align: center;
}

.container {
    background-color: #23272a;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
    width: 300px;
}

form, .messages {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
}

input[type="text"], textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: none;
    border-radius: 4px;
    background-color: #40444b;
    color: #ffffff;
}

textarea {
    resize: vertical;
    height: 100px;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #7289da;
    color: #ffffff;
    font-weight: bold;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #5b6eae;
}

.message {
    background-color: #40444b;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
}
```

#### `index.html`

Erstelle `index.html`, um die neuen Funktionen im Frontend nutzbar zu machen.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discord Web Interface</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Discord Web Interface</h1>
        
        <!-- Nachrichten senden -->
        <form id="sendMessageForm">
            <label for="channelID">Channel ID:</label>
            <input type="text" id="channelID" name="channelID" required>
            
            <label for="message">Message:</label>
            <textarea id="message" name="message" required></textarea>
            
            <button type="submit">Send Message</button>
        </form>

        <!-- Kanalinfo anzeigen -->
        <button onclick="getChannelInfo()">Get Channel Info</button>
        <div id="channelInfo" style="margin-top: 20px;"></div>

        <!-- Nachrichten abrufen -->
        <button onclick="fetchMessages()">Fetch Messages</button>
        <div id="messages" class="messages"></div>
    </div>

    <script>
        document.getElementById('sendMessageForm').onsubmit = async (e) => {
            e.preventDefault();
            const channelID = document.getElementById('channelID').value;
            const message = document.getElementById('message').value;

            const response = await fetch(`/send?channelID=${channelID}&message=${encodeURIComponent(message)}`);
            alert(await response.text());
        };

        async function getChannelInfo() {
            const channelID = document.getElementById('channelID').value;
            const response = await fetch(`/channel-info?channelID=${channelID}`);
            const data = await response.json();
            document.getElementById('channelInfo').innerText = `ID: ${data.id}, Name: ${data.name}, Typ: ${data.type}, Erstellt am: ${data.createdAt}`;
        }

        async function fetchMessages() {
            const channelID = document.getElementById('channelID').value;
            const response = await fetch(`/fetch-messages?channelID=${channelID}&limit=5`);
            const messages = await response.json();

            const messagesContainer = document.getElementById('messages');
            messagesContainer.innerHTML = '';
            messages.forEach(msg => {
                const div = document.createElement('div');
                div.className = 'message';
                div.innerText = `${msg.author}: ${msg.content}`;
                messagesContainer.appendChild(div);
            });
        }
    </script>
</body>
</html>
```

### 5. Server starten

Starte den Server mit:

```bash
node index.js
```

Öffne das Webinterface unter [http://localhost:3000](http://localhost:3000). Du kannst nun:
- Nachrichten an einen bestimmten Kanal senden.
- Kanalinformationen anzeigen.
- Die letzten 5 Nachrichten eines Kanals abrufen und anzeigen lassen.

Diese Version kann weiter angepasst werden, um mehr Funktionen hinzuzufügen.
