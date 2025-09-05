const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Removes a user timeout.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove timeout from')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.reply({ content: '❌ You need the "Timeout Members" permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        
        if (!member) {
            return await interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
        }

        try {
            await member.timeout(null);
            
            const untimeoutEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🔊 Timeout Removed')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [untimeoutEmbed] });
        } catch (error) {
            console.error('Untimeout command error:', error);
            await interaction.reply({ content: '❌ Failed to remove timeout. Make sure the user is currently timed out.', ephemeral: true });
        }
    },
};