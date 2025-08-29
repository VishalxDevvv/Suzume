const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'translate',
    description: 'Translate text to English',
    execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide text to translate! Example: \`$translate Hola mundo\``);
        }
        
        const text = args.join(' ');
        
        axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|en`)
            .then(response => {
                const translation = response.data.responseData.translatedText;
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.BULB} Translation`,
                    description: `${ROYAL_EMOJIS.DIAMOND} **Original:** ${text}\n\n${ROYAL_EMOJIS.SUCCESS} **English:** ${translation}`,
                    color: ROYAL_COLORS.EMERALD,
                    footer: { text: 'Powered by MyMemory' }
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to translate text!`);
            });
    }
};
