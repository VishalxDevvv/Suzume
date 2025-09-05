const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const LevelSystem = require('../levelSystem');
const Database = require('../database');

const database = new Database();
const levelSystem = new LevelSystem(database);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the servers level leaderboard.')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('The number of users to display (default: 10)')
                .setMinValue(1)
                .setMaxValue(20)),
    async execute(interaction) {
        const limit = interaction.options.getInteger('limit') || 10;
        
        try {
            const leaderboardEmbed = await levelSystem.createLeaderboard(interaction.guild, limit);
            await interaction.reply({ embeds: [leaderboardEmbed] });
        } catch (error) {
            console.error('Error creating leaderboard:', error);
            await interaction.reply({ content: '❌ An error occurred while fetching leaderboard data.', ephemeral: true });
        }
    },
};