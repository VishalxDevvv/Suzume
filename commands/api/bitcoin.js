const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'bitcoin',
    description: 'Get current Bitcoin price',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
            const data = await response.json();
            
            const price = data.bpi.USD.rate;
            const lastUpdated = data.time.updated;

            const embed = RoyalStyler.createRoyalEmbed({
                title: '₿ Bitcoin Price',
                description: `**Current Price:** $${price}\n**Last Updated:** ${lastUpdated}`,
                color: ROYAL_COLORS.GOLD,
                thumbnail: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                footer: { text: 'Source: CoinDesk API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch Bitcoin price!`);
        }
    }
};
