const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'crypto',
    description: 'Get cryptocurrency prices',
    execute(message, args) {
        const coin = args[0] || 'bitcoin';
        
        axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`)
            .then(response => {
                const data = response.data[coin];
                if (!data) {
                    return message.reply(`${ROYAL_EMOJIS.ERROR} Cryptocurrency "${coin}" not found!`);
                }
                
                const change = data.usd_24h_change;
                const changeEmoji = change > 0 ? '📈' : '📉';
                
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.CRYPTO} ${coin.toUpperCase()} Price`,
                    description: `${ROYAL_EMOJIS.DIAMOND} **$${data.usd.toLocaleString()}**\n\n${changeEmoji} **24h Change:** ${change.toFixed(2)}%`,
                    color: change > 0 ? ROYAL_COLORS.EMERALD : ROYAL_COLORS.CRIMSON,
                    footer: { text: 'Powered by CoinGecko' }
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch crypto data!`);
            });
    }
};
