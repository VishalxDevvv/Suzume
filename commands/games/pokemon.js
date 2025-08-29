const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'pokemon',
    description: 'Get information about a Pokemon',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide a Pokemon name! Example: \`$pokemon pikachu\``);
        }

        try {
            const pokemonName = args[0].toLowerCase();
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            
            if (!response.ok) {
                return message.reply(`${ROYAL_EMOJIS.ERROR} Pokemon "${args[0]}" not found!`);
            }

            const data = await response.json();
            
            const types = data.types.map(type => type.type.name).join(', ');
            const abilities = data.abilities.map(ability => ability.ability.name).join(', ');

            const embed = RoyalStyler.createRoyalEmbed({
                title: `⚡ ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}`,
                description: `**ID:** #${data.id}\n**Height:** ${data.height/10}m\n**Weight:** ${data.weight/10}kg`,
                color: ROYAL_COLORS.EMERALD,
                thumbnail: data.sprites.front_default,
                fields: [
                    { name: 'Types', value: types, inline: true },
                    { name: 'Abilities', value: abilities, inline: true },
                    { name: 'Base Experience', value: data.base_experience.toString(), inline: true }
                ],
                footer: { text: 'Source: PokeAPI' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch Pokemon data!`);
        }
    }
};
