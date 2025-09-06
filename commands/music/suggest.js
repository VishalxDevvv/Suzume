const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const SpotifyWebApi = require('spotify-web-api-node');

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Debug: Check if environment variables are loaded
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('❌ Spotify credentials missing:', {
        clientId: process.env.SPOTIFY_CLIENT_ID ? 'SET' : 'MISSING',
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET ? 'SET' : 'MISSING'
    });
}

module.exports = {
    name: 'suggest',
    aliases: ['recommend', 'ai'],
    description: 'AI suggests tracks using Spotify\'s recommendation engine',
    async execute(message, args) {
        const player = useMainPlayer();
        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.currentTrack) {
            return message.reply('❌ No music is currently playing!');
        }

        const currentTrack = queue.currentTrack;
        
        const loadingEmbed = new EmbedBuilder()
            .setColor('#1db954')
            .setTitle('🎵 Spotify AI Analyzing...')
            .setDescription(`Getting AI recommendations for **${currentTrack.title}**`)
            .setThumbnail('https://i.imgur.com/dMFuMSZ.gif');
            
        const loadingMsg = await message.reply({ embeds: [loadingEmbed] });
        
        try {
            const suggestions = await getSpotifyRecommendations(currentTrack);
            
            const embed = new EmbedBuilder()
                .setColor('#1db954')
                .setTitle('🤖 Spotify AI Recommendations')
                .setDescription(`Based on: **${currentTrack.title}**`)
                .setThumbnail(currentTrack.thumbnail)
                .addFields(
                    { 
                        name: '🎵 AI Suggested Tracks', 
                        value: suggestions.map((song, i) => 
                            `${i + 1}. **${song.name}** by ${song.artists[0].name}`
                        ).join('\n'), 
                        inline: false 
                    },
                    { 
                        name: '🧠 AI Features', 
                        value: `Energy: ${suggestions[0]?.energy || 'N/A'}\nDanceability: ${suggestions[0]?.danceability || 'N/A'}\nValence: ${suggestions[0]?.valence || 'N/A'}`, 
                        inline: true 
                    }
                )
                .setFooter({ text: 'Powered by Spotify\'s AI Recommendation Engine' })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ai_add_all')
                        .setLabel('🎵 Add All')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('ai_add_random')
                        .setLabel('🎲 Add Random')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('ai_refresh')
                        .setLabel('🔄 New AI Suggestions')
                        .setStyle(ButtonStyle.Secondary)
                );

            await loadingMsg.edit({ embeds: [embed], components: [row] });
            loadingMsg.aiSuggestions = suggestions.map(s => `${s.artists[0].name} - ${s.name}`);
            
        } catch (error) {
            console.error('Spotify AI error:', error);
            await loadingMsg.edit({ 
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Spotify AI Unavailable')
                    .setDescription('Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env file')
                ] 
            });
        }
    }
};

async function getSpotifyRecommendations(currentTrack) {
    try {
        // Get access token
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);
        
        // Search for the current track to get its Spotify ID and audio features
        const searchResults = await spotifyApi.searchTracks(`${currentTrack.title} ${currentTrack.author}`, { limit: 1 });
        
        if (searchResults.body.tracks.items.length === 0) {
            throw new Error('Track not found on Spotify');
        }
        
        const spotifyTrack = searchResults.body.tracks.items[0];
        const trackId = spotifyTrack.id;
        
        // Get audio features for the track
        const audioFeatures = await spotifyApi.getAudioFeaturesForTrack(trackId);
        const features = audioFeatures.body;
        
        // Get recommendations based on the track's audio features
        const recommendations = await spotifyApi.getRecommendations({
            seed_tracks: [trackId],
            target_energy: features.energy,
            target_danceability: features.danceability,
            target_valence: features.valence,
            target_acousticness: features.acousticness,
            limit: 5
        });
        
        // Add audio features to recommendations for display
        const tracksWithFeatures = recommendations.body.tracks.map(track => ({
            ...track,
            energy: Math.round(features.energy * 100) + '%',
            danceability: Math.round(features.danceability * 100) + '%',
            valence: Math.round(features.valence * 100) + '%'
        }));
        
        return tracksWithFeatures;
        
    } catch (error) {
        console.error('Spotify API error:', error);
        throw error;
    }
}
