const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'urban',
    description: 'Urban Dictionary lookup',
    execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide a term to look up! Example: \`$urban yeet\``);
        }
        
        const term = args.join(' ');
        
        axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`)
            .then(response => {
                const definitions = response.data.list;
                if (!definitions.length) {
                    return message.reply(`${ROYAL_EMOJIS.ERROR} No definition found for "${term}"!`);
                }
                
                const def = definitions[0];
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.BULB} ${def.word}`,
                    description: `**Definition:**\n${def.definition.substring(0, 1000)}\n\n**Example:**\n${def.example.substring(0, 500)}`,
                    color: ROYAL_COLORS.ROYAL_BLUE,
                    fields: [
                        { name: 'Thumbs Up', value: def.thumbs_up.toString(), inline: true },
                        { name: 'Thumbs Down', value: def.thumbs_down.toString(), inline: true }
                    ],
                    footer: { text: 'Urban Dictionary' }
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch definition!`);
            });
    }
};
