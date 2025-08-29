const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('httpstatus')
        .setDescription('Get information about HTTP status codes')
        .addIntegerOption(option =>
            option.setName('code')
                .setDescription('HTTP status code (e.g., 404)')
                .setRequired(true)),
    
    async execute(interaction) {
        const code = interaction.options.getInteger('code');
        
        try {
            const response = await fetch(`https://httpstat.us/${code}`);
            const statusText = response.statusText || 'Unknown';
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.INFO} HTTP Status Code: ${code}`)
                .setColor(code >= 400 ? ROYAL_COLORS.CRIMSON : ROYAL_COLORS.EMERALD)
                .addFields(
                    { name: 'Status', value: statusText, inline: true },
                    { name: 'Category', value: getStatusCategory(code), inline: true }
                )
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Invalid HTTP status code.`, ephemeral: true });
        }
    },
};

function getStatusCategory(code) {
    if (code >= 100 && code < 200) return 'Informational';
    if (code >= 200 && code < 300) return 'Success';
    if (code >= 300 && code < 400) return 'Redirection';
    if (code >= 400 && code < 500) return 'Client Error';
    if (code >= 500 && code < 600) return 'Server Error';
    return 'Unknown';
}
