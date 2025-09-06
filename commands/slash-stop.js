const { useMainPlayer } = require('discord-player');

module.exports = {
    data: {
        name: 'stop',
        description: 'Stop music and clear queue'
    },
    async execute(interaction) {
        if (!interaction.member.voice.channel) {
            return interaction.reply('You need to be in a voice channel!');
        }

        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guild.id);

        if (!queue) {
            return interaction.reply('❌ No music is currently playing!');
        }

        queue.delete();
        interaction.reply('⏹️ Stopped music and cleared queue!');
    }
};
