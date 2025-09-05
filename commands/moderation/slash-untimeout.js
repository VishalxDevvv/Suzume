const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove timeout from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for removing timeout')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
            return await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} You don't have permission to manage timeouts!`, flags: 64 });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(null, reason);
            
            const embed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.SUCCESS} Timeout Removed`,
                description: `**User:** ${user.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`,
                color: ROYAL_COLORS.GREEN
            });
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to remove timeout!`, flags: 64 });
        }
    }
};
