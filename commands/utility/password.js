const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'password',
    description: 'Generate a secure password',
    async execute(message, args) {
        const length = args[0] ? parseInt(args[0]) : 12;
        if (length < 4 || length > 50) {
            return message.reply('Password length must be between 4 and 50 characters!');
        }
        
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🔐 Secure Password Generated')
            .setDescription(`\`\`\`${password}\`\`\``)
            .addFields({ name: 'Length', value: length.toString(), inline: true })
            .setColor('#800080')
            .setFooter({ text: 'Keep this password safe and secure!' })
            .setTimestamp();
        
        try {
            await message.author.send({ embeds: [embed] });
            message.reply('🔐 Password sent to your DMs for security!');
        } catch {
            message.reply({ embeds: [embed] });
        }
    }
};
