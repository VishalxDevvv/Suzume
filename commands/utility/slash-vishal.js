const { SlashCommandBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vishal')
        .setDescription('Custom message from Vishal')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Your custom message')
                .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        
        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.CROWN} Message from Vishal`,
            description: `**"${message}"**\n\n*Use prefix commands like \`$anime\`, \`$weather\`, \`$joke\` for full bot functionality!*`,
            color: ROYAL_COLORS.GOLD,
            footer: { text: '© Vishal - Bot Creator' },
            thumbnail: 'https://cdn.discordapp.com/emojis/1412006973758767174.gif'
        });
        
        await interaction.reply({ embeds: [embed] });
    }
};
