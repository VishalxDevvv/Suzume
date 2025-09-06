const { useMainPlayer } = require('discord-player');

module.exports = {
    data: {
        name: 'skip',
        description: 'Skip the current song'
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

        queue.node.skip();
        interaction.reply('⏭️ Skipped the current song!');
    }
};
