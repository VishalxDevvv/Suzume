const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'define',
    description: 'Get dictionary definition of a word',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide a word to define! Usage: `$define <word>`');
        }

        try {
            const word = args[0].toLowerCase();
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            
            if (!response.ok) {
                return message.reply('Word not found in dictionary!');
            }

            const data = await response.json();
            const entry = data[0];
            const meaning = entry.meanings[0];
            const definition = meaning.definitions[0];

            const embed = new EmbedBuilder()
                .setTitle(`📚 ${entry.word}`)
                .setDescription(`**${meaning.partOfSpeech}**\n\n${definition.definition}`)
                .setColor('#4ade80')
                .setFooter({ text: 'Dictionary API' })
                .setTimestamp();

            if (definition.example) {
                embed.addFields({ name: '${ROYAL_EMOJIS.BULB} Example', value: `"${definition.example}"`, inline: false });
            }

            if (entry.phonetics && entry.phonetics[0] && entry.phonetics[0].text) {
                embed.addFields({ name: '🔊 Pronunciation', value: entry.phonetics[0].text, inline: true });
            }

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Dictionary API error:', error);
            message.reply('Failed to fetch definition!');
        }
    }
};
