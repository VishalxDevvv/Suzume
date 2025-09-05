const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const Economy = require('../../economy');

module.exports = {
    name: 'daily',
    aliases: ['claim'],
    description: 'Claim your daily suzu cash reward',
    async execute(message, args) {
        const userId = message.author.id;
        const result = Economy.claimDaily(userId);
        
        if (!result.success) {
            return message.reply(`⏰ ${result.message} Come back tomorrow for more suzu cash~ 💖`);
        }
        
        const user = Economy.getUser(userId);
        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.GIFT} Global Daily Reward Claimed!`,
            description: `💰 **+${result.amount.toLocaleString()}** suzu cash!\n💎 Global Balance: **${user.balance.toLocaleString()}** suzu cash\n🌍 Available on all servers!\n\n✨ Come back tomorrow for more rewards~`,
            color: ROYAL_COLORS.GOLD,
            footer: { text: '©Vishal' }
        });
        
        return message.reply({ embeds: [embed] });
    }
};
