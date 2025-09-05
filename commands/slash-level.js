const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const LevelSystem = require('../levelSystem');
const Database = require('../database');

const database = new Database();
const levelSystem = new LevelSystem(database);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Displays a user\'s current level and XP.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check the level of (defaults to yourself)')),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        if (!targetMember) {
            return await interaction.reply({
                content: '❌ User not found in this server!',
                ephemeral: true
            });
        }

        try {
            const stats = await levelSystem.getUserStats(targetUser.id, interaction.guild.id);
            
            if (!stats) {
                return await interaction.reply({
                    content: `${targetUser.id === interaction.user.id ? 'You haven\'t' : `${targetUser.username} hasn\'t`} sent any messages yet!`, 
                    ephemeral: true 
                });
            }

            const levelCard = levelSystem.createLevelCard(targetMember, stats);
            await interaction.reply({ embeds: [levelCard] });
        } catch (error) {
            console.error('Error getting user stats:', error);
            await interaction.reply({ content: '❌ An error occurred while fetching level data.', ephemeral: true });
        }
    },
};