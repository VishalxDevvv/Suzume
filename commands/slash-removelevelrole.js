const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const Database = require('../database');

const database = new Database();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removelevelrole')
        .setDescription('Removes a level role.')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('The level of the role to remove')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: '❌ You need Administrator permissions to use this command!', ephemeral: true });
        }

        const level = interaction.options.getInteger('level');

        try {
            const changes = await database.removeLevelRole(interaction.guild.id, level);
            
            if (changes === 0) {
                return await interaction.reply({ content: `❌ No level role found for level ${level}!`, ephemeral: true });
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('✅ Level Role Removed!')
                .setDescription(`Level role for level **${level}** has been removed!`)
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error removing level role:', error);
            await interaction.reply({ content: '❌ An error occurred while removing the level role.', ephemeral: true });
        }
    },
};