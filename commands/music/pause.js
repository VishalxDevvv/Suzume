const { useMainPlayer } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'pause',
    description: 'Pause or resume the current song',
    async execute(message, args) {
        if (!message.member.voice.channel) {
            return message.reply('You need to be in a voice channel!');
        }

        const player = useMainPlayer();
        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.currentTrack) {
            return message.reply('❌ No music is currently playing!');
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

        message.reply({ embeds: [embed] });
    }
};
