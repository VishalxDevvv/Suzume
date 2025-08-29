const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get information about the server'),
    
    async execute(interaction) {
        const guild = interaction.guild;
        
        const embed = new EmbedBuilder()
            .setTitle(`${ROYAL_EMOJIS.CASTLE} ${guild.name}`)
            .setColor(ROYAL_COLORS.ROYAL_BLUE)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '🆔 Server ID', value: guild.id, inline: true },
                { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
                { name: '📺 Channels', value: guild.channels.cache.size.toString(), inline: true },
                { name: '😀 Emojis', value: guild.emojis.cache.size.toString(), inline: true },
                { name: '🛡️ Verification', value: guild.verificationLevel.toString(), inline: true },
                { name: '🔞 NSFW Filter', value: guild.explicitContentFilter.toString(), inline: true },
                { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true }
            )
            .setFooter({ text: '© Vishal\'s Royal Bot • Server statistics' })
            .setTimestamp();
        
        if (guild.banner) {
            embed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
        }
        
        await interaction.reply({ embeds: [embed] });
    },
};
