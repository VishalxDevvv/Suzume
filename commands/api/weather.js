const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'weather',
    description: 'Get weather information',
    async execute(message, args) {
        const embed = RoyalStyler.createRoyalEmbed({
            title: '🌤️ Weather Service Unavailable',
            description: `${ROYAL_EMOJIS.ERROR} Weather service is currently unavailable. Please try again later.`,
            color: ROYAL_COLORS.CRIMSON,
            footer: { text: 'Service temporarily disabled' }
        });

        message.reply({ embeds: [embed] });
    }
};
