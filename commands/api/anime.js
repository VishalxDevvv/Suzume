const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'anime',
    description: 'Get anime information',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide an anime name! Example: \`$anime Naruto\``);
        }

        try {
            const anime = args.join(' ');
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime)}&limit=1`);
            const data = await response.json();

            if (!data.data || data.data.length === 0) {
                return message.reply(`${ROYAL_EMOJIS.ERROR} Anime "${anime}" not found!`);
            }

            const animeData = data.data[0];

            const embed = RoyalStyler.createRoyalEmbed({
                title: `🎌 ${animeData.title}`,
                description: animeData.synopsis ? animeData.synopsis.substring(0, 500) + '...' : 'No synopsis available',
                color: ROYAL_COLORS.PURPLE,
                thumbnail: animeData.images.jpg.image_url,
                fields: [
                    { name: 'Episodes', value: animeData.episodes?.toString() || 'Unknown', inline: true },
                    { name: 'Score', value: animeData.score?.toString() || 'N/A', inline: true },
                    { name: 'Status', value: animeData.status || 'Unknown', inline: true },
                    { name: 'Year', value: animeData.year?.toString() || 'Unknown', inline: true },
                    { name: 'Type', value: animeData.type || 'Unknown', inline: true },
                    { name: 'Rating', value: animeData.rating || 'Unknown', inline: true }
                ],
                footer: { text: 'Source: Jikan API (MyAnimeList)' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch anime data!`);
        }
    }
};
