const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('advice')
        .setDescription('Get random life advice'),
    
    async execute(interaction) {
        try {
            const response = await fetch('https://api.adviceslip.com/advice');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.CROWN} Royal Advice`)
                .setColor(ROYAL_COLORS.GOLD)
                .setDescription(`💭 "${data.slip.advice}"`)
                .addFields(
                    { name: '🆔 Advice ID', value: `#${data.slip.id}`, inline: true }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Wisdom for the wise!' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to get advice.`, ephemeral: true });
        }
    },
};
