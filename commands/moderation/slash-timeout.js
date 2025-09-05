const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration (e.g., 10m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} You don't have permission to timeout members!`, flags: 64 });
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        // Parse duration
        const match = duration.match(/^(\d+)([smhd])$/);
        if (!match) {
            return await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Invalid duration format! Use: 10m, 1h, 1d`, flags: 64 });
        }
        
        const value = parseInt(match[1]);
        const unit = match[2];
        const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
        const timeMs = value * multipliers[unit];
        
        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(timeMs, reason);
            
            const embed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.TIME} User Timed Out`,
                description: `**User:** ${user.tag}\n**Duration:** ${duration}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`,
                color: ROYAL_COLORS.BURGUNDY
            });
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to timeout user!`, flags: 64 });
        }
    }
};
