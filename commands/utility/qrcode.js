const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'qrcode',
    description: 'Generate a QR code',
    execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide text to encode! Example: \`$qrcode Hello World\``);
        }

        const text = args.join(' ');
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;

        const embed = RoyalStyler.createRoyalEmbed({
            title: '📱 QR Code Generator',
            description: `**Text:** ${text}`,
            color: ROYAL_COLORS.ROYAL_BLUE,
            image: qrUrl,
            footer: { text: 'Scan with your phone camera' }
        });

        message.reply({ embeds: [embed] });
    }
};
