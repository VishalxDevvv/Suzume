const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'password',
    description: 'Generate secure password',
    async execute(message, args) {
        const length = parseInt(args[0]) || 16;
        
        if (length < 8 || length > 64) {
            return message.reply('⚠️ Password length must be between 8-64 characters');
        }

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const embed = new EmbedBuilder()
            .setTitle('🔐 Secure Password Generated')
            .setDescription(`\`\`\`${password}\`\`\``)
            .addFields(
                { name: '📏 Length', value: `${length} characters`, inline: true },
                { name: '🛡️ Strength', value: length >= 16 ? 'Very Strong' : length >= 12 ? 'Strong' : 'Medium', inline: true }
            )
            .setColor('#FF6B35')
            .setFooter({ text: '⚠️ Delete this message after copying' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
