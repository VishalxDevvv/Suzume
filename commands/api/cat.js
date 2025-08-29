const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'cat',
    description: 'Get a random cat image',
    execute(message, args) {
        axios.get('https://api.thecatapi.com/v1/images/search')
            .then(response => {
                const cat = response.data[0];
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.LOVE} Random Cat`,
                    description: `${ROYAL_EMOJIS.CUTE} Here's your adorable cat!`,
                    color: ROYAL_COLORS.ROSE_GOLD,
                    image: cat.url
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch cat image!`);
            });
    }
};
