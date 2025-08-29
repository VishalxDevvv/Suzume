const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomcat',
    description: 'Get a random cat image',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '🐱 Random Cat',
                description: `${ROYAL_EMOJIS.CUTE} Here's a cute cat for you!`,
                color: ROYAL_COLORS.PURPLE,
                image: data[0].url,
                footer: { text: 'Source: thecatapi.com' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch cat image!`);
        }
    }
};
