const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'pokemon',
    description: 'Get Pokemon information',
    execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide a Pokemon name! Example: \`$pokemon pikachu\``);
        }

        const pokemon = args[0].toLowerCase();
        
        axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
            .then(response => {
                const data = response.data;
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.STAR} ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}`,
                    description: `${ROYAL_EMOJIS.DIAMOND} Pokemon #${data.id}`,
                    color: ROYAL_COLORS.EMERALD,
                    thumbnail: data.sprites.front_default,
                    fields: [
                        { name: 'Height', value: `${data.height / 10}m`, inline: true },
                        { name: 'Weight', value: `${data.weight / 10}kg`, inline: true },
                        { name: 'Type(s)', value: data.types.map(type => type.type.name).join(', '), inline: true },
                        { name: 'Base Stats', value: data.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join('\n'), inline: false }
                    ]
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Pokemon "${pokemon}" not found!`);
            });
    }
};
