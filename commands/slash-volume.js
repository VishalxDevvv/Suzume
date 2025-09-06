const { useMainPlayer } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'volume',
        description: 'Change the music volume',
        options: [
            {
                name: 'level',
                description: 'Volume level (0-100)',
                type: 4,
                required: false
            }
        ]
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

        const level = interaction.options.getInteger('level');

        if (!level) {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('🔊 Current Volume')
                .setDescription(`Volume is currently set to **${queue.node.volume}%**`)
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        if (level < 0 || level > 100) {
            return interaction.reply('❌ Volume must be a number between 0 and 100!');
        }

        queue.node.setVolume(level);

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🔊 Volume Changed')
            .setDescription(`Volume set to **${level}%**`)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
