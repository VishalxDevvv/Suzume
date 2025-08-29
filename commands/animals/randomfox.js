const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomfox',
    description: 'Get a random fox image',
    async execute(message, args) {
        try {
            const response = await fetch('https://randomfox.ca/floof/');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '🦊 Random Fox',
                description: `${ROYAL_EMOJIS.CUTE} Here's a cute fox for you!`,
                color: ROYAL_COLORS.BURGUNDY,
                image: data.image,
                footer: { text: 'Source: RandomFox API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch fox image!`);
        }
    }
};
