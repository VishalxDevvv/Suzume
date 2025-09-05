const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for ban')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} You don't have permission to ban members!`, flags: 64 });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        try {
            await interaction.guild.members.ban(user, { reason });
            
            const embed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.SHIELD} User Banned`,
                description: `**User:** ${user.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`,
                color: ROYAL_COLORS.RED
            });
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to ban user!`, flags: 64 });
        }
    }
};
