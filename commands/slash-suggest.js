const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: {
        name: 'suggest',
        description: 'AI suggests next track based on current song'
    },
    async execute(interaction) {
        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guild.id);

        if (!queue || !queue.currentTrack) {
            return interaction.reply('❌ No music is currently playing to base suggestions on!');
        }

        const currentTrack = queue.currentTrack;
        
        // Use the same AI logic from the text command
        const suggestions = await generateSuggestions(currentTrack);
        
        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle('🤖 AI Music Suggestions')
            .setDescription(`Based on: **${currentTrack.title}** by ${currentTrack.author}`)
            .setThumbnail(currentTrack.thumbnail)
            .addFields(
                { name: '🎵 Recommended Tracks', value: suggestions.map((song, i) => `${i + 1}. ${song}`).join('\n'), inline: false },
                { name: '💡 Tip', value: 'Use buttons to add suggestions to queue!', inline: false }
            )
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
                    .setLabel('🔄 New Suggestions')
                    .setStyle(ButtonStyle.Secondary)
            );

        const reply = await interaction.reply({ embeds: [embed], components: [row] });
        
        // Store suggestions for button interactions
        reply.aiSuggestions = suggestions;
    }
};

async function generateSuggestions(currentTrack) {
    const title = currentTrack.title.toLowerCase();
    const author = currentTrack.author.toLowerCase();
    
    const suggestions = [];
    
    if (title.includes('lofi') || title.includes('chill')) {
        suggestions.push(
            'Lofi Hip Hop Radio - Beats to Relax/Study',
            'Joji - Slow Dancing in the Dark',
            'Rex Orange County - Loving is Easy',
            'Boy Pablo - Everytime',
            'Clairo - Pretty Girl'
        );
    } else if (title.includes('rock') || author.includes('rock')) {
        suggestions.push(
            'Queen - Bohemian Rhapsody',
            'Led Zeppelin - Stairway to Heaven',
            'AC/DC - Thunderstruck',
            'Guns N\' Roses - Sweet Child O\' Mine',
            'The Beatles - Come Together'
        );
    } else if (title.includes('pop') || title.includes('dance')) {
        suggestions.push(
            'Dua Lipa - Levitating',
            'The Weeknd - Blinding Lights',
            'Doja Cat - Say So',
            'Ariana Grande - positions',
            'Billie Eilish - bad guy'
        );
    } else if (title.includes('rap') || title.includes('hip hop')) {
        suggestions.push(
            'Drake - God\'s Plan',
            'Kendrick Lamar - HUMBLE.',
            'Travis Scott - SICKO MODE',
            'Post Malone - Circles',
            'Eminem - Lose Yourself'
        );
    } else if (title.includes('electronic') || title.includes('edm')) {
        suggestions.push(
            'Marshmello - Happier',
            'The Chainsmokers - Closer',
            'Calvin Harris - Feel So Close',
            'Avicii - Wake Me Up',
            'Skrillex - Bangarang'
        );
    } else {
        suggestions.push(
            'Ed Sheeran - Shape of You',
            'Imagine Dragons - Believer',
            'Maroon 5 - Sugar',
            'OneRepublic - Counting Stars',
            'Coldplay - Viva La Vida'
        );
    }
    
    if (author.includes('taylor swift')) {
        suggestions.splice(2, 0, 'Taylor Swift - Anti-Hero', 'Taylor Swift - Shake It Off');
    } else if (author.includes('bts')) {
        suggestions.splice(1, 0, 'BTS - Dynamite', 'BTS - Butter');
    }
    
    return suggestions.slice(0, 5);
}
