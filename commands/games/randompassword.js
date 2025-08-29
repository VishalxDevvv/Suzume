const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'randompassword',
    description: 'Generate a secure random password',
    execute(message, args) {
        const length = args[0] ? parseInt(args[0]) : 12;
        
        if (length < 4 || length > 50) {
            return message.reply(`${ROYAL_EMOJIS.WARNING} Password length must be between 4 and 50 characters!`);
        }

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const embed = RoyalStyler.createRoyalEmbed({
            title: '🔐 Random Password',
            description: `**Generated Password:** ||${password}||\n**Length:** ${length} characters`,
            color: ROYAL_COLORS.CRIMSON,
            fields: [
                { name: 'Security Tips', value: '• Never share your password\n• Use unique passwords for each account\n• Consider using a password manager', inline: false }
            ],
            footer: { text: 'Password is hidden - click to reveal' }
        });

        message.reply({ embeds: [embed] });
    }
};
