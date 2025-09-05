const { SlashCommandBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show bot commands and usage'),
    async execute(interaction) {
        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.SCROLL} Bot Commands Help`,
            description: `**Use prefix commands with \`$\` for full functionality!**\n\n**Popular Commands:**\n\`$anime Naruto\` - Get anime info\n\`$weather Tokyo\` - Weather data\n\`$joke\` - Random joke\n\`$cat\` - Cat images\n\`$calc 2+2\` - Calculator\n\`$hug @user\` - Send hugs\n\`$userinfo @user\` - User info\n\n**Available Slash Commands:**\n\`/ping\` - Bot latency\n\`/coinflip\` - Flip coin\n\`/help\` - This help\n\`/ban\` - Ban user\n\`/timeout\` - Timeout user\n\`/untimeout\` - Remove timeout\n\`/vishal\` - Custom message\n\n**Total: 119+ prefix commands available!**`,
            color: ROYAL_COLORS.PURPLE,
            footer: { text: 'Use $help for detailed prefix command list' }
        });
        
        await interaction.reply({ embeds: [embed] });
    }
};
