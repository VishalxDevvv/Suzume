const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const Economy = require('../../economy');

module.exports = {
    name: 'cash',
    aliases: ['balance', 'bal', 'money', 'wallet'],
    description: 'Check your global suzu cash balance',
    async execute(message, args) {
        const userId = message.author.id;
        const user = Economy.getUser(userId);
        
        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.DIAMOND} ${message.author.username}'s Wallet`,
            description: `<a:cash:1412109414516789380> **${user.balance.toLocaleString()}** suzu cash`,
            color: ROYAL_COLORS.EMERALD,
            thumbnail: message.author.displayAvatarURL({ dynamic: true }),
            footer: { text: '©Vishal' }
        });
        
        return message.reply({ embeds: [embed] });
    }
};
