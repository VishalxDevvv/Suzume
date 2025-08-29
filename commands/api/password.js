const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('password')
        .setDescription('Generate a secure random password')
        .addIntegerOption(option =>
            option.setName('length')
                .setDescription('Password length (8-50)')
                .setMinValue(8)
                .setMaxValue(50)),
    
    async execute(interaction) {
        const length = interaction.options.getInteger('length') || 16;
        
        try {
            const response = await fetch(`https://passwordinator.onrender.com/generate?num=1&len=${length}&symbols=true&uppercase=true&lowercase=true&numbers=true`);
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.SHIELD} Secure Password Generated`)
                .setColor(ROYAL_COLORS.EMERALD)
                .setDescription(`\`\`\`${data.data[0]}\`\`\``)
                .addFields(
                    { name: 'Length', value: length.toString(), inline: true },
                    { name: 'Security', value: 'High', inline: true }
                )
                .setFooter({ text: 'Keep your password secure!' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to generate password.`, ephemeral: true });
        }
    },
};
