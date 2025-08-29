const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'dictionary',
    description: 'Look up word definitions',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide a word to look up! Example: \`$dictionary hello\``);
        }

        try {
            const word = args[0].toLowerCase();
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            
            if (!response.ok) {
                return message.reply(`${ROYAL_EMOJIS.ERROR} Word "${args[0]}" not found in dictionary!`);
            }

            const data = await response.json();
            const entry = data[0];
            const meaning = entry.meanings[0];
            const definition = meaning.definitions[0];

            const embed = RoyalStyler.createRoyalEmbed({
                title: `📚 Dictionary: ${entry.word}`,
                description: `**Part of Speech:** ${meaning.partOfSpeech}\n**Definition:** ${definition.definition}`,
                color: ROYAL_COLORS.EMERALD,
                fields: [
                    { name: 'Example', value: definition.example || 'No example available', inline: false },
                    { name: 'Phonetic', value: entry.phonetic || 'Not available', inline: true }
                ],
                footer: { text: 'Source: Free Dictionary API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch word definition!`);
        }
    }
};
