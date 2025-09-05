const { SlashCommandBuilder } = require('discord.js');
const { ROYAL_EMOJIS } = require('../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        const sent = Date.now();
        await interaction.reply(`${ROYAL_EMOJIS.PING} Pinging...`);
        const timeTaken = Date.now() - sent;
        await interaction.editReply(`🏓 Pong! Latency: ${timeTaken}ms | API Latency: ${Math.round(interaction.client.ws.ping)}ms`);
    },
};