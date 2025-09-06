const { useMainPlayer } = require('discord-player');

module.exports = {
    name: 'stop',
    description: 'Stop music and clear queue',
    async execute(message, args) {
        if (!message.member.voice.channel) {
            return message.reply('You need to be in a voice channel!');
        }

        const player = useMainPlayer();
        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('❌ No music is currently playing!');
        }

        queue.delete();
        message.reply('⏹️ Stopped music and cleared queue!');
    }
};
