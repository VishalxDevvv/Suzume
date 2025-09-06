const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    name: 'nowplaying',
    aliases: ['np'],
    description: 'Show currently playing song with controls',
    async execute(message, args) {
        try {
            const player = useMainPlayer();
            const queue = player.nodes.get(message.guild.id);

            if (!queue || !queue.currentTrack) {
                return message.reply('❌ No music is currently playing!');
            }

            const track = queue.currentTrack;
            let progress = '▬▬▬▬▬▬▬▬▬▬';
            let timestamp = { current: { label: '0:00' }, total: { label: track.duration } };
            
            try {
                progress = queue.node.createProgressBar();
                timestamp = queue.node.getTimestamp();
            } catch (error) {
                console.log('Progress/timestamp error:', error.message);
            }
            
            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('🎵 Now Playing')
                .setDescription(`**${track.title}**\nBy: ${track.author}`)
                .setThumbnail(track.thumbnail)
                .addFields(
                    { name: '🎤 Requested by', value: track.requestedBy.toString(), inline: true },
                    { name: '⏱️ Duration', value: track.duration, inline: true },
                    { name: '🔊 Volume', value: `${queue.node.volume}%`, inline: true },
                    { name: '📊 Progress', value: progress, inline: false },
                    { name: '🕐 Time', value: `${timestamp.current.label} / ${timestamp.total.label}`, inline: true },
                    { name: '🔁 Loop Mode', value: queue.repeatMode === 0 ? 'Off' : queue.repeatMode === 1 ? 'Track' : 'Queue', inline: true },
                    { name: '📋 Queue Length', value: `${queue.tracks.size} songs`, inline: true }
                )
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('music_previous')
                        .setLabel('⏮️')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_pause')
                        .setLabel(queue.node.isPaused() ? '▶️' : '⏸️')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('music_skip')
                        .setLabel('⏭️')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_stop')
                        .setLabel('⏹️')
                        .setStyle(ButtonStyle.Danger)
                );

            message.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Nowplaying command error:', error);
            message.reply('❌ Error showing now playing info!');
        }
    }
};
