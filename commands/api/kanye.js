const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kanye')
        .setDescription('Get a random Kanye West quote'),
    
    async execute(interaction) {
        try {
            const response = await fetch('https://api.kanye.rest/');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.STAR} Kanye Quote`)
                .setColor(ROYAL_COLORS.GOLD)
                .setDescription(`🎤 "${data.quote}"`)
                .addFields(
                    { name: '👨‍🎤 Artist', value: 'Kanye West', inline: true }
                )
                .setThumbnail('https://i.imgur.com/8Km9tLL.jpg')
                .setFooter({ text: '© Vishal\'s Royal Bot • Ye speaks wisdom!' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to get Kanye quote.`, ephemeral: true });
        }
    },
};
