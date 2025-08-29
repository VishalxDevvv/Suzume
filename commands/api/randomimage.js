const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomimage',
    description: 'Get a random image',
    async execute(message, args) {
        try {
            const response = await fetch('https://picsum.photos/400/300');
            
            const embed = RoyalStyler.createRoyalEmbed({
                title: '🖼️ Random Image',
                description: `${ROYAL_EMOJIS.SPARKLES} Here's a random beautiful image!`,
                color: ROYAL_COLORS.PURPLE,
                image: response.url,
                footer: { text: 'Source: Lorem Picsum' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch random image!`);
        }
    }
};
