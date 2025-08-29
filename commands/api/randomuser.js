const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomuser')
        .setDescription('Generate a random user profile'),
    
    async execute(interaction) {
        try {
            const response = await fetch('https://randomuser.me/api/');
            const data = await response.json();
            const user = data.results[0];
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.STATS} Random User Profile`)
                .setColor(ROYAL_COLORS.ROYAL_BLUE)
                .setThumbnail(user.picture.large)
                .addFields(
                    { name: 'Name', value: `${user.name.first} ${user.name.last}`, inline: true },
                    { name: 'Gender', value: user.gender, inline: true },
                    { name: 'Age', value: user.dob.age.toString(), inline: true },
                    { name: 'Email', value: user.email, inline: false },
                    { name: 'Location', value: `${user.location.city}, ${user.location.country}`, inline: true },
                    { name: 'Phone', value: user.phone, inline: true }
                )
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to fetch random user data.`, ephemeral: true });
        }
    },
};
