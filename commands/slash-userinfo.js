const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Displays information about a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get info about (defaults to yourself)')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const userEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('👤 User Information')
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '🏷️ Username', value: user.tag, inline: true },
                { name: '🆔 User ID', value: user.id, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true }
            );

        if (member) {
            userEmbed.addFields(
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                { name: '🎭 Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: false }
            );
        }

        await interaction.reply({ embeds: [userEmbed] });
    },
};