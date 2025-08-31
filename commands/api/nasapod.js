const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'nasapod',
    description: 'Get NASA Picture of the Day',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=EY23c36wswPQuOa7Ruz5R6tsk74nPoq5fUh2u9XL');
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.ROCKET} NASA Picture of the Day`,
                description: `**${data.title}**\n\n${data.explanation.substring(0, 500)}...`,
                color: ROYAL_COLORS.MIDNIGHT,
                image: data.media_type === 'image' ? data.url : null,
                fields: [
                    { name: 'Date', value: data.date, inline: true },
                    { name: 'Copyright', value: data.copyright || 'NASA', inline: true }
                ],
                footer: { text: 'Source: NASA APOD API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch NASA image!`);
        }
    }
};
