const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'dog',
    description: 'Get a random dog image',
    execute(message, args) {
        axios.get('https://dog.ceo/api/breeds/image/random')
            .then(response => {
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.LOVE} Random Dog`,
                    description: `${ROYAL_EMOJIS.CUTE} Here's your adorable dog!`,
                    color: ROYAL_COLORS.GOLD,
                    image: response.data.message
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch dog image!`);
            });
    }
};
