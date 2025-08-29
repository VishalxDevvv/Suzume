const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'fact',
    description: 'Get a random fun fact',
    execute(message, args) {
        axios.get('https://uselessfacts.jsph.pl/random.json?language=en')
            .then(response => {
                const fact = response.data;
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.BULB} Random Fun Fact`,
                    description: `${ROYAL_EMOJIS.STAR} ${fact.text}`,
                    color: ROYAL_COLORS.EMERALD,
                    footer: { text: 'Did you know?' }
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch fact!`);
            });
    }
};
