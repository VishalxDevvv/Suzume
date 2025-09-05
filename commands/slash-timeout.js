const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

// Helper function to parse time
const parseTime = (timeStr) => {
    const time = parseInt(timeStr);
    const unit = timeStr.slice(-1).toLowerCase();
    
    switch(unit) {
        case 's': return time * 1000;
        case 'm': return time * 60 * 1000;
        case 'h': return time * 60 * 60 * 1000;
        case 'd': return time * 24 * 60 * 60 * 1000;
        default: return time * 60 * 1000; // default to minutes
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Times out a user for a specified duration.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of the timeout (e.g., 10m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the timeout')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.reply({ content: '❌ You need the "Timeout Members" permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        if (!member) {
            return await interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
        }

        const duration = parseTime(durationStr);
        
        try {
            await member.timeout(duration, reason);
            
            const timeoutEmbed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('🔇 User Timed Out')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Duration', value: durationStr, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [timeoutEmbed] });
        } catch (error) {
            console.error('Timeout command error:', error);
            await interaction.reply({ content: '❌ Failed to timeout user. Make sure I have permission and the duration is valid (max 28 days). If the user is a server owner or has higher permissions than the bot, the timeout will fail.', ephemeral: true });
        }
    },
};