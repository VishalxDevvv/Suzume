const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomadvice',
    description: 'Get random life advice',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.adviceslip.com/advice');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.BULB} Random Advice`,
                description: `"${data.slip.advice}"`,
                color: ROYAL_COLORS.ROYAL_BLUE,
                fields: [
                    { name: 'Advice ID', value: `#${data.slip.id}`, inline: true }
                ],
                footer: { text: 'Source: Advice Slip API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch advice!`);
        }
    }
};
