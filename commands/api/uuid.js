const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uuid')
        .setDescription('Generate a random UUID'),
    
    async execute(interaction) {
        try {
            const response = await fetch('https://httpbin.org/uuid');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.BULB} Generated UUID`)
                .setColor(ROYAL_COLORS.PURPLE)
                .setDescription(`\`\`\`${data.uuid}\`\`\``)
                .addFields(
                    { name: 'Format', value: 'UUID v4', inline: true },
                    { name: 'Length', value: '36 characters', inline: true }
                )
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to generate UUID.`, ephemeral: true });
        }
    },
};
