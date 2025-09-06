const { QueryType, useMainPlayer } = require('discord-player');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

module.exports = {
    name: 'play',
    description: 'Play music from YouTube, Spotify, SoundCloud',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a song name or URL!');
        }

        if (!message.member.voice.channel) {
            return message.reply('You need to be in a voice channel!');
        }

        const permissions = message.member.voice.channel.permissionsFor(message.client.user);
        if (!permissions.has(['Connect', 'Speak'])) {
            return message.reply('❌ I need permissions to connect and speak in your voice channel!');
        }

        const player = useMainPlayer();
        const query = args.join(' ');

        try {
            const { track, searchResult } = await player.play(message.member.voice.channel, query, {
                nodeOptions: {
                    metadata: {
                        channel: message.channel,
                        requestedBy: message.author
                    },
                    volume: 75,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 30000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 30000,
                    selfDeaf: true,
                    bufferingTimeout: 15000
                }
            });

            const queue = player.nodes.get(message.guild.id);
            const isPlaying = queue.tracks.size === 0;

            const embed = new EmbedBuilder()
                .setColor(isPlaying ? '#00ff00' : '#ffaa00')
                .setTitle(isPlaying ? '🎵 Now Playing' : '➕ Added to Queue')
                .setDescription(`**${track.title}**\nBy: ${track.author}`)
                .setThumbnail(track.thumbnail)
                .addFields(
                    { name: '🎤 Requested by', value: message.author.toString(), inline: true },
                    { name: '⏱️ Duration', value: track.duration, inline: true },
                    { name: '📍 Position', value: isPlaying ? 'Now Playing' : `#${queue.tracks.size + 1}`, inline: true }
                )
                .setTimestamp();

            // Get AI suggestions
            const suggestions = await getSpotifyRecommendations(track);
            
            const components = [];
            
            // Control buttons
            const controlRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('music_pause')
                        .setLabel('⏸️ Pause')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('music_skip')
                        .setLabel('⏭️ Skip')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_queue')
                        .setLabel('📋 Queue')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_stop')
                        .setLabel('⏹️ Stop')
                        .setStyle(ButtonStyle.Danger)
                );
            
            components.push(controlRow);

            // AI suggestions dropdown
            if (suggestions.length > 0) {
                embed.addFields({
                    name: '🤖 AI Suggestions Available',
                    value: 'Select from the dropdown below to add to queue!',
                    inline: false
                });

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('ai_suggestions')
                    .setPlaceholder('🎵 Choose AI suggested tracks to add...')
                    .setMinValues(1)
                    .setMaxValues(Math.min(suggestions.length, 5))
                    .addOptions(
                        suggestions.map((song, index) => ({
                            label: `${song.name}`,
                            description: `by ${song.artists[0].name}`,
                            value: `${song.artists[0].name} - ${song.name}`,
                            emoji: '🎵'
                        }))
                    );

                const selectRow = new ActionRowBuilder().addComponents(selectMenu);
                components.push(selectRow);
            }

            const reply = await message.reply({ embeds: [embed], components });
            reply.aiSuggestions = suggestions.map(s => `${s.artists[0].name} - ${s.name}`);

        } catch (error) {
            console.log(`Play error: ${error}`);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('I can\'t join the voice channel or play this song. Please try again!')
                .addFields(
                    { name: 'Possible Issues', value: '• Check if I have Connect/Speak permissions\n• Make sure the voice channel isn\'t full\n• Try a different song', inline: false }
                )
                .setTimestamp();
                
            message.reply({ embeds: [errorEmbed] });
        }
    }
};

async function getSpotifyRecommendations(currentTrack) {
    try {
        // Check if credentials are set
        if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
            console.log('Spotify credentials not set');
            return [];
        }

        // Get access token with retry
        let tokenData;
        try {
            tokenData = await spotifyApi.clientCredentialsGrant();
            spotifyApi.setAccessToken(tokenData.body['access_token']);
        } catch (authError) {
            console.log('Spotify auth error:', authError.message);
            return [];
        }
        
        // Search for track with better query
        const cleanTitle = currentTrack.title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
        const cleanArtist = currentTrack.author.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
        
        const searchResults = await spotifyApi.searchTracks(`track:"${cleanTitle}" artist:"${cleanArtist}"`, { limit: 1 });
        
        if (searchResults.body.tracks.items.length === 0) {
            // Fallback search
            const fallbackResults = await spotifyApi.searchTracks(`${cleanTitle} ${cleanArtist}`, { limit: 1 });
            if (fallbackResults.body.tracks.items.length === 0) {
                console.log('Track not found on Spotify');
                return [];
            }
            var spotifyTrack = fallbackResults.body.tracks.items[0];
        } else {
            var spotifyTrack = searchResults.body.tracks.items[0];
        }
        
        const trackId = spotifyTrack.id;
        
        // Get audio features
        const audioFeatures = await spotifyApi.getAudioFeaturesForTrack(trackId);
        const features = audioFeatures.body;
        
        // Get recommendations with fallback parameters
        const recommendations = await spotifyApi.getRecommendations({
            seed_tracks: [trackId],
            target_energy: features.energy || 0.5,
            target_danceability: features.danceability || 0.5,
            target_valence: features.valence || 0.5,
            limit: 5
        });
        
        return recommendations.body.tracks || [];
        
    } catch (error) {
        console.log('Spotify AI error details:', error.body || error.message);
        return [];
    }
}
