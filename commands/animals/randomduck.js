const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomduck',
    description: 'Get a random duck image',
    async execute(message, args) {
        try {
            const response = await fetch('https://random-d.uk/api/random');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '🦆 Random Duck',
                description: `${ROYAL_EMOJIS.CUTE} Quack! Here's a cute duck for you!`,
                color: ROYAL_COLORS.GOLD,
                image: data.url,
                footer: { text: 'Source: Random-d.uk API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch duck image!`);
        }
    }
};
