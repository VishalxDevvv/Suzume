const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the kick')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return await interaction.reply({ content: '❌ You need the "Kick Members" permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!member) {
            return await interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
        }

        try {
            await member.kick(reason);

            const kickEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('👢 User Kicked')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [kickEmbed] });
        } catch (error) {
            console.error('Kick command error:', error);
            await interaction.reply({ content: '❌ Failed to kick user. Make sure I have permission and the user is kickable.', ephemeral: true });
        }
    },
};