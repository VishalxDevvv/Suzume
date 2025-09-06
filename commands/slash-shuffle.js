const { useMainPlayer } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'shuffle',
        description: 'Shuffle the music queue'
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

        if (queue.tracks.size < 2) {
            return interaction.reply('❌ Need at least 2 songs in queue to shuffle!');
        }

        queue.tracks.shuffle();

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle('🔀 Queue Shuffled')
            .setDescription(`Shuffled **${queue.tracks.size}** songs in the queue!`)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
