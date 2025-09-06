const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: {
        name: 'controller',
        description: 'Show music controller with buttons'
    },
    async execute(interaction) {
        try {
            const player = useMainPlayer();
            const queue = player.nodes.get(interaction.guild.id);

            if (!queue || !queue.currentTrack) {
                return interaction.reply('❌ No music is currently playing!');
            }

            const track = queue.currentTrack;
            let progress = '▬▬▬▬▬▬▬▬▬▬';
            
            try {
                progress = queue.node.createProgressBar();
            } catch (error) {
                console.log('Progress bar error:', error.message);
            }
            
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🎵 Music Controller')
                .setDescription(`**${track.title}**\nBy: ${track.author}`)
                .setThumbnail(track.thumbnail)
                .addFields(
                    { name: '🎤 Requested by', value: track.requestedBy.toString(), inline: true },
                    { name: '⏱️ Duration', value: track.duration, inline: true },
                    { name: '🔊 Volume', value: `${queue.node.volume}%`, inline: true },
                    { name: '📊 Progress', value: progress, inline: false }
                )
                .setTimestamp();

            if (queue.tracks.size > 0) {
                embed.addFields({
                    name: '📋 Up Next',
                    value: queue.tracks.toArray().slice(0, 3).map((t, i) => `${i + 1}. ${t.title}`).join('\n') || 'None',
                    inline: false
                });
            }

            const row1 = new ActionRowBuilder()
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

            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('music_shuffle')
                        .setLabel('🔀 Shuffle')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_loop')
                        .setLabel('🔁 Loop')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_queue')
                        .setLabel('📋 Queue')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_volume')
                        .setLabel('🔊 Volume')
                        .setStyle(ButtonStyle.Secondary)
                );

            interaction.reply({ embeds: [embed], components: [row1, row2] });
        } catch (error) {
            console.error('Controller command error:', error);
            interaction.reply('❌ Error showing music controller!');
        }
    }
};
