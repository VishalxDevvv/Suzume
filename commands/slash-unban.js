const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from the server.')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.reply({ content: '❌ You need the "Ban Members" permission to use this command.', ephemeral: true });
        }

        const userId = interaction.options.getString('userid');

        try {
            await interaction.guild.members.unban(userId);

            const unbanEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ User Unbanned')
                .addFields(
                    { name: 'User ID', value: userId, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [unbanEmbed] });
        } catch (error) {
            console.error('Unban command error:', error);
            await interaction.reply({ content: '❌ Failed to unban user. Make sure the user ID is correct and they are banned.', ephemeral: true });
        }
    },
};