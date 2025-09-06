const { EmbedBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: {
        name: 'queue',
        description: 'Show the music queue'
    },
    async execute(interaction) {
        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guild.id);

        if (!queue || !queue.currentTrack) {
            return interaction.reply('❌ No music is currently playing!');
        }

        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🎵 Music Queue')
            .setTimestamp();

        // Current track
        embed.addFields({
            name: '🎶 Now Playing',
            value: `**${queue.currentTrack.title}**\nBy: ${queue.currentTrack.author}\nRequested by: ${queue.currentTrack.requestedBy}`,
            inline: false
        });

        // Upcoming tracks
        if (queue.tracks.size > 0) {
            const tracks = queue.tracks.toArray().slice(0, 5);
            const trackList = tracks.map((track, index) => 
                `${index + 1}. **${track.title}** - ${track.author}`
            ).join('\n');

            embed.addFields({
                name: `📋 Up Next (${queue.tracks.size} songs)`,
                value: trackList,
                inline: false
            });
        }

        interaction.reply({ embeds: [embed] });
    }
};
