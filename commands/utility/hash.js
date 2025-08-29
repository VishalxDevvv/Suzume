const { EmbedBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
    name: 'hash',
    description: 'Generate hash of text',
    async execute(message, args) {
        const text = args.join(' ');
        
        if (!text) {
            return message.reply('⚠️ Usage: `+hash <text>`');
        }

        const md5 = crypto.createHash('md5').update(text).digest('hex');
        const sha1 = crypto.createHash('sha1').update(text).digest('hex');
        const sha256 = crypto.createHash('sha256').update(text).digest('hex');

        const embed = new EmbedBuilder()
            .setTitle('🔐 Hash Generator')
            .addFields(
                { name: 'MD5', value: `\`${md5}\``, inline: false },
                { name: 'SHA1', value: `\`${sha1}\``, inline: false },
                { name: 'SHA256', value: `\`${sha256}\``, inline: false }
            )
            .setColor('#8A2BE2')
            .setFooter({ text: '🔒 Cryptographic hashes generated' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
