const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomfact',
    description: 'Get a random interesting fact',
    async execute(message, args) {
        try {
            const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '🧠 Random Fact',
                description: data.text,
                color: ROYAL_COLORS.EMERALD,
                footer: { text: 'Source: uselessfacts.jsph.pl' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch random fact!`);
        }
    }
};
