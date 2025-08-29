const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'joke',
    description: 'Get a random joke',
    execute(message, args) {
        axios.get('https://official-joke-api.appspot.com/random_joke')
            .then(response => {
                const joke = response.data;
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.LAUGH} Random Joke`,
                    description: `**${joke.setup}**\n\n||${joke.punchline}|| ${ROYAL_EMOJIS.LAUGH}`,
                    color: ROYAL_COLORS.GOLD,
                    footer: { text: 'Click the spoiler to see the punchline!' }
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch joke!`);
            });
    }
};
