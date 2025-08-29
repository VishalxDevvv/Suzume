const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'movie',
    description: 'Get movie information',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide a movie name! Example: \`$movie Avengers\``);
        }

        try {
            const movie = args.join(' ');
            const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movie)}&apikey=trilogy`);
            const data = await response.json();

            if (data.Response === 'False') {
                return message.reply(`${ROYAL_EMOJIS.ERROR} Movie "${movie}" not found!`);
            }

            const embed = RoyalStyler.createRoyalEmbed({
                title: `🎬 ${data.Title} (${data.Year})`,
                description: data.Plot,
                color: ROYAL_COLORS.GOLD,
                thumbnail: data.Poster !== 'N/A' ? data.Poster : null,
                fields: [
                    { name: 'Director', value: data.Director, inline: true },
                    { name: 'Genre', value: data.Genre, inline: true },
                    { name: 'Rating', value: data.imdbRating + '/10', inline: true },
                    { name: 'Runtime', value: data.Runtime, inline: true },
                    { name: 'Released', value: data.Released, inline: true }
                ],
                footer: { text: 'Source: OMDB API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch movie data!`);
        }
    }
};
