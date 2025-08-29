const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomjoke',
    description: 'Get a random joke',
    async execute(message, args) {
        try {
            const response = await fetch('https://official-joke-api.appspot.com/random_joke');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: 'ROYAL_EMOJIS.LAUGH Random Joke',
                description: `**${data.setup}**\n\n||${data.punchline}||`,
                color: ROYAL_COLORS.GOLD,
                footer: { text: 'Source: Official Joke API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch joke!`);
        }
    }
};
