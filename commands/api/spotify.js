const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'spotify',
    description: 'Search for music on Spotify',
    usage: 'spotify <song/artist name>',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a song or artist name! Example: `spotify bohemian rhapsody`');
        }

        const query = args.join(' ');
        
        try {
            // Using Spotify's public search (no auth required for basic search)
            const response = await fetch(`https://open.spotify.com/search/${encodeURIComponent(query)}`);
            const html = await response.text();
            
            // Extract track info from HTML
            const trackMatch = html.match(/"name":"([^"]+)".*?"artists":\[{"name":"([^"]+)"/);
            const albumMatch = html.match(/"album":{"name":"([^"]+)"/);
            const imageMatch = html.match(/"images":\[{"url":"([^"]+)"/);
            
            if (!trackMatch) {
                return message.reply('No tracks found on Spotify for that search!');
            }

            const trackName = trackMatch[1];
            const artistName = trackMatch[2];
            const albumName = albumMatch ? albumMatch[1] : 'Unknown Album';
            const imageUrl = imageMatch ? imageMatch[1] : null;
            
            const embed = new EmbedBuilder()
                .setTitle(`🎵 ${trackName}`)
                .setDescription(`**Artist:** ${artistName}\n**Album:** ${albumName}`)
                .setURL(`https://open.spotify.com/search/${encodeURIComponent(query)}`)
                .setColor('#1DB954')
                .setFooter({ text: 'Spotify Search Result' })
                .setTimestamp();

            if (imageUrl) {
                embed.setThumbnail(imageUrl);
            }

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Spotify search error:', error);
            message.reply('Failed to search Spotify!');
        }
    }
};
