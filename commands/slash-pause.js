const { useMainPlayer } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'pause',
        description: 'Pause or resume the current song'
    },
    async execute(interaction) {
        if (!interaction.member.voice.channel) {
            return interaction.reply('You need to be in a voice channel!');
        }

        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guild.id);

        if (!queue || !queue.currentTrack) {
            return interaction.reply('❌ No music is currently playing!');
        }

        const isPaused = queue.node.isPaused();
        
        if (isPaused) {
            queue.node.resume();
        } else {
            queue.node.pause();
        }

        const embed = new EmbedBuilder()
            .setColor(isPaused ? '#00ff00' : '#ffaa00')
            .setTitle(isPaused ? '▶️ Resumed' : '⏸️ Paused')
            .setDescription(`**${queue.currentTrack.title}**`)
            .setThumbnail(queue.currentTrack.thumbnail)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
