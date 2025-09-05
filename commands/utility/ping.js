const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'ping',
    description: 'Check bot latency',
    async execute(message, args) {
        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.PING} Pong!`,
            description: `Latency: ${message.client.ws.ping}ms`,
            color: ROYAL_COLORS.GREEN
        });
        message.reply({ embeds: [embed] });
    }
};
