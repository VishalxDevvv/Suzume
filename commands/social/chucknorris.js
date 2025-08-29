const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'chucknorris',
    description: 'Get a Chuck Norris joke',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.chucknorris.io/jokes/random');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '🥋 Chuck Norris Joke',
                description: data.value,
                color: ROYAL_COLORS.CRIMSON,
                thumbnail: 'https://api.chucknorris.io/img/avatar/chuck-norris.png',
                footer: { text: 'Source: Chuck Norris API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch Chuck Norris joke!`);
        }
    }
};
