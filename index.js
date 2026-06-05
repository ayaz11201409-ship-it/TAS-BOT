const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

app.get("/", (req, res) => res.send("Bot Aktif!"));
app.listen(3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log('Bot başarıyla giriş yaptı!');
});

client.login(process.env.DISCORD_TOKEN);