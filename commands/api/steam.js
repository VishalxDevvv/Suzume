const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'steam',
    description: 'Get Steam game information',
    usage: 'steam <game name>',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a game name! Example: `steam counter strike`');
        }

        const gameName = args.join(' ');
        
        try {
            // Search for the game
            const searchResponse = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&l=english&cc=US`);
            const searchData = await searchResponse.json();
            
            if (!searchData.items || searchData.items.length === 0) {
                return message.reply('No Steam games found with that name!');
            }

            const game = searchData.items[0];
            
            // Get detailed game info
            const detailResponse = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.id}`);
            const detailData = await detailResponse.json();
            const gameData = detailData[game.id].data;

            if (!gameData) {
                return message.reply('Could not fetch game details!');
            }

            const embed = new EmbedBuilder()
                .setTitle(gameData.name)
                .setURL(`https://store.steampowered.com/app/${game.id}`)
                .setDescription(gameData.short_description || 'No description available')
                .addFields(
                    { name: '💰 Price', value: gameData.is_free ? 'Free' : (gameData.price_overview ? gameData.price_overview.final_formatted : 'N/A'), inline: true },
                    { name: '📅 Release Date', value: gameData.release_date ? gameData.release_date.date : 'N/A', inline: true },
                    { name: '🏷️ Genres', value: gameData.genres ? gameData.genres.map(g => g.description).join(', ') : 'N/A', inline: true }
                )
                .setColor('#1B2838')
                .setThumbnail(gameData.header_image)
                .setFooter({ text: `Steam App ID: ${game.id}` })
                .setTimestamp();

            if (gameData.metacritic) {
                embed.addFields({ name: '⭐ Metacritic Score', value: gameData.metacritic.score.toString(), inline: true });
            }

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Steam API error:', error);
            message.reply('Failed to fetch Steam game information!');
        }
    }
};
