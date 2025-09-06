const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'movie',
    description: 'Get movie information',
    async execute(message, args) {
        const embed = RoyalStyler.createRoyalEmbed({
            title: '🎬 Movie Service Unavailable',
            description: `${ROYAL_EMOJIS.ERROR} Movie service is currently unavailable. Please try again later.`,
            color: ROYAL_COLORS.CRIMSON,
            footer: { text: 'Service temporarily disabled' }
        });

        message.reply({ embeds: [embed] });
    }
};
