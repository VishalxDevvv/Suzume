const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agify')
        .setDescription('Predict age based on a name')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name to predict age for')
                .setRequired(true)),
    
    async execute(interaction) {
        const name = interaction.options.getString('name');
        
        try {
            const response = await fetch(`https://api.agify.io?name=${encodeURIComponent(name)}`);
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.CRYSTAL} Age Prediction`)
                .setColor(ROYAL_COLORS.PURPLE)
                .addFields(
                    { name: '👤 Name', value: data.name, inline: true },
                    { name: '🎂 Predicted Age', value: data.age ? `${data.age} years` : 'Unknown', inline: true },
                    { name: '📊 Confidence', value: data.count ? `${data.count} samples` : 'Low', inline: true }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Powered by Agify API' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to predict age.`, ephemeral: true });
        }
    },
};
