const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randombird',
    description: 'Get a random bird image',
    async execute(message, args) {
        try {
            const response = await fetch('https://some-random-api.ml/animal/bird');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '🐦 Random Bird',
                description: `${ROYAL_EMOJIS.CUTE} Here's a beautiful bird for you!\n\n**Fun Fact:** ${data.fact}`,
                color: ROYAL_COLORS.EMERALD,
                image: data.image,
                footer: { text: 'Source: Some Random API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch bird image!`);
        }
    }
};
