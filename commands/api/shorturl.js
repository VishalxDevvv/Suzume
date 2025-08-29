const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'shorturl',
    description: 'Shorten a URL',
    execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide a URL to shorten! Example: \`$shorturl https://google.com\``);
        }
        
        const url = args[0];
        
        axios.post('https://cleanuri.com/api/v1/shorten', { url: url })
            .then(response => {
                const shortUrl = response.data.result_url;
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.SUCCESS} URL Shortened`,
                    description: `${ROYAL_EMOJIS.DIAMOND} **Original:** ${url}\n\n${ROYAL_EMOJIS.ROCKET} **Shortened:** ${shortUrl}`,
                    color: ROYAL_COLORS.EMERALD,
                    footer: { text: 'Powered by CleanURI' }
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to shorten URL! Make sure it's a valid URL.`);
            });
    }
};
