const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomdog',
    description: 'Get a random dog image',
    async execute(message, args) {
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '🐕 Random Dog',
                description: `${ROYAL_EMOJIS.CUTE} Here's a cute dog for you!`,
                color: ROYAL_COLORS.GOLD,
                image: data.message,
                footer: { text: 'Source: dog.ceo' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch dog image!`);
        }
    }
};
