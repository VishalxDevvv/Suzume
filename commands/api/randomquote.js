const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomquote',
    description: 'Get an inspirational quote',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.quotable.io/random');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '💭 Inspirational Quote',
                description: `"${data.content}"\n\n— **${data.author}**`,
                color: ROYAL_COLORS.ROYAL_BLUE,
                footer: { text: 'Source: Quotable API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch quote!`);
        }
    }
};
