const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'coinflip',
    description: 'Flip a coin',
    execute(message, args) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '🪙' : '🥈';

        const embed = RoyalStyler.createRoyalEmbed({
            title: '🪙 Coin Flip',
            description: `${emoji} **${result}!**`,
            color: result === 'Heads' ? ROYAL_COLORS.GOLD : ROYAL_COLORS.SILVER,
            footer: { text: 'Fair 50/50 chance' }
        });

        message.reply({ embeds: [embed] });
    }
};
