const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const Economy = require('../../economy');

module.exports = {
    name: 'leaderboard',
    aliases: ['top', 'lb', 'rich'],
    description: 'View the global suzu cash leaderboard',
    async execute(message, args) {
        const top = Economy.getLeaderboard(10);
        let description = '🌍 **Global Leaderboard** - Richest users across all servers!\n\n';
        
        for (let i = 0; i < top.length; i++) {
            const user = top[i];
            const medal = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            try {
                const discordUser = await message.client.users.fetch(user.user_id);
                description += `${medal} **${discordUser.username}** - **${user.balance.toLocaleString()}** suzu cash\n`;
            } catch {
                description += `${medal} **Unknown User** - **${user.balance.toLocaleString()}** suzu cash\n`;
            }
        }
        
        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.CROWN} Global Suzu Cash Leaderboard`,
            description: description || 'No users found!',
            color: ROYAL_COLORS.PURPLE,
            footer: { text: 'Compete with users from all servers! 💖' }
        });

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lb_refresh')
                    .setLabel('🔄 Refresh')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('lb_stats')
                    .setLabel('📊 Global Stats')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('lb_myrank')
                    .setLabel('📈 My Rank')
                    .setStyle(ButtonStyle.Success)
            );
        
        return message.reply({ embeds: [embed], components: [buttons] });
    }
};
