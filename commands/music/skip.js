const { useMainPlayer } = require('discord-player');

module.exports = {
    name: 'skip',
    description: 'Skip the current song',
    async execute(message, args) {
        if (!message.member.voice.channel) {
            return message.reply('You need to be in a voice channel!');
        }

        const player = useMainPlayer();
        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.currentTrack) {
            return message.reply('❌ No music is currently playing!');
        }

        queue.node.skip();
        message.reply('⏭️ Skipped the current song!');
    }
};
