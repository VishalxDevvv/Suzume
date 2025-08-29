const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randomuser',
    description: 'Generate a random user profile',
    async execute(message, args) {
        try {
            const response = await fetch('https://randomuser.me/api/');
            const data = await response.json();
            const user = data.results[0];

            const embed = RoyalStyler.createRoyalEmbed({
                title: '👤 Random User Profile',
                description: `**${user.name.title} ${user.name.first} ${user.name.last}**`,
                color: ROYAL_COLORS.ROYAL_BLUE,
                thumbnail: user.picture.large,
                fields: [
                    { name: 'Email', value: user.email, inline: true },
                    { name: 'Phone', value: user.phone, inline: true },
                    { name: 'Age', value: user.dob.age.toString(), inline: true },
                    { name: 'Location', value: `${user.location.city}, ${user.location.country}`, inline: false },
                    { name: 'Username', value: user.login.username, inline: true }
                ],
                footer: { text: 'Source: RandomUser API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to generate random user!`);
        }
    }
};
