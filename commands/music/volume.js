const { useMainPlayer } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'volume',
    description: 'Change the music volume (0-100)',
    async execute(message, args) {
        if (!message.member.voice.channel) {
            return message.reply('You need to be in a voice channel!');
        }

        const player = useMainPlayer();
        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.currentTrack) {
            return message.reply('❌ No music is currently playing!');
        }

        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('🔊 Current Volume')
                .setDescription(`Volume is currently set to **${queue.node.volume}%**`)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        const volume = parseInt(args[0]);
        
        if (isNaN(volume) || volume < 0 || volume > 100) {
            return message.reply('❌ Volume must be a number between 0 and 100!');
        }

        queue.node.setVolume(volume);

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🔊 Volume Changed')
            .setDescription(`Volume set to **${volume}%**`)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
