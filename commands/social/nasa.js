const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'nasa',
    description: 'Get NASA picture of the day',
    async execute(message, args) {
        const embed = RoyalStyler.createRoyalEmbed({
            title: '🚀 NASA Service Unavailable',
            description: `${ROYAL_EMOJIS.ERROR} NASA service is currently unavailable. Please try again later.`,
            color: ROYAL_COLORS.CRIMSON,
            footer: { text: 'Service temporarily disabled' }
        });

        message.reply({ embeds: [embed] });
    }
};
