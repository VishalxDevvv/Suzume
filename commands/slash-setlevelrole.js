const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const Database = require('../database');

const database = new Database();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlevelrole')
        .setDescription('Sets a role to be given when a user reaches a certain level.')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('The level at which the role will be given')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to be given')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: '❌ You need Administrator permissions to use this command!', ephemeral: true });
        }

        const level = interaction.options.getInteger('level');
        const role = interaction.options.getRole('role');

        try {
            await database.addLevelRole(interaction.guild.id, level, role.id);
            
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Level Role Set!')
                .setDescription(`Users who reach level **${level}** will now receive the ${role} role!`)
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error setting level role:', error);
            await interaction.reply({ content: '❌ An error occurred while setting the level role.', ephemeral: true });
        }
    },
};