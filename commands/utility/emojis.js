const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'emojis',
    description: 'Show all custom bot emojis',
    execute(message, args) {
        const embed = RoyalStyler.createRoyalEmbed({
            title: 'Custom Bot Emojis',
            description: `${ROYAL_EMOJIS.SPARKLES} Here are all the custom emojis this bot uses!`,
            color: ROYAL_COLORS.PURPLE,
            fields: [
                {
                    name: 'Status Emojis',
                    value: `${ROYAL_EMOJIS.SUCCESS} Success\n${ROYAL_EMOJIS.ERROR} Error\n${ROYAL_EMOJIS.WARNING} Warning\n${ROYAL_EMOJIS.INFO} Info\n${ROYAL_EMOJIS.LOADING} Loading`,
                    inline: true
                },
                {
                    name: 'Fun Emojis',
                    value: `${ROYAL_EMOJIS.CUTE} Cute\n${ROYAL_EMOJIS.LAUGH} Laugh\n${ROYAL_EMOJIS.LOVE} Love\n${ROYAL_EMOJIS.HELLO} Hello\n${ROYAL_EMOJIS.WELCOME} Welcome`,
                    inline: true
                }
            ],
            footer: {
                text: 'These emojis are used throughout the bot commands!'
            }
        });

        message.reply({ embeds: [embed] });
    }
};
