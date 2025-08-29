const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'anime',
    description: 'Search for anime information',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide an anime name! Usage: `$anime <name>`');
        }

        try {
            const query = args.join(' ');
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();

            if (!data.data || data.data.length === 0) {
                return message.reply('No anime found with that name!');
            }

            const anime = data.data[0];
            
            const embed = new EmbedBuilder()
                .setTitle(anime.title)
                .setDescription(anime.synopsis ? anime.synopsis.substring(0, 400) + '...' : 'No description available')
                .setImage(anime.images.jpg.large_image_url)
                .setColor('#FF6B6B')
                .addFields(
                    { name: '${ROYAL_EMOJIS.STATS} Score', value: anime.score ? anime.score.toString() : 'N/A', inline: true },
                    { name: '📺 Episodes', value: anime.episodes ? anime.episodes.toString() : 'N/A', inline: true },
                    { name: '📅 Year', value: anime.year ? anime.year.toString() : 'N/A', inline: true },
                    { name: '🎭 Genres', value: anime.genres.map(g => g.name).join(', ') || 'N/A', inline: false }
                )
                .setFooter({ text: 'Data from MyAnimeList' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Anime API error:', error);
            message.reply('Failed to fetch anime information!');
        }
    }
};
