const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'movie',
    description: 'Search for movie information',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide a movie name! Usage: `$movie <name>`');
        }

        try {
            const query = args.join(' ');
            const response = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=trilogy`);
            const data = await response.json();

            if (data.Response === 'False') {
                return message.reply('Movie not found!');
            }

            const embed = new EmbedBuilder()
                .setTitle(`🎬 ${data.Title} (${data.Year})`)
                .setDescription(data.Plot)
                .setThumbnail(data.Poster !== 'N/A' ? data.Poster : null)
                .setColor('#dc2626')
                .addFields(
                    { name: '⭐ Rating', value: data.imdbRating || 'N/A', inline: true },
                    { name: '🎭 Genre', value: data.Genre || 'N/A', inline: true },
                    { name: '⏱️ Runtime', value: data.Runtime || 'N/A', inline: true },
                    { name: '🎬 Director', value: data.Director || 'N/A', inline: true },
                    { name: '🎭 Actors', value: data.Actors || 'N/A', inline: false }
                )
                .setFooter({ text: 'OMDB API' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Movie API error:', error);
            message.reply('Failed to fetch movie information!');
        }
    }
};
