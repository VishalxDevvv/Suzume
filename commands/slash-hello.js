const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Replies with a welcome message!'),
    async execute(interaction) {
        await interaction.reply(`Hello ${interaction.user.username}! 👋 Welcome to **${interaction.guild.name}**!`);
    },
};