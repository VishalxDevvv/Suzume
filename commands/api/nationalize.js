const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nationalize')
        .setDescription('Predict nationality based on a name')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name to predict nationality for')
                .setRequired(true)),
    
    async execute(interaction) {
        const name = interaction.options.getString('name');
        
        try {
            const response = await fetch(`https://api.nationalize.io?name=${encodeURIComponent(name)}`);
            const data = await response.json();
            
            const topCountries = data.country?.slice(0, 3) || [];
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.CASTLE} Nationality Prediction`)
                .setColor(ROYAL_COLORS.EMERALD)
                .addFields(
                    { name: '👤 Name', value: data.name, inline: false }
                );
            
            if (topCountries.length > 0) {
                topCountries.forEach((country, index) => {
                    const probability = Math.round(country.probability * 100);
                    embed.addFields({
                        name: `🌍 Country ${index + 1}`,
                        value: `${country.country_id.toUpperCase()} (${probability}%)`,
                        inline: true
                    });
                });
            } else {
                embed.addFields({ name: '❓ Result', value: 'No predictions available', inline: false });
            }
            
            embed.setFooter({ text: '© Vishal Royal Bot • Powered by API' })
                 .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to predict nationality.`, ephemeral: true });
        }
    },
};
