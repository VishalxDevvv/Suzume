const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timezone')
        .setDescription('Get current time in a timezone')
        .addStringOption(option =>
            option.setName('zone')
                .setDescription('Timezone (e.g., America/New_York, Europe/London)')
                .setRequired(true)),
    
    async execute(interaction) {
        const timezone = interaction.options.getString('zone');
        
        try {
            const response = await fetch(`http://worldtimeapi.org/api/timezone/${timezone}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error('Invalid timezone');
            }
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.BULB} Current Time`)
                .setColor(ROYAL_COLORS.ROYAL_BLUE)
                .addFields(
                    { name: 'Timezone', value: data.timezone, inline: true },
                    { name: 'Current Time', value: new Date(data.datetime).toLocaleString(), inline: true },
                    { name: 'UTC Offset', value: data.utc_offset, inline: true },
                    { name: 'Day of Year', value: data.day_of_year.toString(), inline: true },
                    { name: 'Week Number', value: data.week_number.toString(), inline: true }
                )
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Invalid timezone or API error.`, ephemeral: true });
        }
    },
};
