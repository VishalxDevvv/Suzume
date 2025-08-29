const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shorten',
    description: 'Shorten a URL',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide a URL to shorten! Usage: `$shorten <url>`');
        }

        try {
            const url = args[0];
            
            // Basic URL validation
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return message.reply('Please provide a valid URL starting with http:// or https://');
            }

            const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
            const shortUrl = await response.text();

            if (shortUrl.includes('Error')) {
                return message.reply('Failed to shorten URL! Please check if the URL is valid.');
            }

            const embed = new EmbedBuilder()
                .setTitle('🔗 URL Shortener')
                .addFields(
                    { name: '📝 Original URL', value: url.length > 100 ? url.substring(0, 100) + '...' : url, inline: false },
                    { name: 'ROYAL_EMOJIS.SUCCESS Shortened URL', value: shortUrl, inline: false }
                )
                .setColor('#3b82f6')
                .setFooter({ text: 'is.gd URL Shortener' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('URL shortener error:', error);
            message.reply('Failed to shorten URL!');
        }
    }
};
