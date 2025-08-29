const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'translate',
    description: 'Translate text to English',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide text to translate! Example: \`$translate Hola mundo\``);
        }

        try {
            const text = args.join(' ');
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|en`);
            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: '🌐 Translation',
                description: `**Original:** ${text}\n**Translation:** ${data.responseData.translatedText}`,
                color: ROYAL_COLORS.EMERALD,
                fields: [
                    { name: 'Detected Language', value: 'Auto-detected', inline: true },
                    { name: 'Target Language', value: 'English', inline: true }
                ],
                footer: { text: 'Source: MyMemory Translation API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to translate text!`);
        }
    }
};
