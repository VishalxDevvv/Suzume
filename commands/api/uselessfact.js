const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uselessfact')
        .setDescription('Get a random useless but interesting fact'),
    
    async execute(interaction) {
        try {
            const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.BULB} Useless Fact`)
                .setColor(ROYAL_COLORS.PURPLE)
                .setDescription(`💡 ${data.text}`)
                .addFields(
                    { name: '🏷️ Source', value: data.source || 'Unknown', inline: true },
                    { name: '🔗 Permalink', value: `[View](${data.permalink})`, inline: true }
                )
                .setFooter({ text: '© Vishal Royal Bot • Powered by API' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to fetch useless fact.`, ephemeral: true });
        }
    },
};
