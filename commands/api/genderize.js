const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('genderize')
        .setDescription('Predict gender based on a name')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name to predict gender for')
                .setRequired(true)),
    
    async execute(interaction) {
        const name = interaction.options.getString('name');
        
        try {
            const response = await fetch(`https://api.genderize.io?name=${encodeURIComponent(name)}`);
            const data = await response.json();
            
            const genderEmoji = data.gender === 'male' ? '👨' : data.gender === 'female' ? '👩' : '❓';
            const probability = data.probability ? Math.round(data.probability * 100) : 0;
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.DIAMOND} Gender Prediction`)
                .setColor(data.gender === 'male' ? ROYAL_COLORS.ROYAL_BLUE : ROYAL_COLORS.ROSE_GOLD)
                .addFields(
                    { name: '👤 Name', value: data.name, inline: true },
                    { name: `${genderEmoji} Predicted Gender`, value: data.gender || 'Unknown', inline: true },
                    { name: '🎯 Probability', value: `${probability}%`, inline: true }
                )
                .setFooter({ text: '© Vishal Royal Bot • Powered by API' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to predict gender.`, ephemeral: true });
        }
    },
};
