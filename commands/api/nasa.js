const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
require("dotenv").config();
const API_KEY = process.env.NASA_API_KEY;

module.exports = {
    name: 'nasa',
    description: 'Get NASA Astronomy Picture of the Day',
    async execute(message, args) {
        try {
            const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.STAR} NASA Picture of the Day`,
                description: `**${data.title}**\n\n${data.explanation}`,
                color: ROYAL_COLORS.ROYAL_BLUE,
                image: data.url,
                fields: [
                    { name: 'Date', value: data.date, inline: true },
                    { name: 'Copyright', value: data.copyright || 'NASA', inline: true }
                ],
                footer: { text: 'NASA Astronomy Picture of the Day' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch NASA image!`);
        }
    }
};
