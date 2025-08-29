const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'quote',
    description: 'Get an inspirational quote',
    execute(message, args) {
        axios.get('https://api.quotable.io/random')
            .then(response => {
                const quote = response.data;
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.STAR} Inspirational Quote`,
                    description: `*"${quote.content}"*\n\n— **${quote.author}**`,
                    color: ROYAL_COLORS.PURPLE,
                    footer: { text: 'Daily wisdom for your journey' }
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch quote!`);
            });
    }
};
