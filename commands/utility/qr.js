const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'qr',
    description: 'Generate a QR code',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide text to generate QR code! Usage: `+qr <text>`');
        }

        const text = args.join(' ');
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
        
        const embed = new EmbedBuilder()
            .setTitle('📱 QR Code Generated')
            .setDescription(`**Text:** ${text}`)
            .setImage(qrUrl)
            .setColor('#000000')
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
