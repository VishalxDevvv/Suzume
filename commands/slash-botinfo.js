const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_EMOJIS } = require('../royalStyles');

// Helper function to format uptime
function formatUptime(uptime) {
    const seconds = Math.floor((uptime / 1000) % 60);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Displays information about the bot.'),
    async execute(interaction) {
        const botEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🤖 Bot Information')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { name: '🏷️ Bot Name', value: interaction.client.user.username, inline: true },
                { name: '🆔 Bot ID', value: interaction.client.user.id, inline: true },
                { name: `${ROYAL_EMOJIS.STATS} Servers`, value: interaction.client.guilds.cache.size.toString(), inline: true },
                { name: `${ROYAL_EMOJIS.USER} Total Users`, value: interaction.client.users.cache.size.toString(), inline: true },
                { name: `${ROYAL_EMOJIS.PING} Ping`, value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true },
                { name: `${ROYAL_EMOJIS.TIME} Uptime`, value: formatUptime(interaction.client.uptime), inline: true },
                { name: `${ROYAL_EMOJIS.LIBRARY} Library`, value: 'Discord.js v14', inline: true },
                { name: '🟢 Status', value: 'Online & Global', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [botEmbed] });
    },
};