const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays a user\'s avatar.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get the avatar of (defaults to yourself)')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        
        const avatarEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ size: 512 }))
            .setTimestamp();

        await interaction.reply({ embeds: [avatarEmbed] });
    },
};