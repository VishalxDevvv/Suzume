const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'qr',
    description: 'Generate QR code',
    execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide text to encode! Example: \`$qr Hello World\``);
        }
        
        const text = args.join(' ');
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
        
        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.VISUAL} QR Code Generated`,
            description: `${ROYAL_EMOJIS.SUCCESS} QR code for: **${text}**`,
            color: ROYAL_COLORS.ROYAL_BLUE,
            image: qrUrl
        });
        message.reply({ embeds: [embed] });
    }
};
