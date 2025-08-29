const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'avatar',
    description: 'Get user avatar',
    execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        
        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.VISUAL} ${user.username}'s Avatar`,
            description: `${ROYAL_EMOJIS.DIAMOND} Click the image to view full size`,
            color: ROYAL_COLORS.GOLD,
            image: user.displayAvatarURL({ size: 512 }),
            url: user.displayAvatarURL({ size: 512 })
        });
        message.reply({ embeds: [embed] });
    }
};
