const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shorten',
    description: 'Shorten a URL',
    async execute(message, args) {
        const url = args[0];
        
        if (!url || !url.startsWith('http')) {
            return message.reply('⚠️ Usage: `+shorten <url>`');
        }

        try {
            const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
            const shortUrl = await response.text();

            if (shortUrl.includes('Error')) {
                return message.reply('❌ Failed to shorten URL');
            }

            const embed = new EmbedBuilder()
                .setTitle('🔗 URL Shortened')
                .addFields(
                    { name: '📎 Original', value: `\`${url}\``, inline: false },
                    { name: '⚡ Shortened', value: `\`${shortUrl}\``, inline: false }
                )
                .setColor('#4169E1')
                .setFooter({ text: '🔒 Use shortened URLs responsibly' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to shorten URL');
        }
    }
};
